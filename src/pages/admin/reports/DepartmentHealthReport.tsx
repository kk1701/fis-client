import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getDepartmentHealthApi } from "../../../api/analytics.api";
import { downloadPDF } from "../../../utils/pdf";

export default function DepartmentHealthReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDepartmentHealthApi()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handlePDF = () => {
    downloadPDF(
      "Department Health Score",
      [
        "Department",
        "Score",
        "Faculty",
        "Publications",
        "SCI/Scopus",
        "PhD %",
        "Avg Exp (yrs)",
        "Active Theses",
      ],
      data.map((d) => [
        d.department,
        d.score,
        d.totalFaculty,
        d.totalPublications,
        d.sciScopusCount,
        `${d.phdPercent}%`,
        d.avgExperienceYears,
        d.activeTheses,
      ]),
    );
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (loading)
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">
        Loading...
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Department Health Score
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Composite score based on publications, qualifications, experience
              and research activity
            </p>
          </div>
          <button
            onClick={handlePDF}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            ⬇ Download PDF
          </button>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(val) => [`${val}/100`, "Health Score"]} />
            <Bar dataKey="score" fill="#1a1a2e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* detail table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Department",
                "Score",
                "Faculty",
                "Publications",
                "SCI/Scopus",
                "PhD %",
                "Avg Exp",
                "Active Theses",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-medium text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((d) => (
              <tr key={d.department} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {d.department}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-sm font-bold px-2 py-0.5 rounded-lg ${scoreColor(d.score)}`}
                  >
                    {d.score}/100
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{d.totalFaculty}</td>
                <td className="px-4 py-3 text-gray-600">
                  {d.totalPublications}
                </td>
                <td className="px-4 py-3 text-gray-600">{d.sciScopusCount}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${d.phdPercent >= 50 ? "text-green-600" : "text-red-500"}`}
                  >
                    {d.phdPercent}% {d.phdPercent >= 50 ? "✓" : "✗"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {d.avgExperienceYears} yrs
                </td>
                <td className="px-4 py-3 text-gray-600">{d.activeTheses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
