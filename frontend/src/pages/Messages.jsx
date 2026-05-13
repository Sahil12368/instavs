import { useState, useEffect, useCallback } from 'react';
import { HiOutlineFilter, HiOutlineChat, HiOutlineChatAlt2, HiOutlineRefresh, HiOutlineReply, HiOutlineClock } from 'react-icons/hi';
import { getMessages } from '../services/api';
import { connectSocket } from '../services/socket';

/**
 * Messages Page
 * Displays incoming Instagram messages and comments in real-time
 */
export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  /**
   * Fetch messages from backend
   */
  const fetchMessages = useCallback(async () => {
    try {
      const type = filter === 'all' ? null : filter;
      const data = await getMessages(type);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /**
   * Set up real-time socket connection
   */
  useEffect(() => {
    const socket = connectSocket();

    socket.on('new-message', (message) => {
      // Add new message to the top of the list
      setMessages((prev) => [message, ...prev]);
    });

    return () => {
      socket.off('new-message');
    };
  }, []);

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filters = [
    { id: 'all', label: 'All', icon: HiOutlineChat },
    { id: 'comment', label: 'Comments', icon: HiOutlineChatAlt2 },
    { id: 'dm', label: 'Direct Messages', icon: HiOutlineChat }
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Messages</h1>
          <p className="text-gray-500 mt-1">View incoming comments and DMs in real-time</p>
        </div>
        <button
          onClick={fetchMessages}
          className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          <HiOutlineRefresh className="text-lg" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 animate-slideIn">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <Icon className={isActive ? 'text-white' : 'text-gray-400'} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-64 bg-gray-100 rounded" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : messages.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <HiOutlineChat className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No messages yet</h3>
            <p className="text-gray-400 text-sm">
              When Instagram sends messages or comments, they'll appear here in real-time
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 animate-fadeIn"
            >
              <div className="flex items-start gap-4">
                {/* Type Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.type === 'comment' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {msg.type === 'comment' ? <HiOutlineChatAlt2 className="text-xl" /> : <HiOutlineChat className="text-xl" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">@{msg.fromUsername}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      msg.type === 'comment' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {msg.type === 'comment' ? 'Comment' : 'DM'}
                    </span>
                    {msg.autoReply?.sent && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                        <HiOutlineReply className="text-xs" />
                        Replied
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{msg.text}</p>
                  {msg.autoReply?.sent && (
                    <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-xs font-medium text-green-700 mb-1">Auto Reply:</p>
                      <p className="text-sm text-green-600">{msg.autoReply.replyText}</p>
                    </div>
                  )}
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <HiOutlineClock className="text-sm" />
                  {formatDate(msg.receivedAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
