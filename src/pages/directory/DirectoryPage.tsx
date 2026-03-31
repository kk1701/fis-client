import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getDirectoryApi } from '../../api/directory.api';
import api from '../../api/axios';
import type { Department } from '../../types';

interface FacultyCard {
  id: number;
  name: string;
  designation: string | null;
  photoUrl: string | null;
  specialization: string[];
  highestQualification: string | null;
  experienceYears: number | null;
  department: Department;
  _count: { publications: number; coursesTaught: number };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function DirectoryPage() {
  const [faculty, setFaculty] = useState<FacultyCard[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [page, setPage] = useState(1);

  const fetchFaculty = useCallback(async () => {
    setLoading(true);
    const res = await getDirectoryApi({
      search: search || undefined,
      departmentId: filterDept ? parseInt(filterDept) : undefined,
      page,
      limit: 12,
    });
    setFaculty(res.data.data);
    setMeta(res.data.meta);
    setLoading(false);
  }, [search, filterDept, page]);

  useEffect(() => {
    api.get<Department[]>('/departments').then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="directory-page">

      {/* ── Navbar ── */}
      <nav className="dir-nav">
        <div className="dir-nav-inner">
          <Link to="/" className="dir-brand">
            <span className="brand-dot" />
            <span className="brand-name">FIS</span>
          </Link>
          <div className="dir-nav-links">
            <Link to="/login" className="dir-nav-link">Login</Link>
            <Link to="/register" className="dir-nav-cta">Register</Link>
          </div>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="dir-header">
        <div className="dir-header-inner">
          <p className="dir-eyebrow">Public Directory</p>
          <h1 className="dir-title">Faculty Directory</h1>
          <p className="dir-sub">
            Browse profiles of our faculty members — their research, publications, and expertise.
          </p>

          {/* search */}
          <div className="dir-search-wrap">
            <span className="search-icon">🔍</span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name..."
              className="dir-search"
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="dir-content">
        <div className="dir-content-inner">

          {/* filters */}
          <div className="dir-filters">
            <span className="filter-label">Filter by:</span>
            <select
              value={filterDept}
              onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
              className="dir-select"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            {(filterDept || search) && (
              <button
                onClick={() => { setFilterDept(''); setSearchInput(''); setPage(1); }}
                className="dir-clear"
              >
                Clear filters ×
              </button>
            )}

            {meta && (
              <span className="dir-count">{meta.total} faculty members</span>
            )}
          </div>

          {/* grid */}
          {loading ? (
            <div className="dir-loading">
              <div className="loading-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            </div>
          ) : faculty.length === 0 ? (
            <div className="dir-empty">
              <p className="empty-icon">🔍</p>
              <p className="empty-text">No faculty found matching your search.</p>
            </div>
          ) : (
            <div className="faculty-grid">
              {faculty.map((f) => (
                <Link
                  key={f.id}
                  to={`/directory/${f.id}`}
                  className="faculty-card"
                >
                  {/* avatar */}
                  <div className="card-avatar">
                    {f.photoUrl ? (
                      <img src={f.photoUrl} alt={f.name} className="avatar-img" />
                    ) : (
                      <div className="avatar-placeholder">
                        {f.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* info */}
                  <div className="card-info">
                    <h3 className="card-name">{f.name}</h3>
                    {f.designation && (
                      <p className="card-designation">{f.designation}</p>
                    )}
                    <p className="card-dept">{f.department?.name}</p>

                    {/* specializations */}
                    {f.specialization?.length > 0 && (
                      <div className="card-tags">
                        {f.specialization.slice(0, 2).map((s, i) => (
                          <span key={i} className="card-tag">{s}</span>
                        ))}
                        {f.specialization.length > 2 && (
                          <span className="card-tag card-tag--more">
                            +{f.specialization.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* stats */}
                  <div className="card-stats">
                    <div className="card-stat">
                      <span className="stat-num">{f._count.publications}</span>
                      <span className="stat-lbl">Publications</span>
                    </div>
                    <div className="card-stat-divider" />
                    <div className="card-stat">
                      <span className="stat-num">{f._count.coursesTaught}</span>
                      <span className="stat-lbl">Courses</span>
                    </div>
                    {f.experienceYears && (
                      <>
                        <div className="card-stat-divider" />
                        <div className="card-stat">
                          <span className="stat-num">{f.experienceYears}</span>
                          <span className="stat-lbl">Yrs Exp.</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="card-arrow">→</div>
                </Link>
              ))}
            </div>
          )}

          {/* pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="dir-pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="page-btn"
              >
                ← Prev
              </button>
              <span className="page-info">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="page-btn"
              >
                Next →
              </button>
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

  .directory-page {
    font-family: 'DM Sans', sans-serif;
    background: #f7f4ef;
    min-height: 100vh;
    color: #1a1a2e;
  }

  /* Navbar */
  .dir-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(247, 244, 239, 0.92);
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

  /* Header */
  .dir-header {
    padding: 120px 2rem 60px;
    background: #1a1a2e;
    text-align: center;
  }

  .dir-header-inner {
    max-width: 640px;
    margin: 0 auto;
  }

  .dir-eyebrow {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #c8491a;
    margin-bottom: 1rem;
  }

  .dir-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 900;
    color: #f7f4ef;
    letter-spacing: -0.03em;
    margin-bottom: 1rem;
  }

  .dir-sub {
    font-size: 1rem;
    color: rgba(247,244,239,0.6);
    line-height: 1.7;
    margin-bottom: 2.5rem;
  }

  /* Search */
  .dir-search-wrap {
    position: relative;
    max-width: 480px;
    margin: 0 auto;
  }

  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
    pointer-events: none;
  }

  .dir-search {
    width: 100%;
    background: rgba(247,244,239,0.1);
    border: 1.5px solid rgba(247,244,239,0.15);
    color: #f7f4ef;
    padding: 14px 20px 14px 44px;
    border-radius: 100px;
    font-size: 0.9375rem;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }

  .dir-search::placeholder { color: rgba(247,244,239,0.4); }
  .dir-search:focus {
    border-color: rgba(247,244,239,0.4);
    background: rgba(247,244,239,0.15);
  }

  /* Content */
  .dir-content {
    padding: 3rem 2rem 5rem;
  }

  .dir-content-inner {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Filters */
  .dir-filters {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .filter-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b6b8a;
  }

  .dir-select {
    border: 1.5px solid rgba(26,26,46,0.12);
    border-radius: 100px;
    padding: 8px 16px;
    font-size: 0.875rem;
    font-family: 'DM Sans', sans-serif;
    background: white;
    color: #1a1a2e;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .dir-select:focus { border-color: #1a1a2e; }

  .dir-clear {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #c8491a;
    background: rgba(200,73,26,0.08);
    border: 1px solid rgba(200,73,26,0.15);
    padding: 6px 14px;
    border-radius: 100px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .dir-clear:hover { background: rgba(200,73,26,0.15); }

  .dir-count {
    font-size: 0.8125rem;
    color: #6b6b8a;
    margin-left: auto;
  }

  /* Faculty Grid */
  .faculty-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  /* Faculty Card */
  .faculty-card {
    background: white;
    border: 1px solid rgba(26,26,46,0.08);
    border-radius: 20px;
    padding: 1.75rem;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    overflow: hidden;
  }

  .faculty-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(26,26,46,0.12);
    border-color: rgba(200,73,26,0.2);
  }

  .faculty-card:hover .card-arrow {
    opacity: 1;
    transform: translateX(0);
  }

  /* Avatar */
  .card-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(26,26,46,0.08);
    flex-shrink: 0;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: #1a1a2e;
    color: #f7f4ef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 700;
  }

  /* Card Info */
  .card-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.0625rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 2px;
  }

  .card-designation {
    font-size: 0.8125rem;
    color: #c8491a;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .card-dept {
    font-size: 0.8125rem;
    color: #6b6b8a;
  }

  /* Tags */
  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .card-tag {
    font-size: 0.6875rem;
    font-weight: 500;
    background: rgba(26,26,46,0.06);
    color: #4a4a6a;
    padding: 3px 10px;
    border-radius: 100px;
  }

  .card-tag--more {
    background: rgba(200,73,26,0.08);
    color: #c8491a;
  }

  /* Card Stats */
  .card-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 1rem;
    border-top: 1px solid rgba(26,26,46,0.06);
    margin-top: auto;
  }

  .card-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-num {
    font-size: 1rem;
    font-weight: 700;
    color: #1a1a2e;
    font-family: 'Playfair Display', serif;
  }

  .stat-lbl {
    font-size: 0.6875rem;
    color: #6b6b8a;
    white-space: nowrap;
  }

  .card-stat-divider {
    width: 1px;
    height: 24px;
    background: rgba(26,26,46,0.08);
  }

  /* Arrow */
  .card-arrow {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    font-size: 1rem;
    color: #c8491a;
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity 0.2s, transform 0.2s;
  }

  /* Skeleton */
  .loading-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  .skeleton-card {
    height: 240px;
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
  .dir-empty {
    text-align: center;
    padding: 5rem 2rem;
  }

  .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
  .empty-text { font-size: 1rem; color: #6b6b8a; }

  /* Pagination */
  .dir-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 3rem;
  }

  .page-btn {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1a1a2e;
    background: white;
    border: 1.5px solid rgba(26,26,46,0.12);
    padding: 10px 20px;
    border-radius: 100px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    font-family: 'DM Sans', sans-serif;
  }

  .page-btn:hover:not(:disabled) {
    border-color: #1a1a2e;
    background: rgba(26,26,46,0.04);
  }

  .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .page-info {
    font-size: 0.875rem;
    color: #6b6b8a;
  }

  @media (max-width: 900px) {
    .faculty-grid, .loading-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 560px) {
    .faculty-grid, .loading-grid { grid-template-columns: 1fr; }
    .dir-count { display: none; }
  }
`;