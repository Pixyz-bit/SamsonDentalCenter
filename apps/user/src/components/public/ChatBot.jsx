import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

const DEFAULT_MESSAGES = [
    {
        id: 'm1',
        role: 'assistant',
        content: 'Welcome to Samson Dental. How can I assist with your clinical inquiry today?',
    },
    { id: 'm2', role: 'user', content: 'Tell me about your 3D scanning.' },
    {
        id: 'm3',
        role: 'assistant',
        content:
            'Our iTero Element 5D scanner provides precise diagnostics and zero radiation exposure.',
    },
];

const FAQ_ITEMS = [
    {
        q: 'How do I book an appointment?',
        a: 'You can book online in the booking section, or message me with your preferred date/time and I’ll guide you.',
    },
    {
        q: 'What are your hours?',
        a: 'Hours vary by day. If you tell me the day you want, I can confirm availability and next open slots.',
    },
    {
        q: 'Do you accept insurance?',
        a: 'We work with many plans. Share your provider name and I’ll help you confirm coverage options.',
    },
    {
        q: 'Is 3D scanning safe?',
        a: 'Yes. The iTero scanner uses optical scanning (no radiation) and is used for accurate digital impressions.',
    },
];

const ChatBot = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState(DEFAULT_MESSAGES);
    const scrollRef = useRef(null);
    const inputId = useMemo(() => 'samson-ai-chat-input', []);

    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => {
            scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }, 0);
        return () => clearTimeout(t);
    }, [open, messages.length]);

    const sendMessage = () => {
        const text = input.trim();
        if (!text) return;
        setInput('');
        setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }]);

        // Lightweight placeholder response so UI feels alive.
        window.setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: `a-${Date.now()}`,
                    role: 'assistant',
                    content:
                        "I'm here to help. Ask about services, booking, hours, insurance, or symptoms. (AI wiring coming next.)",
                },
            ]);
        }, 450);
    };

    return (
        <div className='fixed bottom-6 right-6 z-50'>
            {open && (
                <div className='mb-4 w-90 max-w-[calc(100vw-3rem)]'>
                    {/* Phone-style Container (matches AIChatbotPromo mockup) */}
                    <div className='rounded-[2.5rem] border border-stone-100 bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden'>
                        {/* Header */}
                        <div className='p-6 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='w-10 h-10 rounded-2xl bg-linear-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-lg'>
                                    <svg
                                        className='w-5 h-5'
                                        fill='currentColor'
                                        viewBox='0 0 20 20'
                                    >
                                        <path d='M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z'></path>
                                        <path d='M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z'></path>
                                    </svg>
                                </div>
                                <div className='text-left'>
                                    <p className='font-black text-xs uppercase tracking-tighter text-stone-900'>
                                        Samson AI Agent
                                    </p>
                                    <div className='flex items-center gap-1.5 mt-0.5'>
                                        <span className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></span>
                                        <span className='text-[8px] font-bold text-green-500 uppercase tracking-widest'>
                                            Neural Engine Active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type='button'
                                onClick={() => setOpen(false)}
                                className='w-9 h-9 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center transition'
                                aria-label='Close chat'
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className='p-6 space-y-4 h-80 overflow-y-auto overscroll-contain'
                        >
                            {messages.map((m) => {
                                const isUser = m.role === 'user';
                                return (
                                    <div
                                        key={m.id}
                                        className={`flex ${isUser ? 'justify-end text-right' : 'justify-start text-left'}`}
                                    >
                                        <div
                                            className={
                                                isUser
                                                    ? 'bg-red-600 text-white rounded-2xl rounded-tr-none px-4 py-3.5 max-w-[85%] text-sm font-semibold leading-relaxed shadow-lg shadow-red-500/10'
                                                    : 'rounded-2xl rounded-tl-none px-4 py-3.5 max-w-[85%] text-sm font-medium leading-relaxed bg-stone-50 text-stone-700 border border-stone-100'
                                            }
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className='p-5 border-t border-stone-100 bg-white'>
                            {/* Horizontal FAQ quick actions (ecommerce-style) */}
                            <div className='mb-3 flex items-center gap-2 overflow-x-auto no-scrollbar'>
                                {FAQ_ITEMS.map((item) => (
                                    <button
                                        key={item.q}
                                        type='button'
                                        onClick={() => {
                                            setMessages((prev) => [
                                                ...prev,
                                                {
                                                    id: `faq-q-${Date.now()}`,
                                                    role: 'user',
                                                    content: item.q,
                                                },
                                                {
                                                    id: `faq-a-${Date.now() + 1}`,
                                                    role: 'assistant',
                                                    content: item.a,
                                                },
                                            ]);
                                        }}
                                        className='shrink-0 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-100 text-xs font-bold text-stone-800 transition'
                                    >
                                        {item.q}
                                    </button>
                                ))}
                            </div>
                            <div className='flex items-center gap-3'>
                                <label
                                    htmlFor={inputId}
                                    className='sr-only'
                                >
                                    Message
                                </label>
                                <div className='h-11 rounded-xl border w-full flex items-center px-4 bg-stone-50 border-stone-100 hover:border-red-200 transition-colors'>
                                    <input
                                        id={inputId}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') sendMessage();
                                        }}
                                        placeholder='Ask a question...'
                                        className='w-full bg-transparent outline-none text-sm text-stone-800 placeholder:text-stone-500'
                                    />
                                </div>

                                <button
                                    type='button'
                                    onClick={sendMessage}
                                    className='h-11 w-11 rounded-xl bg-stone-900 hover:bg-red-600 text-white flex items-center justify-center transition shadow-lg shadow-stone-900/10'
                                    aria-label='Send'
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating action button (hidden while open) */}
            {!open && (
                <button
                    type='button'
                    onClick={() => setOpen(true)}
                    className='w-14 h-14 rounded-full bg-linear-to-tr from-red-600 to-red-500 text-white shadow-2xl shadow-red-500/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95'
                    aria-label='Open AI chat'
                >
                    <MessageCircle size={24} />
                </button>
            )}
        </div>
    );
};

export default ChatBot;
