import { useState, useEffect } from 'react';
import { HiOutlineChat, HiOutlineChatAlt2, HiOutlineShieldCheck, HiOutlineReply, HiOutlineTrendingUp } from 'react-icons/hi';
import ConnectionCard from '../components/ConnectionCard';
import { getMessageStats } from '../services/api';

/**
 * Dashboard Page
 * Main overview page with stats and connection status
 */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getMessageStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Messages',
      value: stats?.totalMessages || 0,
      icon: HiOutlineChat,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Comments',
      value: stats?.totalComments || 0,
      icon: HiOutlineChatAlt2,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Direct Messages',
      value: stats?.totalDMs || 0,
      icon: HiOutlineTrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      label: 'Auto Replies Sent',
      value: stats?.totalAutoReplies || 0,
      icon: HiOutlineReply,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="animate-fadeIn">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor your Instagram auto-reply activity</p>
      </div>

      {/* Connection Status */}
      <div className="animate-slideIn">
        <ConnectionCard />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`text-xl ${card.textColor}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    card.value
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 shadow-lg animate-fadeIn">
        <h2 className="text-xl font-bold text-white mb-2">🚀 Getting Started</h2>
        <p className="text-purple-100 text-sm mb-6">
          Follow these steps to set up your Instagram Auto Reply Bot
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm mb-3">1</div>
            <h3 className="text-white font-semibold text-sm mb-1">Connect Instagram</h3>
            <p className="text-purple-200 text-xs">
              Click "Connect Instagram" above and log in with your Meta account
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm mb-3">2</div>
            <h3 className="text-white font-semibold text-sm mb-1">Create Rules</h3>
            <p className="text-purple-200 text-xs">
              Go to "Auto Reply Rules" and add keyword-based reply rules
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm mb-3">3</div>
            <h3 className="text-white font-semibold text-sm mb-1">Watch it Work</h3>
            <p className="text-purple-200 text-xs">
              See incoming messages in real-time on the Messages page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
