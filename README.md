# VEYRA — Fashion Meets Intelligence

A premium AI-powered fashion marketplace built with Next.js, Supabase, and OpenAI.

---

## 🚀 QUICK START (Run Locally)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```
Fill in all values (see setup guides below).

### 3. Set Up Supabase Database
- Go to [supabase.com](https://supabase.com) → New Project
- Go to SQL Editor → paste the entire contents of `src/lib/schema.sql` → Run
- Copy your Project URL and anon key into `.env.local`

### 4. Enable Google Auth (Optional)
- In Supabase → Authentication → Providers → Google → Enable
- Add `http://localhost:3000/auth/callback` to Redirect URLs

### 5. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 DEPLOY TO VERCEL (Go Live)

1. Push this folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add all your `.env.local` values as Environment Variables in Vercel
4. Click Deploy → Your site is LIVE ✦

---

## 📱 MAKE IT INSTALLABLE (PWA)

### Chrome / Desktop Install:
Once deployed, users visiting your site will see an "Install" button in the browser address bar. That's it — it works as a Chrome App automatically because of the PWA setup.

### Android Play Store:
1. Deploy to Vercel first
2. Go to [pwabuilder.com](https://pwabuilder.com)
3. Enter your live URL → Generate → Download Android Package
4. Upload the `.aab` file to Google Play Console

### iOS App Store:
1. Same as above but choose iOS on PWABuilder
2. Needs an Apple Developer account ($99/yr)

---

## 🔑 API KEYS SETUP

### Supabase (Free)
1. supabase.com → New Project
2. Settings → API → Copy URL + anon key

### OpenAI (Paid, ~$5 to start)
1. platform.openai.com → API Keys → Create new key
2. Add billing at platform.openai.com/account/billing

### Paystack (Free to set up)
1. dashboard.paystack.com → Sign up
2. Settings → API Keys → Copy Public + Secret key

### Flutterwave (Free to set up)
1. dashboard.flutterwave.com → Sign up
2. Settings → API Keys → Copy keys

### Cloudinary (Free tier)
1. cloudinary.com → Sign up free
2. Dashboard → Copy Cloud Name, API Key, API Secret

---

## 📁 PROJECT STRUCTURE

```
src/
├── app/
│   ├── page.tsx              # Home / Landing page
│   ├── marketplace/          # Product listings
│   ├── ai-stylist/           # AI chat stylist
│   ├── product/[id]/         # Product detail
│   ├── cart/                 # Shopping cart
│   ├── checkout/             # Checkout flow
│   ├── auth/login/           # Login
│   ├── auth/signup/          # Signup
│   ├── dashboard/seller/     # Seller dashboard
│   ├── dashboard/admin/      # Admin panel
│   └── api/
│       └── ai-stylist/       # OpenAI API route
├── components/
│   └── layout/Navbar.tsx     # Navigation
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── supabase-server.ts    # Server-side Supabase
│   └── schema.sql            # Full database schema
└── store/
    └── cart.ts               # Cart state (Zustand)
```

---

## 🛠 TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google) |
| AI | OpenAI GPT-4o |
| Payments | Paystack, Flutterwave |
| State | Zustand |
| Charts | Recharts |
| PWA | next-pwa |
| Deployment | Vercel |

---

## 🎨 BRAND COLORS

- Background: `#0B0B0B`
- Gold Accent: `#C8A96B`
- AI Gradient: `#8B5CF6 → #3B82F6`
- Muted Text: `#A1A1AA`

---

## 📞 NEXT STEPS

After going live:
1. Add real product images (Cloudinary)
2. Connect Paystack checkout (`/checkout` page)
3. Add product upload form for sellers
4. Set up email notifications (Supabase Edge Functions + Resend)
5. Add AI Virtual Try-On (Replicate API)

Built with ✦ by VEYRA
