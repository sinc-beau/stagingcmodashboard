import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

import { SignupPage } from '../pages/SignupPage';
import { LoginPage } from '../pages/LoginPage';
import { SetupPage } from '../pages/SetupPage';
import { SponsorDashboard } from '../pages/SponsorDashboard';
import { SponsorEventDetail } from '../pages/SponsorEventDetail';
import { SponsorProfile } from '../pages/SponsorProfile';
import { SponsorMessages } from '../pages/SponsorMessages';
import { AdminDashboard } from '../pages/AdminDashboard';
import { AdminApprovals } from '../pages/AdminApprovals';
import { AccountManagerDashboard } from '../pages/AccountManagerDashboard';
import { MessageCenter } from '../pages/MessageCenter';
import SponsorDetail from '../components/SponsorDetail';

function SponsorDetailWrapper({ sponsorId, onBack }: { sponsorId: string; onBack: () => void }) {
  const [sponsorName, setSponsorName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSponsor() {
      const { data } = await supabase
        .from('sponsors')
        .select('name')
        .eq('id', sponsorId)
        .maybeSingle();

      if (data) {
        setSponsorName(data.name);
      }
      setLoading(false);
    }
    loadSponsor();
  }, [sponsorId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <SponsorDetail sponsorId={sponsorId} sponsorName={sponsorName} onBack={onBack} />;
}

export function Router() {
  const { user, sponsorUser, loading, isAdmin, isSponsor, isAccountManager, viewAs } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPath === '/setup') {
    return <SetupPage />;
  }

  if (currentPath === '/signup') {
    return <SignupPage />;
  }

  if (currentPath === '/login') {
    if (user && sponsorUser?.status === 'approved') {
      if (isAdmin) {
        window.location.href = '/admin';
        return null;
      } else if (isAccountManager) {
        window.location.href = '/account-manager';
        return null;
      } else if (isSponsor) {
        window.location.href = '/sponsor';
        return null;
      }
    }
    return <LoginPage />;
  }

  if (currentPath.startsWith('/admin')) {
    if (isAdmin && viewAs === 'sponsor') {
      if (currentPath === '/admin/profile') {
        return <SponsorProfile />;
      }
      if (currentPath === '/admin/messages') {
        return <SponsorMessages />;
      }
      if (currentPath.startsWith('/admin/events/')) {
        const eventId = currentPath.split('/admin/events/')[1];
        return <SponsorEventDetail eventId={eventId} />;
      }
      return <SponsorDashboard />;
    }

    if (isAdmin && viewAs === 'account_manager') {
      if (currentPath === '/admin/messages') {
        return <MessageCenter />;
      }
      if (currentPath.startsWith('/admin/sponsors/')) {
        const sponsorId = currentPath.split('/admin/sponsors/')[1];
        return (
          <SponsorDetailWrapper
            sponsorId={sponsorId}
            onBack={() => {
              window.history.pushState({}, '', '/account-manager');
            }}
          />
        );
      }
      return <AccountManagerDashboard />;
    }

    if (currentPath === '/admin/approvals') {
      return <AdminApprovals />;
    }

    if (currentPath === '/admin/messages') {
      return <MessageCenter />;
    }

    if (currentPath.startsWith('/admin/sponsors/')) {
      const sponsorId = currentPath.split('/admin/sponsors/')[1];
      return (
        <SponsorDetailWrapper
          sponsorId={sponsorId}
          onBack={() => {
            window.history.pushState({}, '', '/admin');
          }}
        />
      );
    }

    return <AdminDashboard />;
  }

  if (currentPath.startsWith('/account-manager')) {
    if (currentPath === '/account-manager/messages') {
      return <MessageCenter />;
    }

    if (currentPath.startsWith('/account-manager/sponsors/')) {
      const sponsorId = currentPath.split('/account-manager/sponsors/')[1];
      return (
        <SponsorDetailWrapper
          sponsorId={sponsorId}
          onBack={() => {
            window.history.pushState({}, '', '/account-manager');
          }}
        />
      );
    }

    return <AccountManagerDashboard />;
  }

  if (currentPath.startsWith('/sponsor')) {
    if (currentPath === '/sponsor/profile') {
      return <SponsorProfile />;
    }
    if (currentPath === '/sponsor/messages') {
      return <SponsorMessages />;
    }
    if (currentPath.startsWith('/sponsor/events/')) {
      const eventId = currentPath.split('/sponsor/events/')[1];
      return <SponsorEventDetail eventId={eventId} />;
    }
    return <SponsorDashboard />;
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  if (sponsorUser?.status === 'approved') {
    if (isAdmin) {
      window.location.href = '/admin';
    } else if (isAccountManager) {
      window.location.href = '/account-manager';
    } else if (isSponsor) {
      window.location.href = '/sponsor';
    }
    return null;
  }

  if (sponsorUser?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-4">
            Your account is currently pending approval. You will receive an email notification once an administrator has reviewed your request.
          </p>
          <p className="text-sm text-gray-500">
            Email: <span className="font-medium">{sponsorUser.email}</span>
          </p>
        </div>
      </div>
    );
  }

  window.location.href = '/login';
  return null;
}
