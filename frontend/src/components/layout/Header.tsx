import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, unreadCount = 3 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-surface border-b border-border/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Left side: Mobile Menu Button & Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-editorial-dark hover:bg-background transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 text-editorial-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search chapters, documents..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-background/70 hover:bg-background focus:bg-white border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-editorial-dark placeholder:text-editorial-muted"
          />
        </div>
      </div>

      {/* Right side: Notifications & User Profile Dropdown */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-full text-editorial-muted hover:text-editorial-dark hover:bg-background transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C8523A] ring-2 ring-white" />
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-background transition-colors"
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.full_name || 'User avatar'}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
            />
            <span className="hidden md:inline-block text-sm font-medium text-editorial-dark">
              {user?.full_name || 'Rahul Sharma'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-editorial-muted hidden sm:inline-block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card border border-border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 border-b border-border/60">
                <p className="text-xs font-semibold text-editorial-dark leading-none">
                  {user?.full_name || 'Rahul Sharma'}
                </p>
                <p className="text-[11px] text-editorial-muted truncate mt-1">
                  {user?.email || 'rahul@gmail.com'}
                </p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-editorial-dark hover:bg-background text-left transition-colors"
              >
                <User className="w-3.5 h-3.5 text-editorial-muted" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/admin/dashboard');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-primary font-semibold hover:bg-[#EAF3EC] text-left transition-colors"
              >
                <span>Switch to Admin Console</span>
              </button>

              <button
                onClick={async () => {
                  setDropdownOpen(false);
                  await logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

