import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function Navbar() {
  const { user, status, name, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-end gap-2">
        <span className="text-primary font-bold text-4xl">MANIT-FIS</span>
        <span className="text-gray-500 text-lg hidden sm:block ml-1">
          Faculty Information System
        </span>
      </div>

      <div className="flex items-center gap-5 mr-4">
        {/* status badge */}
        {user?.role === 'FACULTY' && (
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              status === 'APPROVED'
                ? 'bg-green-100 text-green-700'
                : status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {status}
          </span>
        )}

        {/* user info */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{name}</p>
          <p className="text-xs text-gray-400">{user?.role}</p>
        </div>

        <button
          onClick={handleLogout}
          className="text-lg text-gray-500 hover:text-red-500 transition font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}