import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicReportByIdApi } from "../../api/public-reports.api";
import { downloadPDF } from "../../utils/pdf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const REPORT_TYPE_LABELS: Record<string, string> = {
  RESEARCH_DOMAINS: "Research Domain Profiling",
  PUBLICATION_TRENDS: "Publication Trends",
  DEPARTMENT_HEALTH: "Department Health Score",
  RESEARCH_MOMENTUM: "Faculty Research Momentum",
  QUALIFICATION_DISTRIBUTION: "Qualification Distribution",
  EXPERIENCE_PROFILE: "Experience Profile",
  COURSE_LOAD: "Course Load Analysis",
  SUPERVISION_PIPELINE: "Supervision Pipeline",
};

const REPORT_TYPE_ICONS: Record<string, string> = {
  RESEARCH_DOMAINS: "🔬",
  PUBLICATION_TRENDS: "📈",
  DEPARTMENT_HEALTH: "🏛️",
  RESEARCH_MOMENTUM: "⚡",
  QUALIFICATION_DISTRIBUTION: "🎓",
  EXPERIENCE_PROFILE: "💼",
  COURSE_LOAD: "📚",
  SUPERVISION_PIPELINE: "🧑‍🏫",
};

const COLORS = [
  "#1a1a2e",
  "#c8491a",
  "#6b6b8a",
  "#a0a0c0",
  "#4a4a6a",
  "#e8745a",
];

// ── Chart Renderers ───────────────────────────────────────

function ResearchDomainsChart({ data }: { data: any[] }) {
  const chartData = data.slice(0, 15).map((d: any) => ({
    name: d.domain.length > 20 ? d.domain.slice(0, 20) + "…" : d.domain,
    fullName: d.domain,
    count: d.count,
  }));

  return (
    <div className="space-y-6">
      <div className="pub-report-card">
        <h3 className="pub-report-card-title">Top Research Domains</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 20, right: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10 }}
              width={150}
            />
            <Tooltip
              formatter={(val) => [val, "Faculty"]}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullName ?? ""
              }
            />
            <Bar dataKey="count" fill="#1a1a2e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pub-report-card">
        <h3 className="pub-report-card-title">Domain Details</h3>
        <div className="pub-table-wrap">
          <table className="pub-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Faculty Count</th>
                <th>Faculty Members</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d: any) => (
                <tr key={d.domain}>
                  <td className="font-medium">{d.domain}</td>
                  <td>{d.count}</td>
                  <td className="text-gray-500">{d.faculty?.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PublicationTrendsChart({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="pub-summary-grid">
        {[
          { label: "Total Publications", value: data.summary?.total },
          { label: "SCI Indexed", value: data.summary?.SCI },
          { label: "Scopus Indexed", value: data.summary?.SCOPUS },
          { label: "Others", value: data.summary?.NONE },
        ].map((c) => (
          <div key={c.label} className="pub-summary-card">
            <p className="pub-summary-num">{c.value ?? 0}</p>
            <p className="pub-summary-lbl">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="pub-report-card">
        <h3 className="pub-report-card-title">
          Publications by Category (per year)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.trends} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="JOURNAL" stackId="a" fill="#1a1a2e" name="Journal" />
            <Bar
              dataKey="CONFERENCE"
              stackId="a"
              fill="#c8491a"
              name="Conference"
            />
            <Bar dataKey="BOOK" stackId="a" fill="#6b6b8a" name="Book" />
            <Bar
              dataKey="BOOK_CHAPTER"
              stackId="a"
              fill="#a0a0c0"
              name="Book Chapter"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pub-report-card">
        <h3 className="pub-report-card-title">Indexing Trends (per year)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.trends} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="SCI"
              stroke="#1a1a2e"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="SCI"
            />
            <Line
              type="monotone"
              dataKey="SCOPUS"
              stroke="#c8491a"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Scopus"
            />
            <Line
              type="monotone"
              dataKey="NONE"
              stroke="#a0a0c0"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Others"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DepartmentHealthChart({ data }: { data: any[] }) {
  const scoreColor = (score: number) => {
    if (score >= 70) return "color-green";
    if (score >= 40) return "color-yellow";
    return "color-red";
  };

  return (
    <div className="space-y-6">
      <div className="pub-report-card">
        <h3 className="pub-report-card-title">Health Score by Department</h3>
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

      <div className="pub-report-card">
        <h3 className="pub-report-card-title">Department Breakdown</h3>
        <div className="pub-table-wrap">
          <table className="pub-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Score</th>
                <th>Faculty</th>
                <th>Publications</th>
                <th>PhD %</th>
                <th>Avg Exp</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d: any) => (
                <tr key={d.department}>
                  <td className="font-medium">{d.department}</td>
                  <td>
                    <span className={`score-badge ${scoreColor(d.score)}`}>
                      {d.score}/100
                    </span>
                  </td>
                  <td>{d.totalFaculty}</td>
                  <td>{d.totalPublications}</td>
                  <td
                    className={d.phdPercent >= 50 ? "text-green" : "text-red"}
                  >
                    {d.phdPercent}%
                  </td>
                  <td>{d.avgExperienceYears} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResearchMomentumChart({ data }: { data: any[] }) {
  const chartData = data.slice(0, 12).map((f: any) => ({
    name: f.name.split(" ").slice(-1)[0],
    fullName: f.name,
    score: f.momentumScore,
  }));

  return (
    <div className="space-y-6">
      <div className="pub-report-card">
        <h3 className="pub-report-card-title">Top Faculty by Momentum Score</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(val) => [val, "Momentum Score"]}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullName ?? ""
              }
            />
            <Bar dataKey="score" fill="#c8491a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pub-report-card">
        <h3 className="pub-report-card-title">Faculty Leaderboard</h3>
        <div className="pub-table-wrap">
          <table className="pub-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Department</th>
                <th>Total Pubs</th>
                <th>Recent (3yr)</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {data.map((f: any, i: number) => (
                <tr key={f.facultyId}>
                  <td>
                    <span
                      className={`rank-badge ${i < 3 ? "rank-badge--top" : ""}`}
                    >
                      #{i + 1}
                    </span>
                  </td>
                  <td className="font-medium">{f.name}</td>
                  <td className="text-gray-500">{f.department}</td>
                  <td>{f.totalPublications}</td>
                  <td>{f.recentPublications}</td>
                  <td className="font-bold text-accent">{f.momentumScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QualificationChart({ data }: { data: any }) {
  const pieData = [
    { name: "Doctorate", value: data.institutionWide?.DOCTORATE ?? 0 },
    {
      name: "Post Graduation",
      value: data.institutionWide?.POST_GRADUATION ?? 0,
    },
    { name: "Graduation", value: data.institutionWide?.GRADUATION ?? 0 },
    { name: "Other", value: data.institutionWide?.OTHER ?? 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="pub-report-card">
        <h3 className="pub-report-card-title">
          Institution-wide Qualification Distribution
        </h3>
        <div className="pie-layout">
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
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {pieData.map((d, i) => (
              <div key={d.name} className="pie-legend-item">
                <div
                  className="pie-legend-dot"
                  style={{ background: COLORS[i] }}
                />
                <span>{d.name}</span>
                <span className="pie-legend-val">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pub-report-card">
        <h3 className="pub-report-card-title">
          Department-wise PhD Compliance
        </h3>
        <div className="pub-table-wrap">
          <table className="pub-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Total</th>
                <th>PhD</th>
                <th>PG</th>
                <th>PhD %</th>
                <th>NAAC Status</th>
              </tr>
            </thead>
            <tbody>
              {data.deptBreakdown?.map((d: any) => (
                <tr key={d.department}>
                  <td className="font-medium">{d.department}</td>
                  <td>{d.total}</td>
                  <td>{d.phdCount}</td>
                  <td>{d.pgCount}</td>
                  <td>{d.phdPercent}%</td>
                  <td>
                    <span
                      className={`compliance-badge ${d.compliant ? "compliant" : "non-compliant"}`}
                    >
                      {d.compliant ? "✓ Compliant" : "✗ Below 50%"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ExperienceProfileChart({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="pub-summary-grid">
        {[
          { label: "Multi-Domain Faculty", value: data.summary?.multiDomain },
          { label: "Teaching Only", value: data.summary?.teachingOnly },
          { label: "With Industrial Exp", value: data.summary?.INDUSTRIAL },
          { label: "With Research Exp", value: data.summary?.RESEARCH },
        ].map((c) => (
          <div key={c.label} className="pub-summary-card">
            <p className="pub-summary-num">{c.value ?? 0}</p>
            <p className="pub-summary-lbl">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="pub-report-card">
        <h3 className="pub-report-card-title">
          Experience Types by Department
        </h3>
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
    </div>
  );
}

function CourseLoadChart({ data }: { data: any }) {
  const chartData = data.facultyRanking?.slice(0, 12).map((f: any) => ({
    name: f.name.split(" ").slice(-1)[0],
    fullName: f.name,
    hours: f.totalHours,
    courses: f.totalCourses,
  }));

  return (
    <div className="space-y-6">
      <div className="pub-report-card">
        <h3 className="pub-report-card-title">
          Faculty Course Load (Hours/Week)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
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
              radius={[4, 4, 0, 0]}
              name="hours"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.courseRisks?.length > 0 && (
        <div className="pub-report-card">
          <h3 className="pub-report-card-title">⚠ Single-Faculty Courses</h3>
          <p className="pub-report-card-sub">
            Courses taught by only one faculty member
          </p>
          <div className="risk-list">
            {data.courseRisks.map((c: any) => (
              <div key={c.code} className="risk-item">
                <span>{c.name}</span>
                <span className="risk-code">{c.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SupervisionPipelineChart({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="pub-report-card">
        <h3 className="pub-report-card-title">
          Thesis Supervision Pipeline by Department
        </h3>
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

      <div className="pub-report-card">
        <h3 className="pub-report-card-title">Top Supervisors</h3>
        <div className="pub-table-wrap">
          <table className="pub-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Theses</th>
                <th>Dissertations</th>
                <th>Active</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.topSupervisors?.map((f: any, i: number) => (
                <tr key={i}>
                  <td className="font-medium">{f.name}</td>
                  <td className="text-gray-500">{f.department}</td>
                  <td>{f.theses}</td>
                  <td>{f.dissertations}</td>
                  <td>
                    {f.activeTheses > 0 && (
                      <span className="active-badge">
                        {f.activeTheses} ongoing
                      </span>
                    )}
                  </td>
                  <td className="font-bold text-accent">{f.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Chart Router ──────────────────────────────────────────

function ReportCharts({ reportType, data }: { reportType: string; data: any }) {
  switch (reportType) {
    case "RESEARCH_DOMAINS":
      return <ResearchDomainsChart data={data} />;
    case "PUBLICATION_TRENDS":
      return <PublicationTrendsChart data={data} />;
    case "DEPARTMENT_HEALTH":
      return <DepartmentHealthChart data={data} />;
    case "RESEARCH_MOMENTUM":
      return <ResearchMomentumChart data={data} />;
    case "QUALIFICATION_DISTRIBUTION":
      return <QualificationChart data={data} />;
    case "EXPERIENCE_PROFILE":
      return <ExperienceProfileChart data={data} />;
    case "COURSE_LOAD":
      return <CourseLoadChart data={data} />;
    case "SUPERVISION_PIPELINE":
      return <SupervisionPipelineChart data={data} />;
    default:
      return (
        <div className="pub-report-card">
          <p className="text-gray-400 text-sm text-center py-8">
            Chart not available for this report type.
          </p>
        </div>
      );
  }
}

// ── Main Page ─────────────────────────────────────────────

export default function PublicReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPublicReportByIdApi(parseInt(id))
      .then((res) => setReport(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePDF = () => {
    if (!report) return;
    downloadPDF(
      report.title,
      ["Report Type", "Published"],
      [
        [
          REPORT_TYPE_LABELS[report.reportType] ?? report.reportType,
          new Date(report.publishedAt).toLocaleDateString(),
        ],
      ],
    );
  };

  if (loading)
    return (
      <div className="pub-detail-page">
        <div
          style={{
            padding: "8rem 2rem",
            textAlign: "center",
            color: "#6b6b8a",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Loading report...
        </div>
        <style>{BASE_STYLES}</style>
      </div>
    );

  if (notFound || !report)
    return (
      <div className="pub-detail-page">
        <div
          style={{
            padding: "8rem 2rem",
            textAlign: "center",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</p>
          <p style={{ color: "#6b6b8a" }}>Report not found.</p>
          <Link
            to="/reports"
            style={{
              color: "#c8491a",
              fontSize: "0.875rem",
              marginTop: "1rem",
              display: "block",
            }}
          >
            ← Back to Reports
          </Link>
        </div>
        <style>{BASE_STYLES}</style>
      </div>
    );

  return (
    <div className="pub-detail-page">
      {/* Navbar */}
      <nav className="dir-nav">
        <div className="dir-nav-inner">
          <Link to="/" className="dir-brand">
            <span className="brand-dot" />
            <span className="brand-name">FIS</span>
          </Link>
          <Link to="/reports" className="dir-nav-link">
            ← Back to Reports
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="pub-detail-hero">
        <div className="pub-detail-hero-inner">
          <div className="pub-detail-eyebrow">
            <span className="pub-detail-icon">
              {REPORT_TYPE_ICONS[report.reportType] ?? "📄"}
            </span>
            <span className="pub-detail-type">
              {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType}
            </span>
          </div>
          <h1 className="pub-detail-title">{report.title}</h1>
          {report.description && (
            <p className="pub-detail-desc">{report.description}</p>
          )}
          <div className="pub-detail-meta">
            <span>
              Published{" "}
              {new Date(report.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pub-detail-content">
        <div className="pub-detail-content-inner">
          {/* download button */}
          <div className="pub-detail-actions">
            <button onClick={handlePDF} className="pub-download-btn">
              ⬇ Download PDF
            </button>
          </div>

          {/* charts */}
          <ReportCharts reportType={report.reportType} data={report.data} />
        </div>
      </div>

      <style>{BASE_STYLES}</style>
    </div>
  );
}

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pub-detail-page {
    font-family: 'DM Sans', sans-serif;
    background: #f7f4ef;
    min-height: 100vh;
    color: #1a1a2e;
  }

  .dir-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(247,244,239,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(26,26,46,0.08);
  }

  .dir-nav-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 2rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dir-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }

  .brand-dot {
    width: 10px; height: 10px;
    background: #c8491a;
    border-radius: 50%;
    display: inline-block;
  }

  .brand-name {
    font-family: 'Playfair Display', serif;
    font-weight: 900;
    font-size: 1.4rem;
    color: #1a1a2e;
  }

  .dir-nav-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a4a6a;
    text-decoration: none;
    transition: color 0.2s;
  }

  .dir-nav-link:hover { color: #1a1a2e; }

  /* Hero */
  .pub-detail-hero {
    background: #1a1a2e;
    padding: 100px 2rem 3rem;
  }

  .pub-detail-hero-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  .pub-detail-eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1rem;
  }

  .pub-detail-icon { font-size: 1.5rem; }

  .pub-detail-type {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #c8491a;
  }

  .pub-detail-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.75rem, 3vw, 2.75rem);
    font-weight: 900;
    color: #f7f4ef;
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
  }

  .pub-detail-desc {
    font-size: 1rem;
    color: rgba(247,244,239,0.6);
    line-height: 1.7;
    max-width: 640px;
    margin-bottom: 1rem;
  }

  .pub-detail-meta {
    font-size: 0.8125rem;
    color: rgba(247,244,239,0.4);
  }

  /* Content */
  .pub-detail-content {
    padding: 2.5rem 2rem 5rem;
  }

  .pub-detail-content-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  .pub-detail-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1.5rem;
  }

  .pub-download-btn {
    background: #1a1a2e;
    color: #f7f4ef;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    padding: 10px 20px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
  }

  .pub-download-btn:hover { background: #c8491a; }

  /* Report Cards */
  .pub-report-card {
    background: white;
    border: 1px solid rgba(26,26,46,0.08);
    border-radius: 16px;
    padding: 1.75rem;
    margin-bottom: 1.25rem;
  }

  .pub-report-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(26,26,46,0.06);
  }

  .pub-report-card-sub {
    font-size: 0.8125rem;
    color: #6b6b8a;
    margin-bottom: 1rem;
    margin-top: -0.75rem;
  }

  /* Summary grid */
  .pub-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .pub-summary-card {
    background: white;
    border: 1px solid rgba(26,26,46,0.08);
    border-radius: 12px;
    padding: 1.25rem;
  }

  .pub-summary-num {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 900;
    color: #1a1a2e;
  }

  .pub-summary-lbl {
    font-size: 0.75rem;
    color: #6b6b8a;
    margin-top: 4px;
  }

  /* Table */
  .pub-table-wrap {
    overflow-x: auto;
  }

  .pub-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
  }

  .pub-table th {
    text-align: left;
    padding: 8px 12px;
    background: #f7f4ef;
    color: #6b6b8a;
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid rgba(26,26,46,0.08);
  }

  .pub-table td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(26,26,46,0.05);
    color: #4a4a6a;
  }

  .pub-table tr:last-child td { border-bottom: none; }
  .pub-table tr:hover td { background: #f7f4ef; }

  .font-medium { font-weight: 600; color: #1a1a2e !important; }
  .font-bold { font-weight: 700; }
  .text-accent { color: #c8491a !important; }
  .text-green { color: #15803d !important; }
  .text-red { color: #dc2626 !important; }
  .text-gray-500 { color: #6b6b8a !important; }

  /* Score badge */
  .score-badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
  }

  .color-green { background: rgba(34,197,94,0.1); color: #15803d; }
  .color-yellow { background: rgba(234,179,8,0.1); color: #b45309; }
  .color-red { background: rgba(239,68,68,0.1); color: #dc2626; }

  /* Rank badge */
  .rank-badge {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b6b8a;
  }

  .rank-badge--top { color: #c8491a; font-weight: 700; }

  /* Compliance badge */
  .compliance-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 100px;
  }

  .compliant { background: rgba(34,197,94,0.1); color: #15803d; }
  .non-compliant { background: rgba(239,68,68,0.1); color: #dc2626; }

  /* Active badge */
  .active-badge {
    font-size: 0.6875rem;
    font-weight: 500;
    background: rgba(234,179,8,0.1);
    color: #b45309;
    padding: 2px 8px;
    border-radius: 100px;
  }

  /* Pie layout */
  .pie-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: center;
  }

  .pie-legend {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pie-legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.875rem;
    color: #4a4a6a;
  }

  .pie-legend-dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .pie-legend-val {
    margin-left: auto;
    font-weight: 700;
    color: #1a1a2e;
  }

  /* Risk list */
  .risk-list { display: flex; flex-direction: column; gap: 8px; }

  .risk-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: rgba(234,179,8,0.06);
    border: 1px solid rgba(234,179,8,0.15);
    border-radius: 10px;
    font-size: 0.875rem;
  }

  .risk-code {
    font-size: 0.75rem;
    font-weight: 600;
    color: #b45309;
  }

  /* space-y-6 utility */
  .space-y-6 > * + * { margin-top: 1.5rem; }

  @media (max-width: 768px) {
    .pub-summary-grid { grid-template-columns: repeat(2, 1fr); }
    .pie-layout { grid-template-columns: 1fr; }
  }
`;
