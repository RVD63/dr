
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { getChatResponse } from '../services/geminiService';

interface ChatAssistantProps {
  isHighContrast: boolean;
  lang: Language;
  t: (key: string) => string;
}

const EMERGENCY_KEYWORDS = [
  'pain', 'blind', 'loss of vision', 'flash', 'curtain', 'hurt', 'emergency', 'sudden', // English
  'दर्द', 'अंधा', 'रोशनी', 'आपातकालीन', // Hindi
  'வலி', 'பார்வை இழப்பு', 'அவசரம்', // Tamil
  'నొప్పి', 'చూపు', 'అత్యవసర', // Telugu
  'ನೋವು', 'ದೃಷ್ಟಿ', 'ತುರ್ತು' // Kannada
];

const ChatAssistant: React.FC<ChatAssistantProps> = ({ isHighContrast, lang, t }) => {
  const prevLangRef = useRef<Language>(lang);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: t('chatWelcome'),
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (prevLangRef.current !== lang) {
      if (messages.length === 1 && messages[0].id === 'welcome') {
         setMessages([{
            id: 'welcome',
            role: 'model',
            text: t('chatWelcome'),
            timestamp: Date.now()
         }]);
      }
      prevLangRef.current = lang;
    }
  }, [lang, t, messages.length]);

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    triggerHaptic();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const lowerText = text.toLowerCase();
    const isEmergency = EMERGENCY_KEYWORDS.some(keyword => lowerText.includes(keyword));

    if (isEmergency) {
      setTimeout(() => {
        const emergencyMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: t('emergencyAlert'),
          timestamp: Date.now(),
          isEmergency: true
        };
        setMessages(prev => [...prev, emergencyMsg]);
        setIsLoading(false);
        const u = new SpeechSynthesisUtterance(t('emergencyAudio'));
        u.lang = lang; 
        window.speechSynthesis.speak(u);
      }, 500);
      return;
    }

    try {
      const responseText = await getChatResponse(messages, text, lang);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickReplies = [
    t('chatQr1'),
    t('chatQr2'),
    t('chatQr3'),
    t('chatQr4')
  ];

  return (
    // Height calculation: 100vh minus (Header approx 80px + BottomNav 64px + Padding) for mobile
    // Fallback to 80vh for Desktop
    <div className={`flex flex-col h-[calc(100vh-12rem)] md:h-[80vh] rounded-3xl overflow-hidden shadow-2xl border ${isHighContrast ? 'bg-[#FFFDD0] border-black' : 'bg-white border-slate-200'} animate-in slide-in-from-bottom-4 duration-500`}>
      
      {/* Header */}
      <div className={`p-4 md:p-6 border-b flex items-center justify-between flex-shrink-0 ${isHighContrast ? 'bg-black text-[#FFFDD0] border-black' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${isHighContrast ? 'bg-[#FFFDD0] text-black' : 'bg-blue-600 text-white'}`}>
            <i className="fas fa-robot text-lg md:text-xl"></i>
          </div>
          <div>
            <h2 className={`text-lg md:text-xl font-bold ${isHighContrast ? 'tracking-wider' : 'text-slate-900'}`}>{t('chatAssistantTitle')}</h2>
            <p className={`text-xs md:text-sm font-medium ${isHighContrast ? 'opacity-80' : 'text-slate-500'}`}>{t('chatAssistantSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`
                max-w-[90%] md:max-w-[85%] p-4 md:p-5 rounded-2xl text-base md:text-lg font-medium leading-relaxed
                ${msg.isEmergency 
                  ? 'bg-red-600 text-white border-4 border-red-800 animate-pulse' 
                  : msg.role === 'user' 
                    ? (isHighContrast ? 'bg-black text-[#FFFDD0]' : 'bg-blue-600 text-white rounded-tr-none') 
                    : (isHighContrast ? 'bg-white border-2 border-black text-black' : 'bg-slate-100 text-slate-800 rounded-tl-none')
                }
              `}
            >
              {msg.isEmergency && <div className="font-black uppercase mb-2 text-lg md:text-xl"><i className="fas fa-exclamation-triangle mr-2"></i>Urgent</div>}
              {msg.text}
              {msg.isEmergency && (
                 <button className="mt-4 w-full bg-white text-red-600 font-black py-3 rounded-xl uppercase tracking-widest hover:bg-gray-100 transition-colors">
                    {t('emergencyCall')}
                 </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`p-4 rounded-2xl ${isHighContrast ? 'bg-white border-2 border-black' : 'bg-slate-100'}`}>
              <div className="flex space-x-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-slate-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies & Input */}
      <div className={`p-3 md:p-4 flex-shrink-0 ${isHighContrast ? 'bg-[#FFFDD0] border-t-2 border-black' : 'bg-white border-t border-slate-100'}`}>
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => handleSend(reply)}
              className={`
                whitespace-nowrap px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm transition-transform active:scale-95
                ${isHighContrast 
                  ? 'bg-white border-2 border-black text-black shadow-none hover:bg-black hover:text-[#FFFDD0]' 
                  : 'bg-slate-100 text-blue-600 hover:bg-blue-50 border border-slate-200'
                }
              `}
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex gap-2 md:gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder={t('chatPlaceholder')}
            className={`
              flex-grow p-3 md:p-4 rounded-xl text-base md:text-lg outline-none border-2 transition-all
              ${isHighContrast 
                ? 'bg-white border-black text-black placeholder-gray-600 focus:ring-4 focus:ring-black/20' 
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400 focus:ring-4 focus:ring-blue-50'
              }
            `}
          />
          <button
            onClick={() => handleSend(input)}
            className={`
              w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-transform active:scale-90 flex-shrink-0
              ${isHighContrast ? 'bg-black text-[#FFFDD0]' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'}
            `}
            aria-label="Send Message"
          >
            <i className="fas fa-paper-plane text-lg md:text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
