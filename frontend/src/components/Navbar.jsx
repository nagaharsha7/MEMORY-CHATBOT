import React from 'react';
import { Bot, LogOut, User } from 'lucide-react';

export default function Navbar({ username, onLogout, onToggleSidebar }) {
  return (
    <nav className="h-16 bg-dark-sidebar border-b border-dark-border px-6 flex items-center justify-between text-slate-200 z-10">
      <div className="flex items-center gap-3">
        {/* Toggle sidebar button for mobile responsiveness */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-dark-active text-slate-400 hover:text-slate-100 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Brand logo / Icon */}
        <div className="flex items-center gap-2 text-indigo-400">
          <Bot className="w-8 h-8" />
          <span className="font-bold text-lg tracking-wider text-slate-100 hidden sm:inline">
            AETHER<span className="text-indigo-500">MIND</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Info Capsule */}
        {username && (
          <div className="flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-1.5 rounded-full text-sm">
            <User className="w-4 h-4 text-indigo-400" />
            <span className="font-medium text-slate-300 pr-1">{username}</span>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 text-rose-300 hover:text-rose-100 px-4 py-1.5 rounded-lg text-sm transition-all duration-200 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
