
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import React, { useState, useRef, useEffect } from 'react';
import { Transaction, GroundingSource } from '../types.ts';

interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
}

interface LiveVoiceAssistantProps {
  transactions: Transaction[];
  userName: string;
}

const LiveVoiceAssistant: React.FC<LiveVoiceAssistantProps> = ({ transactions, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const initChat = () => {
    if (chatRef.current) return chatRef.current;
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are a professional financial co-pilot for ${userName}. 
        CONTEXT: You have access to the user's recent transactions: ${JSON.stringify(transactions.slice(-20))}.
        GROUNDING: Use the Google Search tool to verify information about companies, market trends, or financial regulations if asked.
        GOAL: Help the user understand their spending, risk levels, and financial health.
        STYLE: Be precise, analytical, and professional. Keep answers concise. Use plain text only.`,
        tools: [{ googleSearch: {} }]
      },
    });
    chatRef.current = chat;
    return chat;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const chat = initChat();
      const stream = await chat.sendMessageStream({ message: userMessage });
      
      let fullResponse = '';
      let sources: GroundingSource[] = [];
      
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        const part = chunk as GenerateContentResponse;
        const textChunk = part.text || '';
        fullResponse += textChunk;
        
        // Extract grounding sources if present in the chunk
        const metadata = part.candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks) {
          metadata.groundingChunks.forEach((chunk: any) => {
            if (chunk.web && chunk.web.uri) {
              if (!sources.find(s => s.uri === chunk.web.uri)) {
                sources.push({
                  title: chunk.web.title || 'Source',
                  uri: chunk.web.uri
                });
              }
            }
          });
        }
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: 'model', 
            text: fullResponse,
            sources: sources.length > 0 ? sources : undefined
          };
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat failed:", err);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the financial core. Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleAssistant = () => {
    if (!isOpen) initChat();
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-80 md:w-96 mb-6 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-500 max-h-[500px]">
          {/* Header */}
          <div className="bg-indigo-600 p-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest block leading-none">RiskRadar Bot</span>
                <span className="text-[10px] font-bold opacity-60">Search Grounding Enabled</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm font-medium italic leading-relaxed">
                  "Is there any recent news about AWS pricing in India?"
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                    {m.sources.map((source, sIdx) => (
                      <a 
                        key={sIdx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors truncate max-w-[150px]"
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Query financial state or news..."
              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold theme-text focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-30 transition-all hover:bg-indigo-700 active:scale-90"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"></path></svg>
            </button>
          </form>
        </div>
      )}

      {/* Trigger Bubble */}
      <button
        onClick={toggleAssistant}
        className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all active:scale-95 group bg-indigo-600 hover:bg-indigo-700`}
      >
        {isOpen ? (
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
        ) : (
          <div className="relative">
            <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-white"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
};

export default LiveVoiceAssistant;
