import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface SponsorUser {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  role: 'sponsor' | 'admin' | 'account_manager';
  sponsor_id: string | null;
  company_name: string | null;
  last_login: string | null;
}

interface AuthContextType {
  user: User | null;
  sponsorUser: SponsorUser | null;
  loading: boolean;
  isAdmin: boolean;
  isSponsor: boolean;
  isAccountManager: boolean;
  isApproved: boolean;
  viewAs: 'sponsor' | 'account_manager' | null;
  setViewAs: (view: 'sponsor' | 'account_manager' | null) => void;
  signIn: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sponsorUser, setSponsorUser] = useState<SponsorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewAs, setViewAs] = useState<'sponsor' | 'account_manager' | null>(null);

  const isAdmin = sponsorUser?.role === 'admin' && sponsorUser?.status === 'approved';
  const isSponsor = sponsorUser?.role === 'sponsor' && sponsorUser?.status === 'approved';
  const isAccountManager = sponsorUser?.role === 'account_manager' && sponsorUser?.status === 'approved';
  const isApproved = sponsorUser?.status === 'approved';

  const fetchSponsorUser = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('sponsor_users')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (error) throw error;
      setSponsorUser(data);

      if (data && data.status === 'approved') {
        await supabase
          .from('sponsor_users')
          .update({ last_login: new Date().toISOString() })
          .eq('email', userEmail);
      }
    } catch (error) {
      console.error('Error fetching sponsor user:', error);
      setSponsorUser(null);
    }
  };

  const refreshUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    if (currentUser?.email) {
      await fetchSponsorUser(currentUser.email);
    } else {
      setSponsorUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        if (session?.user?.email) {
          await fetchSponsorUser(session.user.email);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          setUser(session?.user ?? null);

          if (session?.user?.email) {
            await fetchSponsorUser(session.user.email);
          } else {
            setSponsorUser(null);
          }

          if (event === 'SIGNED_IN') {
            setLoading(false);
          } else if (event === 'SIGNED_OUT') {
            setSponsorUser(null);
            setLoading(false);
          }
        })();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string) => {
    try {
      const { data: sponsorUserData } = await supabase
        .from('sponsor_users')
        .select('id, email, status')
        .eq('email', email)
        .maybeSingle();

      if (!sponsorUserData) {
        return { error: new Error('No account found with this email address. Please contact support or request access.') };
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSponsorUser(null);
  };

  const value = {
    user,
    sponsorUser,
    loading,
    isAdmin,
    isSponsor,
    isAccountManager,
    isApproved,
    viewAs,
    setViewAs,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
