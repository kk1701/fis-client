import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getResearchMomentumApi } from '../../../api/analytics.api';
import { getAdminDepartmentsApi } from '../../../api/admin.api';
import { downloadPDF } from '../../../utils/pdf';
import type { Department } from '../../../types';

export default function ResearchMomentumReport() {
  const [data, setData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filterDept, setFilterDept] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async (deptId?: number) => {
    setLoading(true);
    const res = await getResearchMomentumApi(deptId);
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    getAdminDepartmentsApi().then((res) => setDepartments(res.data));
    fetchData();
  }, []);

  const handlePDF = () => {
    downloadPDF(
      'Faculty Research Momentum',
      ['Rank', 'Name', 'Department', 'Designation', 'Total Pubs', 'Recent (3yr)', 'Momentum Score'],
      data.map((f, i) => [
        i + 1, f.name, f.department, f.designation,
        f.totalPublications, f.recentPublications, f.momentumScore,
      ]),
    );
  };

  const chartData = data.slice(0, 12).map((f) => ({
    name: f.name.split(' ').slice(-1)[0], // last name only for chart
    fullName: f.name,
    score: f.momentumScore,
  }));

  if (loading) return <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Faculty Research Momentum</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Weighted score based on recency and indexing of publications
            </p>
          </div>
          <button
            onClick={handlePDF}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            ⬇ Download PDF
          </button>
        </div>

        {/* dept filter */}
        <div className="mb-4">
          <select
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              fetchData(e.target.value ? parseInt(e.target.value) : undefined);
            }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(val) => [val, 'Momentum Score']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
            />
            <Bar dataKey="score" fill="#c8491a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Rank', 'Name', 'Department', 'Total Pubs', 'Recent (3yr)', 'Score'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((f, i) => (
              <tr key={f.facultyId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-600' :
                    'text-gray-400'
                  }`}>
                    #{i + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-400">{f.designation}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{f.department}</td>
                <td className="px-4 py-3 text-gray-600">{f.totalPublications}</td>
                <td className="px-4 py-3 text-gray-600">{f.recentPublications}</td>
                <td className="px-4 py-3">
                  <span className="text-sm font-bold text-primary">{f.momentumScore}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}