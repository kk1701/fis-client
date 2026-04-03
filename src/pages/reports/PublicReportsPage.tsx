import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicReportsApi } from "../../api/public-reports.api";

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

const REPORT_TYPE_DESC: Record<string, string> = {
  RESEARCH_DOMAINS:
    "Faculty grouped by active research areas and specializations",
  PUBLICATION_TRENDS:
    "Year-wise publication output across journals, conferences and books",
  DEPARTMENT_HEALTH: "Composite academic health score per department",
  RESEARCH_MOMENTUM:
    "Faculty ranked by recent publication activity and indexing quality",
  QUALIFICATION_DISTRIBUTION:
    "PhD and qualification breakdown across departments",
  EXPERIENCE_PROFILE:
    "Distribution of teaching, industrial and research experience",
  COURSE_LOAD: "Teaching workload analysis and course coverage insights",
  SUPERVISION_PIPELINE: "Thesis and dissertation supervision activity",
};

interface PublicReport {
  id: number;
  title: string;
  description?: string;
  reportType: string;
  publishedAt: string;
  publishedBy: { id: number; email: string };
}

export default function PublicReportsPage() {
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getPublicReportsApi()
      .then((res) => setReports(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? reports.filter((r) => r.reportType === filter)
    : reports;

  const uniqueTypes = [...new Set(reports.map((r) => r.reportType))];

  return (
    <div className="reports-page">
      {/* ── Navbar ── */}
      <nav className="dir-nav">
        <div className="dir-nav-inner">
          <Link to="/" className="dir-brand">
            <span className="brand-dot" />
            <span className="brand-name">FIS</span>
          </Link>
          <div className="dir-nav-links">
            <Link to="/directory" className="dir-nav-link">
              Faculty Directory
            </Link>
            <Link to="/login" className="dir-nav-link">
              Login
            </Link>
            <Link to="/register" className="dir-nav-cta">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="reports-header">
        <div className="reports-header-inner">
          <p className="dir-eyebrow">Institutional Insights</p>
          <h1 className="reports-title">Research & Analytics Reports</h1>
          <p className="reports-sub">
            Published reports from our institutional analytics — research
            output, faculty expertise, department health and more.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="reports-content">
        <div className="reports-content-inner">
          {/* filters */}
          {!loading && reports.length > 0 && (
            <div className="reports-filters">
              <button
                onClick={() => setFilter("")}
                className={`filter-chip ${filter === "" ? "filter-chip--active" : ""}`}
              >
                All Reports
              </button>
              {uniqueTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`filter-chip ${filter === type ? "filter-chip--active" : ""}`}
                >
                  {REPORT_TYPE_ICONS[type]} {REPORT_TYPE_LABELS[type] ?? type}
                </button>
              ))}
            </div>
          )}

          {/* loading skeleton */}
          {loading && (
            <div className="reports-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="report-skeleton" />
              ))}
            </div>
          )}

          {/* empty state */}
          {!loading && filtered.length === 0 && (
            <div className="reports-empty">
              <p className="empty-icon">📊</p>
              <p className="empty-title">No reports published yet</p>
              <p className="empty-sub">
                Check back later — the administration publishes reports
                periodically.
              </p>
            </div>
          )}

          {/* reports grid */}
          {!loading && filtered.length > 0 && (
            <div className="reports-grid">
              {filtered.map((r) => (
                <Link
                  key={r.id}
                  to={`/reports/${r.id}`}
                  className="report-card"
                >
                  <div className="report-card-icon">
                    {REPORT_TYPE_ICONS[r.reportType] ?? "📄"}
                  </div>

                  <div className="report-card-body">
                    <p className="report-card-type">
                      {REPORT_TYPE_LABELS[r.reportType] ?? r.reportType}
                    </p>
                    <h3 className="report-card-title">{r.title}</h3>
                    <p className="report-card-desc">
                      {r.description || REPORT_TYPE_DESC[r.reportType]}
                    </p>
                  </div>

                  <div className="report-card-footer">
                    <span className="report-card-date">
                      {new Date(r.publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="report-card-arrow">View Report →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .reports-page {
    font-family: 'DM Sans', sans-serif;
    background: #f7f4ef;
    min-height: 100vh;
    color: #1a1a2e;
  }

  /* reuse navbar styles from directory */
  .dir-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(247,244,239,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(26,26,46,0.08);
  }

  .dir-nav-inner {
    max-width: 1200px;
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

  .dir-nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .dir-nav-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a4a6a;
    text-decoration: none;
    transition: color 0.2s;
  }

  .dir-nav-link:hover { color: #1a1a2e; }

  .dir-nav-cta {
    font-size: 0.875rem;
    font-weight: 600;
    color: #f7f4ef;
    background: #1a1a2e;
    padding: 8px 20px;
    border-radius: 100px;
    text-decoration: none;
    transition: background 0.2s;
  }

  .dir-nav-cta:hover { background: #c8491a; }

  .dir-eyebrow {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #c8491a;
    margin-bottom: 1rem;
  }

  /* Header */
  .reports-header {
    background: #1a1a2e;
    padding: 120px 2rem 60px;
    text-align: center;
  }

  .reports-header-inner {
    max-width: 640px;
    margin: 0 auto;
  }

  .reports-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 900;
    color: #f7f4ef;
    letter-spacing: -0.03em;
    margin-bottom: 1rem;
  }

  .reports-sub {
    font-size: 1rem;
    color: rgba(247,244,239,0.6);
    line-height: 1.7;
  }

  /* Content */
  .reports-content {
    padding: 3rem 2rem 5rem;
  }

  .reports-content-inner {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Filters */
  .reports-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .filter-chip {
    font-size: 0.8125rem;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    padding: 6px 14px;
    border-radius: 100px;
    border: 1.5px solid rgba(26,26,46,0.12);
    background: white;
    color: #4a4a6a;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .filter-chip:hover {
    border-color: #1a1a2e;
    color: #1a1a2e;
  }

  .filter-chip--active {
    background: #1a1a2e;
    color: #f7f4ef;
    border-color: #1a1a2e;
  }

  /* Grid */
  .reports-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  /* Report Card */
  .report-card {
    background: white;
    border: 1px solid rgba(26,26,46,0.08);
    border-radius: 20px;
    padding: 1.75rem;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    position: relative;
    overflow: hidden;
  }

  .report-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1a1a2e, #c8491a);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .report-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(26,26,46,0.12);
    border-color: rgba(200,73,26,0.15);
  }

  .report-card:hover::before { opacity: 1; }

  .report-card-icon {
    font-size: 2rem;
  }

  .report-card-body {
    flex: 1;
  }

  .report-card-type {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #c8491a;
    margin-bottom: 6px;
  }

  .report-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.0625rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .report-card-desc {
    font-size: 0.8125rem;
    color: #6b6b8a;
    line-height: 1.6;
  }

  .report-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 1rem;
    border-top: 1px solid rgba(26,26,46,0.06);
  }

  .report-card-date {
    font-size: 0.75rem;
    color: #a0a0c0;
  }

  .report-card-arrow {
    font-size: 0.75rem;
    font-weight: 600;
    color: #c8491a;
    transition: transform 0.2s;
  }

  .report-card:hover .report-card-arrow {
    transform: translateX(4px);
  }

  /* Skeleton */
  .report-skeleton {
    height: 260px;
    background: white;
    border-radius: 20px;
    border: 1px solid rgba(26,26,46,0.08);
    animation: shimmer 1.4s infinite;
  }

  @keyframes shimmer {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Empty */
  .reports-empty {
    text-align: center;
    padding: 6rem 2rem;
  }

  .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
  .empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 0.5rem;
  }
  .empty-sub { font-size: 0.875rem; color: #6b6b8a; }

  @media (max-width: 900px) {
    .reports-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 560px) {
    .reports-grid { grid-template-columns: 1fr; }
    .dir-nav-links .dir-nav-link { display: none; }
  }
`;
