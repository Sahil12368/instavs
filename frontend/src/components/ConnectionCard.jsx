import { useState, useEffect } from 'react';
import { HiOutlineLink, HiOutlineStatusOnline, HiOutlineStatusOffline, HiOutlineRefresh } from 'react-icons/hi';
import { getConnectionStatus, initiateInstagramOAuth, disconnectInstagram } from '../services/api';

/**
 * Connection Card Component
 * Shows Instagram account connection status and allows connect/disconnect
 */
export default function ConnectionCard() {
  const [status, setStatus] = useState({ connected: false, loading: true });
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  /**
   * Fetch the current connection status from backend
   */
  const fetchStatus = async () => {
    try {
      const data = await getConnectionStatus();
      setStatus({ ...data, loading: false });
    } catch (error) {
      setStatus({ connected: false, loading: false, error: error.message });
    }
  };

  /**
   * Handle connecting to Instagram
   */
  const handleConnect = async () => {
    try {
      setConnecting(true);
      const data = await initiateInstagramOAuth();

      if (data.oauthUrl) {
        // Redirect to Meta OAuth
        window.location.href = data.oauthUrl;
      }
    } catch (error) {
      alert('Failed to connect: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Handle disconnecting Instagram
   */
  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Instagram account?')) {
      return;
    }

    try {
      setDisconnecting(true);
      await disconnectInstagram();
      setStatus({ connected: false, loading: false });
    } catch (error) {
      alert('Failed to disconnect: ' + error.message);
    } finally {
      setDisconnecting(false);
    }
  };

  if (status.loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-20 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            status.connected
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {status.connected
              ? <HiOutlineStatusOnline className="text-2xl" />
              : <HiOutlineStatusOffline className="text-2xl" />
            }
          </div>

          <div>
            <h3 className="font-semibold text-gray-800">Instagram Connection</h3>
            {status.connected ? (
              <div className="mt-1">
                <p className="text-sm text-gray-600">
                  Connected as <span className="font-medium text-purple-600">@{status.username}</span>
                </p>
                {status.name && (
                  <p className="text-xs text-gray-400">{status.name}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-1">
                {status.error || 'No account connected'}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          status.connected
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${
              status.connected ? 'bg-green-500 animate-pulse-dot' : 'bg-gray-400'
            }`} />
            {status.connected ? 'Active' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex items-center gap-3">
        {status.connected ? (
          <>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
            <button
              onClick={fetchStatus}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2"
            >
              <HiOutlineRefresh className="text-base" />
              Refresh
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            <HiOutlineLink className="text-lg" />
            {connecting ? 'Connecting...' : 'Connect Instagram'}
          </button>
        )}
      </div>
    </div>
  );
}
