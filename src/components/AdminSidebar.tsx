import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/approvals', label: 'Approvals', icon: '✅' },
  { to: '/admin/faculty', label: 'Faculty', icon: '👨‍🏫' },
  { to: '/admin/departments', label: 'Departments', icon: '🏛️' },
  { to: '/admin/courses', label: 'Courses', icon: '📚' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/published-reports', label: 'Published Reports', icon: '🌐' },
];

export default function AdminSidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-screen shrink-0">
      <nav className="p-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}