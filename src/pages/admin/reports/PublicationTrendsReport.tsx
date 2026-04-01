import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, LineChart, Line,
} from 'recharts';
import { getPublicationTrendsApi } from '../../../api/analytics.api';
import { downloadPDF } from '../../../utils/pdf';

export default function PublicationTrendsReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'category' | 'indexing'>('category');

  useEffect(() => {
    getPublicationTrendsApi()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handlePDF = () => {
    downloadPDF(
      'Publication Trends',
      ['Year', 'Total', 'Journal', 'Conference', 'Book', 'Book Chapter', 'SCI', 'Scopus'],
      data.trends.map((t: any) => [
        t.year, t.total, t.JOURNAL, t.CONFERENCE,
        t.BOOK, t.BOOK_CHAPTER, t.SCI, t.SCOPUS,
      ]),
    );
  };

  if (loading) return <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Publication Trends</h2>
            <p className="text-xs text-gray-400 mt-0.5">Year-wise publication output analysis</p>
          </div>
          <button
            onClick={handlePDF}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            ⬇ Download PDF
          </button>
        </div>

        {/* summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Publications', value: data.summary.total, color: 'bg-gray-900 text-white' },
            { label: 'SCI Indexed', value: data.summary.SCI, color: 'bg-blue-900 text-white' },
            { label: 'Scopus Indexed', value: data.summary.SCOPUS, color: 'bg-indigo-100 text-indigo-800' },
            { label: 'Others', value: data.summary.NONE, color: 'bg-gray-100 text-gray-700' },
          ].map((c) => (
            <div key={c.label} className={`rounded-xl p-4 ${c.color}`}>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs mt-1 opacity-80">{c.label}</p>
            </div>
          ))}
        </div>

        {/* chart toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setChartType('category')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              chartType === 'category' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            By Category
          </button>
          <button
            onClick={() => setChartType('indexing')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              chartType === 'indexing' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            By Indexing
          </button>
        </div>

        {chartType === 'category' ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.trends} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="JOURNAL" stackId="a" fill="#1a1a2e" name="Journal" />
              <Bar dataKey="CONFERENCE" stackId="a" fill="#c8491a" name="Conference" />
              <Bar dataKey="BOOK" stackId="a" fill="#6b6b8a" name="Book" />
              <Bar dataKey="BOOK_CHAPTER" stackId="a" fill="#a0a0c0" name="Book Chapter" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.trends} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="SCI" stroke="#1a1a2e" strokeWidth={2} dot={{ r: 4 }} name="SCI" />
              <Line type="monotone" dataKey="SCOPUS" stroke="#c8491a" strokeWidth={2} dot={{ r: 4 }} name="Scopus" />
              <Line type="monotone" dataKey="NONE" stroke="#a0a0c0" strokeWidth={2} dot={{ r: 4 }} name="Others" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}