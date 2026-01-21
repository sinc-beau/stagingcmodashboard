import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, CheckCircle, AlertCircle, LogIn, Lock } from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [showDebug, setShowDebug] = useState(true);

  const addDebug = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, { timestamp, message, data }]);
    console.log(`[${timestamp}] ${message}`, data);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo([]);

    try {
      addDebug('Starting login attempt', { email: email.trim().toLowerCase() });

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      addDebug('Auth response received', {
        hasUser: !!data.user,
        userId: data.user?.id,
        userEmail: data.user?.email,
        error: signInError?.message
      });

      if (signInError) {
        addDebug('Sign in error occurred', signInError);
        setError(signInError.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      if (data.user) {
        addDebug('Querying sponsor_users table', {
          lookupEmail: data.user.email
        });

        const { data: sponsorUserData, error: queryError } = await supabase
          .from('sponsor_users')
          .select('status, role, id, email')
          .eq('email', data.user.email)
          .maybeSingle();

        addDebug('sponsor_users query result', {
          found: !!sponsorUserData,
          data: sponsorUserData,
          error: queryError?.message
        });

        if (!sponsorUserData) {
          addDebug('No sponsor_users record found - creating one');

          const { data: newSponsorUser, error: insertError } = await supabase
            .from('sponsor_users')
            .insert({
              email: data.user.email,
              status: 'pending',
              role: 'sponsor'
            })
            .select()
            .single();

          addDebug('Created sponsor_users record', {
            success: !!newSponsorUser,
            error: insertError?.message
          });

          if (insertError || !newSponsorUser) {
            setError('Failed to create account record. Please contact support.');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          setError('Your account is pending approval. You will be notified when approved.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        addDebug('Checking user status', {
          status: sponsorUserData.status,
          role: sponsorUserData.role
        });

        if (sponsorUserData.status === 'rejected') {
          addDebug('User status is rejected');
          setError('Your account has been rejected. Please contact support.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (sponsorUserData.status === 'pending') {
          addDebug('User status is pending');
          setError('Your account is pending approval. You will be notified when approved.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        addDebug('User approved - redirecting', {
          role: sponsorUserData.role
        });

        setTimeout(() => {
          if (sponsorUserData.role === 'admin') {
            addDebug('Redirecting to admin dashboard');
            window.history.pushState({}, '', '/admin');
          } else if (sponsorUserData.role === 'account_manager') {
            addDebug('Redirecting to account manager dashboard');
            window.history.pushState({}, '', '/account-manager');
          } else {
            addDebug('Redirecting to sponsor dashboard');
            window.history.pushState({}, '', '/sponsor');
          }
          window.dispatchEvent(new PopStateEvent('popstate'));
          setLoading(false);
        }, 100);
      } else {
        addDebug('No user in response data');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      addDebug('Exception caught', err);
      setError('Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await signIn(email.trim().toLowerCase());

    if (signInError) {
      setError(signInError.message || 'Failed to send magic link. Please try again.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sinc-gray-light px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-sinc-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-sinc-success" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-sinc-gray-dark mb-4">
            Check Your Email
          </h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-gray-400" />
            <p className="text-gray-600">
              We've sent a magic link to
            </p>
          </div>
          <p className="text-lg font-medium text-sinc-gray-dark mb-6">
            {email}
          </p>
          <div className="bg-sinc-blue-light border border-sinc-blue rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-sinc-gray-dark font-semibold mb-2">Next steps:</p>
            <ul className="text-sm text-sinc-gray-dark space-y-2">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Check your inbox for an email from us</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Click the magic link in the email</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>You'll be automatically logged in</span>
              </li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            The link will expire in 1 hour for security reasons.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setEmail('');
            }}
            className="text-sinc-blue hover:text-sinc-blue/80 font-body font-semibold text-sm"
          >
            Send to a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sinc-gray-light px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sinc-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-10 h-10 text-sinc-blue" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-sinc-gray-dark mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your sponsor portal</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setUsePassword(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-body font-semibold transition-colors ${
              !usePassword
                ? 'bg-sinc-blue-light text-sinc-blue border-2 border-sinc-blue'
                : 'bg-sinc-gray-light text-sinc-gray-dark border-2 border-transparent hover:bg-sinc-gray-light-hover'
            }`}
          >
            Magic Link
          </button>
          <button
            onClick={() => setUsePassword(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-body font-semibold transition-colors ${
              usePassword
                ? 'bg-sinc-blue-light text-sinc-blue border-2 border-sinc-blue'
                : 'bg-sinc-gray-light text-sinc-gray-dark border-2 border-transparent hover:bg-sinc-gray-light-hover'
            }`}
          >
            Password
          </button>
        </div>

        <form onSubmit={usePassword ? handlePasswordLogin : handleMagicLinkLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sinc-blue focus:border-transparent outline-none transition-all"
              placeholder="your.email@company.com"
            />
          </div>

          {usePassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sinc-blue focus:border-transparent outline-none transition-all"
                placeholder="Enter your password"
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!usePassword && (
            <div className="bg-sinc-gray-light border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-body font-semibold text-sinc-gray-dark mb-1">Passwordless Login</p>
                  <p className="text-xs text-gray-600">
                    We'll send you a secure magic link to log in. No password needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sinc-blue text-white font-body font-semibold py-3 rounded-lg hover:bg-sinc-blue/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{usePassword ? 'Signing in...' : 'Sending Magic Link...'}</span>
              </>
            ) : (
              <>
                {usePassword ? (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Send Magic Link</span>
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-sinc-blue hover:text-sinc-blue/80 font-body font-semibold">
              Request Access
            </a>
          </p>
        </div>

        {debugInfo.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium mb-2"
            >
              {showDebug ? '▼' : '▶'} Debug Info ({debugInfo.length} events)
            </button>

            {showDebug && (
              <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs font-mono max-h-96 overflow-y-auto">
                {debugInfo.map((log, idx) => (
                  <div key={idx} className="mb-3 border-b border-gray-700 pb-2 last:border-b-0">
                    <div className="text-gray-400">[{log.timestamp}]</div>
                    <div className="text-white font-semibold mt-1">{log.message}</div>
                    {log.data && (
                      <pre className="mt-1 text-green-300 whitespace-pre-wrap break-all">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
