import { useEffect, useState } from 'react';
import { getStatsApi, exportFacultyApi } from '../../api/admin.api';

interface Stats {
  totalFaculty: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalCourses: number;
  totalDepartments: number;
}

const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${color}`}>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getStatsApi()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await exportFacultyApi();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'faculty-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div className="text-gray-400 text-sm">Loading...</div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">System overview</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : '⬇ Export Faculty CSV'}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Faculty" value={stats.totalFaculty} color="border-blue-500" />
          <StatCard label="Approved" value={stats.approvedCount} color="border-green-500" />
          <StatCard label="Pending" value={stats.pendingCount} color="border-yellow-500" />
          <StatCard label="Rejected" value={stats.rejectedCount} color="border-red-500" />
          <StatCard label="Total Courses" value={stats.totalCourses} color="border-purple-500" />
          <StatCard label="Departments" value={stats.totalDepartments} color="border-indigo-500" />
        </div>
      )}
    </div>
  );
}