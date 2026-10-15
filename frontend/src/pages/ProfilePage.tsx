import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { projectService } from '../services/projectService';
import { ProfileDetailsCard } from '../components/profile/ProfileDetailsCard';
import { ChangePasswordCard } from '../components/profile/ChangePasswordCard';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => (user ? profileService.getProfile(user.id) : null),
  });

  const { data: project } = useQuery({
    queryKey: ['project', user?.id],
    queryFn: () => (user ? projectService.getProjectByUserId(user.id) : null),
    enabled: Boolean(user?.id),
  });

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-editorial-muted font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          Profile
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <ProfileDetailsCard profile={profile} project={project} />
        <ChangePasswordCard />
      </div>
    </div>
  );
};

