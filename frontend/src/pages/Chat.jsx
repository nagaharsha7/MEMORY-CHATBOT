import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, AlertCircle } from 'lucide-react';
import { chatService } from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import Navbar from '../components/Navbar';

export default function Chat({ user, onLogout }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Loading indicators
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  
  // Error handling
  const [apiError, setApiError] = useState('');
  
  // Sidebar responsive drawer state for mobile viewports
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Reference hooks for auto-scrolling to the bottom
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 1. Load user's conversations list on mount
  useEffect(() => {
    fetchChatsList();
  }, []);

  // 2. Auto-scroll to bottom of chat log whenever messages list changes or typing starts
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatsList = async () => {
    try {
      setChatsLoading(true);
      const data = await chatService.getUserChats();
      setChats(data);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setChatsLoading(false);
    }
  };

  // 3. Load message log for a selected conversation
  const handleChatSelect = async (chatId) => {
    setActiveChatId(chatId);
    setApiError('');
    try {
      setHistoryLoading(true);
      const data = await chatService.getChatHistory(chatId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      setApiError('Unable to load chat messages.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // 4. Reset state to initiate a new thread
  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setApiError('');
    setInputMessage('');
  };

  // 5. Send message action
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = inputMessage.trim();
    if (!content || loading) return;

    // Clear input field immediately
    setInputMessage('');
    setApiError('');

    // Pre-emptively append user message locally for an instant responsive feel
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      content: content,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    setLoading(true);

    try {
      // Fire request to POST /chat endpoint
      const data = await chatService.sendMessage(content, activeChatId);
      
      // Update message log with database items
      setMessages((prev) => {
        // Remove the temporary message and append the official ones
        const listWithoutTemp = prev.filter(m => m.id !== tempUserMsg.id);
        return [...listWithoutTemp, data.user_message, data.ai_message];
      });

      // If a brand new session was created, save active chat ID and refresh sidebar list
      if (!activeChatId) {
        setActiveChatId(data.chat_id);
        await fetchChatsList();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove temporary message on error so UI doesn't show fake history
      setMessages((prev) => prev.filter(m => m.id !== tempUserMsg.id));
      
      const details = err.response?.data?.detail || 'Failed to get response from AI assistant. Please check your OpenRouter API Key.';
      setApiError(details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-slate-100 overflow-hidden">
      {/* Header bar */}
      <Navbar
        username={user?.username}
        onLogout={onLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Responsive Mobile Drawer Backdrop overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity"
          />
        )}

        {/* Sidebar Component */}
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          username={user?.username}
        />

        {/* Chat Panel */}
        <main className="flex-1 flex flex-col bg-dark-bg h-full overflow-hidden relative">
          {/* Scrollable messages container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4"
          >
            {apiError && (
              <div className="max-w-3xl mx-auto bg-rose-950/30 border border-rose-900/40 text-rose-300 text-sm px-4 py-3 rounded-xl flex items-start gap-2.5 shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-semibold">API Error: </span>
                  {apiError}
                </div>
              </div>
            )}

            {/* Empty state dashboard */}
            {messages.length === 0 && !historyLoading && (
              <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center h-[70vh]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/50 border border-indigo-900/40 flex items-center justify-center mb-6 text-indigo-400 shadow-md">
                  <Bot className="w-9 h-9" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                  How can I help you today?
                </h1>
                <p className="text-slate-400 text-sm max-w-md mt-3 leading-relaxed">
                  Start a new conversation thread. The AI utilizes LangChain memory to recall previous context across messages in this session!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl w-full mt-10">
                  <div className="bg-[#121824] border border-slate-800/80 p-4 rounded-xl text-left hover:border-slate-700 transition-colors">
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Recall test
                    </p>
                    <p className="text-sm text-slate-300">"My name is Harsha, I like Python."</p>
                  </div>
                  <div className="bg-[#121824] border border-slate-800/80 p-4 rounded-xl text-left hover:border-slate-700 transition-colors">
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Memory check
                    </p>
                    <p className="text-sm text-slate-300">"What is my name again and what do I like?"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Show loading spinner while retrieving message history */}
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center h-[50vh] gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-xs font-medium">Retrieving history logs...</span>
              </div>
            ) : (
              /* Map and render history messages */
              <div className="max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}

                {/* Loading typing indicator bubble */}
                {loading && (
                  <div className="flex w-full my-4 justify-start animate-fade-in">
                    <div className="flex gap-3 max-w-[85%] md:max-w-[70%]">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="bg-dark-aiBubble border border-indigo-950/50 px-5 py-3.5 rounded-2xl rounded-tl-sm text-slate-400 flex items-center gap-1.5 min-w-[70px]">
                          <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full typing-dot" />
                          <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full typing-dot" />
                          <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full typing-dot" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Scroll Bottom Anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom input area container */}
          <div className="p-4 border-t border-dark-border bg-dark-sidebar/40 backdrop-blur-md">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={loading ? 'Waiting for response...' : 'Type a message...'}
                disabled={loading || historyLoading}
                className="w-full bg-[#121824] border border-slate-800/80 rounded-2xl pl-4 pr-14 py-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition-all disabled:opacity-50"
              />
              
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading || historyLoading}
                className="absolute right-2 top-2 w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800/50 text-white disabled:text-slate-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-150"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
            
            <p className="text-[10px] text-center text-slate-600 mt-2.5">
              Memory is local. Powered by LangChain and OpenRouter.
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}
