import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getResearchDomainsApi } from '../../../api/analytics.api';
import { downloadPDF } from '../../../utils/pdf';

interface Domain {
  domain: string;
  count: number;
  faculty: string[];
}

export default function ResearchDomainsReport() {
  const [data, setData] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getResearchDomainsApi()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handlePDF = () => {
    downloadPDF(
      'Research Domain Profiling',
      ['Domain', 'Faculty Count', 'Faculty Members'],
      data.map((d) => [d.domain, d.count, d.faculty.join(', ')]),
    );
  };

  if (loading) return <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">Loading...</div>;

  const chartData = data.slice(0, 15).map((d) => ({
    name: d.domain.length > 20 ? d.domain.slice(0, 20) + '…' : d.domain,
    fullName: d.domain,
    count: d.count,
  }));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Research Domain Profiling</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Faculty grouped by research domains derived from specializations and thesis areas
            </p>
          </div>
          <button
            onClick={handlePDF}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            ⬇ Download PDF
          </button>
        </div>

        {/* summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{data.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Domains</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{data[0]?.domain ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-1">Top Domain</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{data[0]?.count ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Faculty in Top Domain</p>
          </div>
        </div>

        {/* chart */}
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
            <Tooltip
              formatter={(val) => [val, 'Faculty']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
            />
            <Bar dataKey="count" fill="#1a1a2e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* detail table */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Domain Details</h3>
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.domain} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === d.domain ? null : d.domain)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{d.domain}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {d.count} faculty
                  </span>
                </div>
                <span className="text-gray-400 text-xs">{expanded === d.domain ? '▲' : '▼'}</span>
              </button>
              {expanded === d.domain && (
                <div className="px-4 pb-3 border-t border-gray-50">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {d.faculty.map((f, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}