import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are VEYRA's AI Fashion Stylist — a premium, intelligent fashion assistant for a Nigerian fashion marketplace. 

Your job:
- Understand the user's fashion request (occasion, style, budget, gender preferences)
- Respond with warm, knowledgeable fashion advice
- Always recommend 4 specific clothing/accessory items that form a complete outfit
- Keep budget in Nigerian Naira (₦)
- Be conversational, stylish, and encouraging

After your response text, output a JSON block like this (ALWAYS include it):
<recommendations>
[
  {"id": "1", "name": "Item Name", "price": 12500, "category": "Streetwear", "reason": "Why this works", "accent": "#8B5CF6"},
  {"id": "2", "name": "Item Name", "price": 8999, "category": "Accessories", "reason": "Why this works", "accent": "#3B82F6"},
  {"id": "3", "name": "Item Name", "price": 18000, "category": "Sneakers", "reason": "Why this works", "accent": "#4ade80"},
  {"id": "4", "name": "Item Name", "price": 5500, "category": "Accessories", "reason": "Why this works", "accent": "#C8A96B"}
]
</recommendations>

Categories available: Streetwear, Luxury, Sneakers, Native Wear, Hoodies, Women, Accessories, Bags
Accent colors to use: #8B5CF6, #3B82F6, #4ade80, #C8A96B, #f472b6, #f97316, #60a5fa, #a78bfa`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 800,
      temperature: 0.8,
    });

    const raw = completion.choices[0].message.content || '';
    const recsMatch = raw.match(/<recommendations>([\s\S]*?)<\/recommendations>/);
    const responseText = raw.replace(/<recommendations>[\s\S]*?<\/recommendations>/, '').trim();

    let recommendations = [];
    if (recsMatch) {
      try { recommendations = JSON.parse(recsMatch[1]); } catch {}
    }

    return NextResponse.json({ message: responseText, recommendations });
  } catch (error: any) {
    console.error('AI Stylist error:', error);
    return NextResponse.json({
      message: "I'm having trouble connecting right now. Please try again in a moment! ✦",
      recommendations: [],
    }, { status: 500 });
  }
}
