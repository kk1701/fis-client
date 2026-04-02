import { useEffect, useState } from "react";
import { getFacultyListApi } from "../../api/admin.api";
import { getAdminDepartmentsApi } from "../../api/admin.api";
import type { Department } from "../../types";
import api from "../../api/axios";

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
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
  SUSPENDED: "bg-gray-100 text-gray-600",
};

export default function FacultyListPage() {
  const [faculty, setFaculty] = useState<FacultyItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [page, setPage] = useState(1);

  const [resetModal, setResetModal] = useState<{
    userId: number;
    name: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetting, setResetting] = useState(false);

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

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }
    try {
      setResetting(true);
      setResetError("");
      await api.patch(`/admin/faculty/${resetModal!.userId}/reset-password`, {
        newPassword,
      });
      setResetSuccess("Password reset successfully");
      setTimeout(() => {
        setResetModal(null);
        setNewPassword("");
        setResetSuccess("");
      }, 2000);
    } catch (err: any) {
      setResetError(err.response?.data?.message ?? "Failed to reset");
    } finally {
      setResetting(false);
    }
  };

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
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
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
          onChange={(e) => {
            setFilterDept(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Loading...
          </div>
        ) : faculty.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No faculty found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Department
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Publications
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Courses
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Joined
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {faculty.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {f.faculty?.name ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">{f.email}</p>
                    {f.faculty?.designation && (
                      <p className="text-xs text-gray-400">
                        {f.faculty.designation}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {f.faculty?.department?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[f.status]}`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {f.faculty?._count?.publications ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {f.faculty?._count?.coursesTaught ?? 0}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setResetModal({
                          userId: f.id,
                          name: f.faculty?.name ?? f.email,
                        });
                        setNewPassword("");
                        setResetError("");
                        setResetSuccess("");
                      }}
                      className="text-xs text-orange-500 hover:underline"
                    >
                      Reset Password
                    </button>
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

      {/* reset password modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Reset Password
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Setting new password for{" "}
              <span className="font-medium text-gray-800">
                {resetModal.name}
              </span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {resetError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
                  {resetError}
                </div>
              )}
              {resetSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-2">
                  {resetSuccess}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setResetModal(null)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={resetting || !!resetSuccess}
                  className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {resetting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
