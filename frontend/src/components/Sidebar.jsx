import React, { useState } from 'react';
import { MessageSquare, Plus, Search, Calendar, User } from 'lucide-react';

export default function Sidebar({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  isOpen,
  onClose,
  username
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter previous chat sessions in real-time based on search input
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-dark-sidebar border-r border-dark-border flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Sidebar Header (New Chat trigger) */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between md:hidden">
          <span className="font-bold text-slate-200">Menu</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded hover:bg-dark-active transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => {
            onNewChat();
            onClose(); // Close mobile drawer if open
          }}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>

        {/* Real-time search filter */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-card border border-dark-border text-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition-all placeholder-slate-500"
          />
        </div>
      </div>

      {/* Conversations scroll area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        <div className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Recent Chats</span>
          <span className="bg-dark-active text-slate-400 px-1.5 py-0.5 rounded text-[10px]">{filteredChats.length}</span>
        </div>

        {filteredChats.length === 0 ? (
          <div className="text-center py-8 px-4 text-sm text-slate-600">
            {searchQuery ? 'No matching chats found.' : 'No conversations yet.'}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                onClick={() => {
                  onChatSelect(chat.id);
                  onClose(); // Close mobile drawer
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm transition-all duration-150 group relative
                  ${isActive
                    ? 'bg-dark-active border border-dark-border text-slate-100 font-medium'
                    : 'text-slate-400 hover:bg-dark-active/50 hover:text-slate-200 border border-transparent'
                  }
                `}
              >
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                <span className="truncate pr-4 flex-1">{chat.title}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-dark-border bg-dark-sidebar flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-800 flex items-center justify-center text-white font-bold text-lg shadow-inner">
          {username ? username.substring(0, 2).toUpperCase() : 'AI'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{username || 'Guest User'}</p>
          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
