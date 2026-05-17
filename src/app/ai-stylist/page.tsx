'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Recommendation[];
}

interface Recommendation {
  id: string;
  name: string;
  price: number;
  category: string;
  reason: string;
  accent: string;
}

const QUICK_PROMPTS = [
  'Black oversized streetwear outfit under ₦30k',
  'Elegant wedding guest look for a woman',
  'Smart casual outfit for a job interview',
  'Native wear for a traditional ceremony',
  'Comfortable weekend outfit with sneakers',
  'Luxury date night outfit',
];

const MOCK_RECS: Record<string, Recommendation[]> = {
  default: [
    { id: '1', name: 'Oversized Black Hoodie', price: 12500, category: 'Streetwear', reason: 'Perfect oversized fit', accent: '#8B5CF6' },
    { id: '2', name: 'Cargo Street Pants', price: 8999, category: 'Streetwear', reason: 'Matches the vibe perfectly', accent: '#3B82F6' },
    { id: '3', name: 'Chunky Platform Sneakers', price: 18750, category: 'Sneakers', reason: 'Elevates the whole look', accent: '#4ade80' },
    { id: '4', name: 'Mini Crossbody Bag', price: 7500, category: 'Accessories', reason: 'Completes the outfit', accent: '#C8A96B' },
  ],
};

export default function AIStylistPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your VEYRA AI Stylist. Tell me what you're looking for — describe the occasion, your style vibe, or a budget — and I'll curate the perfect outfit for you. ✦",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    const userMsg: Message = { role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: messages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          recommendations: data.recommendations || MOCK_RECS.default,
        },
      ]);
    } catch {
      // Fallback demo response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Perfect choice! Here's a complete outfit curated just for you based on "${userText}". I've selected pieces that work together harmoniously and fit your described style:`,
          recommendations: MOCK_RECS.default,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (rec: Recommendation) => {
    addItem({ id: rec.id, productId: rec.id, name: rec.name, price: rec.price, image: '', sellerName: 'VEYRA Curated' });
    toast.success(`${rec.name} added to cart!`);
  };

  return (
    <div className="min-h-screen pt-[70px] flex flex-col lg:flex-row max-w-[1400px] mx-auto px-4 lg:px-12 py-8 gap-6">

      {/* Sidebar */}
      <aside className="lg:w-72 flex-shrink-0">
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-sm font-medium">VEYRA AI Stylist</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Online · Powered by GPT-4o
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Describe your style in natural language. I'll recommend complete outfits from verified sellers.
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted mb-4">Quick Prompts</p>
          <div className="flex flex-col gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button key={p} onClick={() => sendMessage(p)}
                className="text-left text-xs text-muted hover:text-white bg-white/03 hover:bg-white/06 border border-white/07 hover:border-white/15 rounded-xl px-3 py-2.5 transition-all leading-relaxed">
                {p}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="glass rounded-2xl flex flex-col flex-1 overflow-hidden" style={{ minHeight: '70vh' }}>
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/07">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-muted ml-2">AI Stylist — Chat</span>
            </div>
            <button onClick={() => setMessages([{ role: 'assistant', content: "Hi! I'm your VEYRA AI Stylist. What are we styling today? ✦" }])}
              className="flex items-center gap-1 text-xs text-muted hover:text-white transition-colors">
              <RefreshCw size={12} /> New chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-3`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500/25 to-blue-500/25 border border-purple-500/20 rounded-br-sm text-white'
                      : 'bg-white/04 border border-white/08 rounded-bl-sm text-white/90'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Recommendation cards */}
                  {msg.recommendations && (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {msg.recommendations.map((rec) => (
                        <div key={rec.id} className="bg-[#111] border border-white/07 hover:border-white/15 rounded-xl p-3 transition-all group">
                          <div className="w-full aspect-video rounded-lg mb-2 flex items-center justify-center text-2xl"
                            style={{ background: `${rec.accent}12` }}>
                            <span className="font-display opacity-20 text-4xl" style={{ color: rec.accent }}>
                              {rec.name.charAt(0)}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted uppercase tracking-wider mb-0.5">{rec.category}</p>
                          <p className="text-xs font-medium text-white mb-0.5 leading-tight">{rec.name}</p>
                          <p className="text-[10px] text-muted mb-2 italic">"{rec.reason}"</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gold">₦{rec.price.toLocaleString()}</span>
                            <button onClick={() => handleAddToCart(rec)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] bg-gold/10 hover:bg-gold/20 border border-gold/25 text-gold rounded-full px-2 py-0.5">
                              <ShoppingCart size={9} /> Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/04 border border-white/08 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/07">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your style, occasion, or budget…"
                disabled={loading}
                className="flex-1 bg-[#0B0B0B] border border-white/10 focus:border-gold/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none transition-colors"
              />
              <button type="submit" disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-40 rounded-xl px-4 py-2.5 text-white transition-all flex items-center gap-1.5 text-sm">
                <Send size={14} /> Style me
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
