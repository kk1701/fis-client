import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import ChangePasswordModal from './ChangePasswordModal';

export default function Navbar() {
  const { user, status, name, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-lg">FIS</span>
          <span className="text-gray-400 text-sm hidden sm:block">
            Faculty Information System
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* status badge */}
          {user?.role === 'FACULTY' && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              status === 'APPROVED'
                ? 'bg-green-100 text-green-700'
                : status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {status}
            </span>
          )}

          {/* user dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{name ?? user?.email}</p>
                <p className="text-xs text-gray-600">{user?.role}</p>
              </div>
              <span className="text-gray-800 text-lg">▾</span>
            </button>

            {showDropdown && (
              <>
                {/* backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                {/* dropdown */}
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowChangePassword(true);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    🔑 Change Password
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    ← Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
}