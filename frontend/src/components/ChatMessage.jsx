import React from 'react';
import { Bot, User } from 'lucide-react';

export default function ChatMessage({ message }) {
  const { sender, content, timestamp } = message;
  const isAi = sender === 'ai';

  // Format database datetime string into a user-friendly local time format
  const formatTime = (timeStr) => {
    try {
      const date = new Date(timeStr);
      // Handles localized formats nicely, e.g. "3:42 PM"
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className={`flex w-full my-4 animate-fade-in ${isAi ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex gap-3 max-w-[80%] md:max-w-[70%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar Bubble */}
        <div className={`
          w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md
          ${isAi 
            ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white' 
            : 'bg-gradient-to-tr from-slate-700 to-slate-900 text-slate-200'
          }
        `}>
          {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>

        {/* Message Content Bubble */}
        <div className="flex flex-col gap-1.5">
          <div className={`
            px-4.5 py-3 rounded-2xl text-[14.5px] leading-relaxed shadow-sm whitespace-pre-wrap select-text
            ${isAi 
              ? 'bg-dark-aiBubble border border-indigo-950/50 text-indigo-100 rounded-tl-sm' 
              : 'bg-dark-userBubble border border-slate-700/30 text-slate-100 rounded-tr-sm'
            }
          `}>
            {content}
          </div>
          
          {/* Timestamp Indicator */}
          <span className={`text-[10px] text-slate-500 font-medium ${isAi ? 'text-left pl-1' : 'text-right pr-1'}`}>
            {formatTime(timestamp)}
          </span>
        </div>

      </div>
    </div>
  );
}
