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
import { getCourseLoadApi } from "../../../api/analytics.api";
import { downloadPDF } from "../../../utils/pdf";

export default function CourseLoadReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState("");

  const fetchData = async (year?: string) => {
    setLoading(true);
    const res = await getCourseLoadApi(year);
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePDF = () => {
    downloadPDF(
      "Course Load Analysis",
      ["Faculty", "Department", "Total Courses", "Total Hours/Week"],
      data.facultyRanking.map((f: any) => [
        f.name,
        f.department,
        f.totalCourses,
        f.totalHours,
      ]),
    );
  };

  if (loading)
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">
        Loading...
      </div>
    );

  const chartData = data.facultyRanking.map((f: any) => ({
    name: f.name.split(" ").slice(-1)[0],
    fullName: f.name,
    hours: f.totalHours,
    courses: f.totalCourses,
  }));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Course Load Analysis
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Faculty workload by hours per week and course count
            </p>
          </div>
          <button
            onClick={handlePDF}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            ⬇ Download PDF
          </button>
        </div>

        <div className="mb-4">
          <input
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            onBlur={() => fetchData(yearFilter || undefined)}
            placeholder="Filter by academic year e.g. 2024-25"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
          />
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(val, name) => [
                val,
                name === "hours" ? "Hours/Week" : "Courses",
              ]}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullName ?? ""
              }
            />
            <Bar
              dataKey="hours"
              fill="#1a1a2e"
              name="hours"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* at-risk courses */}
      {data.courseRisks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            ⚠ Single-Faculty Courses
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Courses taught by only one faculty — potential single point of
            failure
          </p>
          <div className="space-y-2">
            {data.courseRisks.map((c: any) => (
              <div
                key={c.code}
                className="flex items-center justify-between px-4 py-2.5 bg-orange-50 border border-orange-100 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-800">
                  {c.name}
                </span>
                <span className="text-xs text-orange-600 font-medium">
                  {c.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
