import React from 'react';
import { UserProfile, ResearchProject } from '../../types/database.types';

interface ProfileDetailsCardProps {
  profile: UserProfile;
  project?: ResearchProject | null;
}

export const ProfileDetailsCard: React.FC<ProfileDetailsCardProps> = ({
  profile,
  project,
}) => {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-card flex-1">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
          alt={profile.full_name}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
        />
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif text-xl font-bold text-editorial-dark">
              {profile.full_name}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]">
              Active
            </span>
          </div>
          <p className="text-xs text-editorial-muted capitalize mt-0.5">
            Research Scholar · {profile.department}
          </p>
        </div>
      </div>

      {/* Profile Fields */}
      <div className="space-y-3.5 text-xs sm:text-sm border-t border-border/70 pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1">
          <span className="text-editorial-muted font-medium">Email</span>
          <span className="sm:col-span-2 font-semibold text-editorial-dark">
            {profile.email}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1 border-t border-border/40">
          <span className="text-editorial-muted font-medium">Phone</span>
          <span className="sm:col-span-2 font-semibold text-editorial-dark font-mono">
            {profile.phone || '+91 98765 43210'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1 border-t border-border/40">
          <span className="text-editorial-muted font-medium">University</span>
          <span className="sm:col-span-2 font-semibold text-editorial-dark">
            {profile.university || 'XYZ University'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1 border-t border-border/40">
          <span className="text-editorial-muted font-medium">Department</span>
          <span className="sm:col-span-2 font-semibold text-editorial-dark">
            {profile.department || 'Computer Science'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1 border-t border-border/40">
          <span className="text-editorial-muted font-medium">Research Topic</span>
          <span className="sm:col-span-2 font-semibold text-primary">
            {project?.topic || 'AI-Based Healthcare System'}
          </span>
        </div>
      </div>
    </div>
  );
};

