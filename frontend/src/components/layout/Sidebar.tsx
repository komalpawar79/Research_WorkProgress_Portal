import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CreditCard,
  Bell,
  User,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  unreadNotifsCount?: number;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ unreadNotifsCount = 3, onCloseMobile }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'My Research Work', path: '/research', icon: GraduationCap },
    { label: 'Chapters', path: '/chapters', icon: BookOpen },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
    },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#1E3128] text-white flex flex-col h-screen border-r border-[#2C4439] select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center gap-3 border-b border-[#2C4439]/60">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#B78352] to-[#8C5F35] flex items-center justify-center shadow-md text-white">
          <Layers className="w-5 h-5 text-[#FDFCFB]" />
        </div>
        <div>
          <h1 className="font-serif text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            ResearchFlow
          </h1>
          <p className="text-[10px] text-[#93A59B] tracking-wide font-medium leading-none mt-0.5">
            Portal v2.4
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#2E483C] text-white shadow-sm font-semibold'
                    : 'text-[#A5B8AD] hover:bg-[#253D32] hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-colors group-hover:text-[#D5E2D9]" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="w-5 h-5 rounded-full bg-[#C8523A] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Logout Area */}
      <div className="p-4 border-t border-[#2C4439]/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#A5B8AD] hover:bg-[#2A4237] hover:text-[#FFAAA0] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

