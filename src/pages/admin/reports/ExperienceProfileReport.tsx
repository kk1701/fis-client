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
import { getExperienceProfileApi } from "../../../api/analytics.api";
import { downloadPDF } from "../../../utils/pdf";
import PublishReportModal from "../../../components/PublishReportModal";

export default function ExperienceProfileReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPublish, setShowPublish] = useState(false);

  useEffect(() => {
    getExperienceProfileApi()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handlePDF = () => {
    downloadPDF(
      "Experience Profile",
      [
        "Department",
        "Total Faculty",
        "Teaching",
        "Industrial",
        "Research",
        "Admin",
        "Multi-Domain",
        "Teaching Only",
      ],
      data.deptData.map((d: any) => [
        d.department,
        d.totalFaculty,
        d.TEACHING,
        d.INDUSTRIAL,
        d.RESEARCH,
        d.ADMINISTRATIVE,
        d.multiDomain,
        d.teachingOnly,
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
    <div>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Experience Profile
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Distribution of experience types across departments
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

        {/* summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Multi-Domain Faculty", value: data.summary.multiDomain },
            { label: "Teaching Only", value: data.summary.teachingOnly },
            { label: "With Industrial Exp", value: data.summary.INDUSTRIAL },
            { label: "With Research Exp", value: data.summary.RESEARCH },
          ].map((c) => (
            <div key={c.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.deptData} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="TEACHING" fill="#1a1a2e" name="Teaching" />
            <Bar dataKey="INDUSTRIAL" fill="#c8491a" name="Industrial" />
            <Bar dataKey="RESEARCH" fill="#6b6b8a" name="Research" />
            <Bar
              dataKey="ADMINISTRATIVE"
              fill="#a0a0c0"
              name="Administrative"
            />
          </BarChart>
        </ResponsiveContainer>
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
