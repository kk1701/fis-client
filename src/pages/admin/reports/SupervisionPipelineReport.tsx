import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { getSupervisionPipelineApi } from "../../../api/analytics.api";
import { downloadPDF } from "../../../utils/pdf";

export default function SupervisionPipelineReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupervisionPipelineApi()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handlePDF = () => {
    downloadPDF(
      "Supervision Pipeline",
      [
        "Department",
        "Total Faculty",
        "Ongoing",
        "Submitted",
        "Completed",
        "Awarded",
        "Dissertations",
      ],
      data.deptData.map((d: any) => [
        d.department,
        d.totalFaculty,
        d.Ongoing,
        d.Submitted,
        d.Completed,
        d.Awarded,
        d.totalDissertations,
      ]),
    );
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
              Supervision Pipeline
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Thesis and dissertation supervision activity per department
            </p>
          </div>
          <button
            onClick={handlePDF}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            ⬇ Download PDF
          </button>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.deptData} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Ongoing" stackId="a" fill="#c8491a" name="Ongoing" />
            <Bar
              dataKey="Submitted"
              stackId="a"
              fill="#6b6b8a"
              name="Submitted"
            />
            <Bar
              dataKey="Completed"
              stackId="a"
              fill="#1a1a2e"
              name="Completed"
            />
            <Bar
              dataKey="Awarded"
              stackId="a"
              fill="#a0a0c0"
              name="Awarded"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* top supervisors */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">
            Top Supervisors
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Name",
                "Department",
                "Theses",
                "Dissertations",
                "Active Theses",
                "Total",
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
            {data.topSupervisors.map((f: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {f.name}
                </td>
                <td className="px-4 py-3 text-gray-600">{f.department}</td>
                <td className="px-4 py-3 text-gray-600">{f.theses}</td>
                <td className="px-4 py-3 text-gray-600">{f.dissertations}</td>
                <td className="px-4 py-3">
                  {f.activeTheses > 0 && (
                    <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                      {f.activeTheses} ongoing
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-primary">
                  {f.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
