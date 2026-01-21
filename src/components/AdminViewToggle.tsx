import { useAuth } from '../contexts/AuthContext';
import { Eye, UserCog, Users, Shield } from 'lucide-react';

export function AdminViewToggle() {
  const { isAdmin, viewAs, setViewAs } = useAuth();

  if (!isAdmin) {
    return null;
  }

  const views = [
    { value: null, label: 'Admin View', icon: Shield },
    { value: 'account_manager' as const, label: 'Account Manager View', icon: UserCog },
    { value: 'sponsor' as const, label: 'Sponsor View', icon: Users },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-sinc-blue p-4 min-w-[280px]">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
          <Eye className="w-5 h-5 text-sinc-blue" />
          <span className="font-heading font-semibold text-sinc-gray-dark">Dev View Toggle</span>
        </div>

        <div className="space-y-2">
          {views.map(({ value, label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setViewAs(value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                viewAs === value
                  ? 'bg-sinc-blue text-white shadow-md'
                  : 'bg-sinc-gray-light text-sinc-gray-dark hover:bg-sinc-gray-light-hover'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Admin-only feature for testing
          </p>
        </div>
      </div>
    </div>
  );
}
