import { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { getQualificationDistributionApi } from "../../../api/analytics.api";
import { downloadPDF } from "../../../utils/pdf";
import PublishReportModal from "../../../components/PublishReportModal";

const COLORS = ["#1a1a2e", "#c8491a", "#6b6b8a", "#a0a0c0"];

export default function QualificationReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPublish, setShowPublish] = useState(false);

  useEffect(() => {
    getQualificationDistributionApi()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handlePDF = () => {
    downloadPDF(
      "Qualification Distribution",
      ["Department", "Total", "PhD", "PG", "UG", "Other", "PhD %", "Compliant"],
      data.deptBreakdown.map((d: any) => [
        d.department,
        d.total,
        d.phdCount,
        d.pgCount,
        d.ugCount,
        d.otherCount,
        `${d.phdPercent}%`,
        d.compliant ? "Yes" : "No",
      ]),
    );
  };

  if (loading)
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">
        Loading...
      </div>
    );

  const pieData = [
    {
      name: "Doctorate",
      value: data.institutionWide.DOCTORATE,
      fill: COLORS[0],
    },
    {
      name: "Post Graduation",
      value: data.institutionWide.POST_GRADUATION,
      fill: COLORS[1],
    },
    {
      name: "Graduation",
      value: data.institutionWide.GRADUATION,
      fill: COLORS[2],
    },
    {
      name: "Other",
      value: data.institutionWide.OTHER,
      fill: COLORS[3],
    },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Qualification Distribution
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              PhD compliance check — NAAC requires minimum 50% PhD per
              department
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPublish(true)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              🌐 Publish
            </button>
            <button
              onClick={handlePDF}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
            >
              ⬇ Download PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              ></Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-col justify-center gap-3">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: COLORS[i] }}
                />
                <span className="text-sm text-gray-700">{d.name}</span>
                <span className="ml-auto font-semibold text-gray-900">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* dept table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Department",
                "Total",
                "PhD",
                "PG",
                "UG",
                "PhD %",
                "NAAC Compliant",
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
            {data.deptBreakdown.map((d: any) => (
              <tr key={d.department} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {d.department}
                </td>
                <td className="px-4 py-3 text-gray-600">{d.total}</td>
                <td className="px-4 py-3 text-gray-600">{d.phdCount}</td>
                <td className="px-4 py-3 text-gray-600">{d.pgCount}</td>
                <td className="px-4 py-3 text-gray-600">{d.ugCount}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {d.phdPercent}%
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      d.compliant
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {d.compliant ? "✓ Compliant" : "✗ Below 50%"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPublish && (
        <PublishReportModal
          reportType="RESEARCH_DOMAINS"
          defaultTitle="Research Domain Profiling"
          data={data}
          onClose={() => setShowPublish(false)}
        />
      )}
    </div>
  );
}
