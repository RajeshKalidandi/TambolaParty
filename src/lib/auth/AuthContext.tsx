import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatAuthError = (error: AuthError): string => {
  switch (error.status) {
    case 400:
      if (error.message.includes('password')) {
        return 'Password should be at least 6 characters long';
      }
      if (error.message.includes('email')) {
        return 'Please enter a valid email address';
      }
      return 'Invalid credentials. Please check your input.';
    case 429:
      return 'Too many attempts. Please try again later.';
    case 422:
      return 'Email already registered. Please sign in instead.';
    case 406:
      return 'Username already exists. Please choose another one.';
    default:
      return error.message;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(formatAuthError(error as AuthError));
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Check if username exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('players')
        .select('username')
        .eq('username', username)
        .limit(1);

      if (checkError) {
        console.error('Error checking username:', checkError);
        throw new Error('Error checking username availability');
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Username already taken. Please choose another one.');
      }

      // Create auth user with metadata
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username, // Store username in user metadata
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create player profile using service role client
      const { error: profileError } = await supabase.rpc('create_player_profile', {
        user_id: authData.user.id,
        user_username: username,
        user_avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`
      });

      if (profileError) {
        // Rollback auth user creation
        await supabase.auth.signOut();
        console.error('Error creating player profile:', profileError);
        throw new Error('Error creating player profile. Please try again.');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(formatAuthError(error as AuthError));
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(formatAuthError(error as AuthError));
      }
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(formatAuthError(error as AuthError));
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};