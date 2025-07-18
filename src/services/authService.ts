import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { aiService } from './aiService';

class AuthService {
  private currentUser: UserProfile | null = null;
  private authStateListeners: ((user: UserProfile | null) => void)[] = [];

  constructor() {
    // Initialize auth state listener
    this.initializeAuthListener();
  }

  private async initializeAuthListener(): Promise<void> {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await this.handleAuthUser(session.user);
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await this.handleAuthUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.clearLocalData();
        this.notifyAuthStateChange();
      }
    });
  }

  private async handleAuthUser(user: any): Promise<void> {
    try {
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      let userProfile: UserProfile;

      if (existingProfile) {
        // Update existing profile
        userProfile = {
          uid: existingProfile.id,
          email: existingProfile.email,
          displayName: existingProfile.display_name,
          photoURL: existingProfile.photo_url,
          preferences: existingProfile.preferences || {
            currency: 'INR',
            language: 'en',
            reminderDays: 3,
            reminderTypes: ['in-app'],
            categories: []
          },
          createdAt: existingProfile.created_at,
          lastLogin: new Date().toISOString()
        };

        // Update last login
        await supabase
          .from('user_profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);
      } else {
        // Create new profile
        userProfile = {
          uid: user.id,
          email: user.email || '',
          displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          photoURL: user.user_metadata?.avatar_url || null,
          preferences: {
            currency: 'INR',
            language: 'en',
            reminderDays: 3,
            reminderTypes: ['in-app'],
            categories: []
          },
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        // Insert new profile
        await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: userProfile.email,
            display_name: userProfile.displayName,
            photo_url: userProfile.photoURL,
            preferences: userProfile.preferences,
            created_at: userProfile.createdAt,
            last_login: userProfile.lastLogin
          });
      }

      this.currentUser = userProfile;
      this.notifyAuthStateChange();
    } catch (error) {
      console.error('Error handling auth user:', error);
    }
  }

  private clearLocalData(): void {
    // Clear all localStorage data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('billbox_') || key.includes('ai') || key.includes('expenses') || key.includes('income')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear AI service data
    aiService.resetLearningData();
  }

  private notifyAuthStateChange(): void {
    this.authStateListeners.forEach(callback => callback(this.currentUser));
  }

  async signUpWithEmail(email: string, password: string, fullName: string): Promise<UserProfile | null> {
    try {
      console.log('Starting email sign-up...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error('Sign-up error:', error);
        throw error;
      }

      if (data.user && !data.session) {
        // Email confirmation required
        throw new Error('Please check your email and click the confirmation link to activate your account.');
      }

      // The actual user handling will be done in the auth state change listener
      return null; // Will be set when auth state changes
    } catch (error) {
      console.error('Error during email sign up:', error);
      throw error;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<UserProfile | null> {
    try {
      console.log('Starting email sign-in...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign-in error:', error);
        throw error;
      }

      // The actual user handling will be done in the auth state change listener
      return null; // Will be set when auth state changes
    } catch (error) {
      console.error('Error during email sign in:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<UserProfile | null> {
    try {
      console.log('Starting Google sign-in...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }

      // The actual user handling will be done in the auth state change listener
      return null; // Will be set when auth state changes
    } catch (error) {
      console.error('Error during Google sign in:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      if (!this.currentUser) return;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: profile.displayName,
          photo_url: profile.photoURL,
          preferences: profile.preferences
        })
        .eq('id', profile.uid);

      if (error) {
        console.error('Error saving user profile:', error);
        throw error;
      }

      this.currentUser = profile;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        uid: data.id,
        email: data.email,
        displayName: data.display_name,
        photoURL: data.photo_url,
        preferences: data.preferences,
        createdAt: data.created_at,
        lastLogin: data.last_login
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Immediately call with current user state
    setTimeout(() => callback(this.currentUser), 0);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  // Method to manually reset all data (for demo purposes)
  async resetAllUserData(): Promise<void> {
    console.log('Manual data reset initiated...');
    this.clearLocalData();
    
    // Sign out and clear everything
    await this.signOut();
    console.log('Manual data reset completed');
  }
}

export const authService = new AuthService();