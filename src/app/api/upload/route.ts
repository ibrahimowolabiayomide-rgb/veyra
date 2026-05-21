import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const folder = (formData.get('folder') as string) || 'products';

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // Validate file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, or WebP' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Max 10MB' }, { status: 400 });
  }

  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // Fallback: use Supabase Storage
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${session.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      
      const { data, error } = await supabase.storage
        .from('veyra-uploads')
        .upload(`${folder}/${filename}`, buffer, { contentType: file.type, upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('veyra-uploads').getPublicUrl(data.path);
      return NextResponse.json({ url: publicUrl, path: data.path });
    }

    // Upload to Cloudinary
    const timestamp = Math.round(Date.now() / 1000);
    const uploadFolder = `veyra/${folder}/${session.user.id}`;
    
    const formDataCloud = new FormData();
    formDataCloud.append('file', file);
    formDataCloud.append('upload_preset', 'veyra_uploads');
    formDataCloud.append('folder', uploadFolder);
    formDataCloud.append('timestamp', timestamp.toString());

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formDataCloud,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || 'Upload failed');

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
