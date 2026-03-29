import { useEffect, useState } from 'react';
import {
  getPendingApprovalsApi,
  approveFacultyApi,
  rejectFacultyApi,
} from '../../api/admin.api';

interface PendingUser {
  id: number;
  name: string;
  email: string;
  department: { id: number; name: string; code: string } | null;
  appliedAt: string;
}

export default function ApprovalsPage() {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    const res = await getPendingApprovalsApi();
    setPending(res.data);
  };

  useEffect(() => {
    fetchPending().finally(() => setLoading(false));
  }, []);

  const handleApprove = async (userId: number) => {
    if (!confirm('Approve this faculty account?')) return;
    setActionLoading(true);
    await approveFacultyApi(userId);
    await fetchPending();
    setActionLoading(false);
  };

  const handleReject = async (userId: number) => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    await rejectFacultyApi(userId, rejectReason);
    setRejectingId(null);
    setRejectReason('');
    await fetchPending();
    setActionLoading(false);
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {pending.length} pending account{pending.length !== 1 ? 's' : ''}
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-gray-500 text-sm">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-2xl shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                  <div className="flex gap-3 mt-1">
                    {u.department && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {u.department.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      Applied: {new Date(u.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(u.id)}
                    disabled={actionLoading}
                    className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setRejectingId(u.id);
                      setRejectReason('');
                    }}
                    disabled={actionLoading}
                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* reject reason input */}
              {rejectingId === u.id && (
                <div className="mt-4 flex gap-2">
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <button
                    onClick={() => handleReject(u.id)}
                    disabled={!rejectReason.trim() || actionLoading}
                    className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 transition disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setRejectingId(null)}
                    className="text-gray-400 text-xs hover:text-gray-600 px-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}