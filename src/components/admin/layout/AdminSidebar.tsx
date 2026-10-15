import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  TrendingUp,
  FileText,
  Bell,
  Activity,
  Settings,
  LogOut,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Research Projects', path: '/admin/research-projects', icon: GraduationCap },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Progress Updates', path: '/admin/progress-updates', icon: TrendingUp },
    { label: 'Documents', path: '/admin/documents', icon: FileText },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Activity / Logs', path: '/admin/activity-logs', icon: Activity },
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
            Admin Console
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-[#2E483C] text-white shadow-sm font-semibold'
                    : 'text-[#A5B8AD] hover:bg-[#253D32] hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 transition-colors group-hover:text-white" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Navigation: Settings & Logout */}
      <div className="p-3.5 border-t border-[#2C4439]/60 space-y-1">
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#C59B6D] hover:bg-[#253D32] hover:text-[#E8BA85] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Customer Portal</span>
        </NavLink>

        <NavLink
          to="/admin/settings"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#2E483C] text-white font-semibold'
                : 'text-[#A5B8AD] hover:bg-[#253D32] hover:text-white'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#A5B8AD] hover:bg-[#2A4237] hover:text-[#FFAAA0] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

