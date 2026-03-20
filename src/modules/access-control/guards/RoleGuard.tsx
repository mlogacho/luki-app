import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/modules/auth/store/authStore';
import { hasRole } from '@/src/modules/access-control/roles/roles';
import { ROUTES } from '@/src/core/constants/app.constants';
import type { UserRole } from '@/src/core/types/user.types';

interface RoleGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href={ROUTES.LOGIN} />;
  }

  if (!hasRole(user.role, requiredRole)) {
    return <Redirect href={ROUTES.HOME} />;
  }

  return <>{children}</>;
}
