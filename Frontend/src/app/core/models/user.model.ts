export interface User {
  id?: string;
  email: string;
  name?: string;
  fullName?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  fullName: string;
  avatar_url?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginAttempts: number;
    lastLogin: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  fullName?: string;
  avatar_url?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface UpdatePreferencesDto {
  language?: string;
  currency?: string;
  timezone?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  theme?: 'light' | 'dark' | 'auto';
}
