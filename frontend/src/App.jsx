import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Rules from './pages/Rules';

/**
 * Main App Component
 * Handles page routing and layout
 */
function App() {
  const [activePage, setActivePage] = useState('dashboard');

  // Check for OAuth callback success/error in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connection = params.get('connection');
    const error = params.get('error');

    if (connection === 'success') {
      // Clean the URL
      window.history.replaceState({}, document.title, '/');
    } else if (connection === 'error') {
      alert('Failed to connect Instagram: ' + (error || 'Unknown error'));
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  /**
   * Render the active page based on navigation
   */
  const renderPage = () => {
    switch (activePage) {
      case 'messages':
        return <Messages />;
      case 'rules':
        return <Rules />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;

