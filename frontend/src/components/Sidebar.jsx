import { useState } from 'react';
import { 
  HiOutlineHome, 
  HiOutlineChat, 
  HiOutlineShieldCheck,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineCube
} from 'react-icons/hi';

/**
 * Sidebar Component
 * Navigation sidebar that adapts to mobile
 */
export default function Sidebar({ activePage, onNavigate }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { id: 'messages', label: 'Messages', icon: HiOutlineChat },
    { id: 'rules', label: 'Auto Reply Rules', icon: HiOutlineShieldCheck }
  ];

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const handleNav = (pageId) => {
    onNavigate(pageId);
    setIsMobileOpen(false);
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200">
            <HiOutlineCube className="text-white text-xl" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-gray-800">Auto Reply</h1>
            <p className="text-xs text-gray-500">Instagram Bot</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-200'
                  : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <Icon className="text-xl" />
              <span className="hidden md:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center hidden md:block">
          MVP v1.0
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobile}
        className={`fixed top-4 right-4 z-50 md:hidden p-2.5 rounded-xl shadow-lg transition-all duration-200 ${
          isMobileOpen 
            ? 'bg-red-500 text-white shadow-red-200' 
            : 'bg-white text-gray-700 shadow-gray-200'
        }`}
      >
        {isMobileOpen ? <HiOutlineX className="text-xl" /> : <HiOutlineMenu className="text-xl" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 min-h-screen bg-white border-r border-gray-200 shrink-0">
        <NavContent />
      </div>
    </>
  );
}
