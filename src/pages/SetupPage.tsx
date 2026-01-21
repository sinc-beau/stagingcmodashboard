import { useState } from 'react';
import { setupAdminUser } from '../lib/setupAdmin';
import { setupSponsorUser } from '../lib/setupSponsorUser';
import { Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [sponsorResult, setSponsorResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const handleSetup = async () => {
    setLoading(true);
    setResult(null);

    const response = await setupAdminUser();
    setResult(response);
    setLoading(false);
  };

  const handleSponsorSetup = async () => {
    setSponsorLoading(true);
    setSponsorResult(null);

    const response = await setupSponsorUser('beau.horton@sincusa.com', 'Insight');
    setSponsorResult(response);
    setSponsorLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Admin User</h1>
          <p className="text-gray-600">Initialize the admin account for local development</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-gray-900 mb-2">Admin Credentials:</p>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Email:</span> beau.horton@sincusa.com</p>
            <p><span className="font-medium">Password:</span> admin123</p>
          </div>
        </div>

        {result && (
          <div className={`flex items-start gap-3 p-4 rounded-lg mb-6 ${
            result.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                result.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.success ? 'Success!' : 'Error'}
              </p>
              <p className={`text-sm mt-1 ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message || result.error}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Setting up...</span>
            </>
          ) : (
            <>
              <Settings className="w-5 h-5" />
              <span>Create Admin User</span>
            </>
          )}
        </button>

        <div className="border-t border-gray-200 my-6"></div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-blue-900 mb-2">Sponsor User Setup:</p>
          <div className="space-y-1 text-sm text-blue-700">
            <p><span className="font-medium">Email:</span> beau.horton@sincusa.com</p>
            <p><span className="font-medium">Sponsor:</span> Insight</p>
            <p><span className="font-medium">Password:</span> tempPassword123!</p>
          </div>
        </div>

        {sponsorResult && (
          <div className={`flex items-start gap-3 p-4 rounded-lg mb-4 ${
            sponsorResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {sponsorResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                sponsorResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {sponsorResult.success ? 'Success!' : 'Error'}
              </p>
              <p className={`text-sm mt-1 ${
                sponsorResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {sponsorResult.message || sponsorResult.error}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleSponsorSetup}
          disabled={sponsorLoading}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
        >
          {sponsorLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Setting up...</span>
            </>
          ) : (
            <>
              <Settings className="w-5 h-5" />
              <span>Create Sponsor User</span>
            </>
          )}
        </button>

        {(result?.success || sponsorResult?.success) && (
          <a
            href="/login"
            className="block w-full text-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Login
          </a>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This page is for development purposes only. Remove in production.
          </p>
        </div>
      </div>
    </div>
  );
}
