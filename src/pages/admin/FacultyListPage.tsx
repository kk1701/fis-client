import { useEffect, useState } from 'react';
import { getFacultyListApi } from '../../api/admin.api';
import { getAdminDepartmentsApi } from '../../api/admin.api';
import type { Department } from '../../types';

interface FacultyItem {
  id: number;
  email: string;
  status: string;
  createdAt: string;
  faculty: {
    id: number;
    name: string;
    designation: string | null;
    department: Department | null;
    _count: {
      publications: number;
      experiences: number;
      coursesTaught: number;
    };
  } | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-gray-100 text-gray-600',
};

export default function FacultyListPage() {
  const [faculty, setFaculty] = useState<FacultyItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [page, setPage] = useState(1);

  const fetchFaculty = async () => {
    setLoading(true);
    const res = await getFacultyListApi({
      status: filterStatus || undefined,
      departmentId: filterDept ? parseInt(filterDept) : undefined,
      page,
      limit: 10,
    });
    setFaculty(res.data.data);
    setMeta(res.data.meta);
    setLoading(false);
  };

  useEffect(() => {
    getAdminDepartmentsApi().then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [filterStatus, filterDept, page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Faculty</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {meta?.total ?? 0} total faculty members
        </p>
      </div>

      {/* filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 flex-wrap">
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        <select
          value={filterDept}
          onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : faculty.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No faculty found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Department</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Publications</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Courses</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {faculty.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{f.faculty?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{f.email}</p>
                    {f.faculty?.designation && (
                      <p className="text-xs text-gray-400">{f.faculty.designation}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {f.faculty?.department?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[f.status]}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {f.faculty?._count?.publications ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {f.faculty?._count?.coursesTaught ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}