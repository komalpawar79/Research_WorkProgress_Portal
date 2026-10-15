import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, BookOpen, CreditCard, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Projects', path: '/research', icon: GraduationCap },
    { label: 'Chapters', path: '/chapters', icon: BookOpen },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-2 py-1.5 z-40 shadow-lg flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-editorial-muted hover:text-editorial-dark'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-primary' : 'text-editorial-muted'}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

