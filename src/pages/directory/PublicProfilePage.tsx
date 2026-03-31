import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProfileApi } from '../../api/directory.api';

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      getPublicProfileApi(parseInt(id))
        .then((res) => setProfile(res.data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', padding: '8rem 2rem', textAlign: 'center', color: '#6b6b8a' }}>
      Loading profile...
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');`}</style>
    </div>
  );

  if (!profile) return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', padding: '8rem 2rem', textAlign: 'center', color: '#6b6b8a' }}>
      Faculty not found.
    </div>
  );

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'courses', label: `Courses (${profile.coursesTaught?.length ?? 0})` },
    { key: 'experience', label: `Experience (${profile.experiences?.length ?? 0})` },
    { key: 'publications', label: `Publications (${profile.publications?.length ?? 0})` },
    ...(profile.theses?.length > 0 ? [{ key: 'thesis', label: `Thesis (${profile.theses.length})` }] : []),
  ];

  return (
    <div className="pub-profile">

      {/* Navbar */}
      <nav className="dir-nav">
        <div className="dir-nav-inner">
          <Link to="/" className="dir-brand">
            <span className="brand-dot" />
            <span className="brand-name">FIS</span>
          </Link>
          <Link to="/directory" className="dir-nav-link">← Back to Directory</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="pub-hero">
        <div className="pub-hero-inner">
          <div className="pub-avatar">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.name} />
            ) : (
              <div className="pub-avatar-placeholder">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="pub-hero-info">
            <p className="pub-dept">{profile.department?.name}</p>
            <h1 className="pub-name">{profile.name}</h1>
            {profile.designation && (
              <p className="pub-designation">{profile.designation}</p>
            )}
            <div className="pub-meta">
              {profile.highestQualification && (
                <span className="pub-meta-item">🎓 {profile.highestQualification}</span>
              )}
              {profile.experienceYears && (
                <span className="pub-meta-item">📅 {profile.experienceYears} years experience</span>
              )}
              {profile.orcidId && (
                <a
                  href={`https://orcid.org/${profile.orcidId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="pub-meta-item pub-meta-link"
                >
                  🔗 ORCID
                </a>
              )}
            </div>
            {profile.specialization?.length > 0 && (
              <div className="pub-tags">
                {profile.specialization.map((s: string, i: number) => (
                  <span key={i} className="pub-tag">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pub-tabs-bar">
        <div className="pub-tabs-inner">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`pub-tab ${activeTab === t.key ? 'pub-tab--active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pub-content">
        <div className="pub-content-inner">

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="pub-section-grid">
              {profile.degrees?.length > 0 && (
                <div className="pub-card">
                  <h3 className="pub-card-title">Education</h3>
                  <div className="space-list">
                    {profile.degrees.map((d: any, i: number) => (
                      <div key={i} className="list-item">
                        <p className="list-item-title">{d.degreeName}</p>
                        <p className="list-item-sub">{d.specialization} — {d.institute}</p>
                        <p className="list-item-meta">{d.yearOfPassing}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pub-card">
                <h3 className="pub-card-title">Quick Stats</h3>
                <div className="quick-stats">
                  <div className="quick-stat">
                    <span className="qs-num">{profile.publications?.length ?? 0}</span>
                    <span className="qs-lbl">Publications</span>
                  </div>
                  <div className="quick-stat">
                    <span className="qs-num">{profile.coursesTaught?.length ?? 0}</span>
                    <span className="qs-lbl">Courses Taught</span>
                  </div>
                  <div className="quick-stat">
                    <span className="qs-num">{profile.experiences?.length ?? 0}</span>
                    <span className="qs-lbl">Experiences</span>
                  </div>
                  <div className="quick-stat">
                    <span className="qs-num">{profile.theses?.length ?? 0}</span>
                    <span className="qs-lbl">Theses</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courses */}
          {activeTab === 'courses' && (
            <div className="pub-card">
              <h3 className="pub-card-title">Courses Taught / Teaching</h3>
              {profile.coursesTaught?.length === 0 ? (
                <p className="empty-msg">No course records available.</p>
              ) : (
                <div className="space-list">
                  {profile.coursesTaught?.map((c: any, i: number) => (
                    <div key={i} className="list-item list-item--row">
                      <div>
                        <p className="list-item-title">{c.catalogCourse?.name}</p>
                        <p className="list-item-sub">{c.catalogCourse?.code} — {c.catalogCourse?.level}</p>
                      </div>
                      <div className="list-item-right">
                        <span className="tag-pill">{c.semester}</span>
                        <span className="tag-pill">{c.academicYear}</span>
                        <span className="tag-pill tag-pill--role">{c.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Experience */}
          {activeTab === 'experience' && (
            <div className="pub-card">
              <h3 className="pub-card-title">Experience</h3>
              {profile.experiences?.length === 0 ? (
                <p className="empty-msg">No experience records available.</p>
              ) : (
                <div className="space-list">
                  {profile.experiences?.map((e: any, i: number) => (
                    <div key={i} className="list-item">
                      <div className="list-item-header">
                        <span className="exp-type-badge">{e.type}</span>
                        {e.location && <span className="list-item-meta">📍 {e.location}</span>}
                      </div>
                      <p className="list-item-title">{e.designation}</p>
                      <p className="list-item-sub">{e.organization}</p>
                      <p className="list-item-meta">
                        {e.startDate?.split('T')[0]} → {e.endDate ? e.endDate.split('T')[0] : 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Publications */}
          {activeTab === 'publications' && (
            <div className="pub-card">
              <h3 className="pub-card-title">Publications</h3>
              {profile.publications?.length === 0 ? (
                <p className="empty-msg">No publications available.</p>
              ) : (
                <div className="space-list">
                  {profile.publications?.map((p: any, i: number) => (
                    <div key={i} className="list-item">
                      <div className="list-item-header">
                        <span className="pub-type-badge">{p.category.replace('_', ' ')}</span>
                        {p.indexing !== 'NONE' && (
                          <span className="indexing-badge">{p.indexing}</span>
                        )}
                        <span className="list-item-meta">{p.year}</span>
                      </div>
                      <p className="list-item-title">{p.title}</p>
                      <p className="list-item-sub">{p.authors?.join(', ')}</p>
                      {p.venue && <p className="list-item-meta italic">{p.venue}</p>}
                      {p.doi && (
                        <a
                          href={`https://doi.org/${p.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="doi-link"
                        >
                          DOI: {p.doi}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Thesis */}
          {activeTab === 'thesis' && (
            <div className="pub-card">
              <h3 className="pub-card-title">Thesis Supervisions</h3>
              <div className="space-list">
                {profile.theses?.map((t: any, i: number) => (
                  <div key={i} className="list-item">
                    <p className="list-item-title">{t.title}</p>
                    <p className="list-item-sub">{t.researchArea}</p>
                    <div className="list-item-header" style={{ marginTop: '4px' }}>
                      <span className="tag-pill">{t.year}</span>
                      <span className="tag-pill">{t.role}</span>
                      <span className={`tag-pill ${t.status === 'Completed' ? 'tag-pill--green' : 'tag-pill--orange'}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{PROFILE_STYLES}</style>
    </div>
  );
}

const PROFILE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pub-profile {
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
  .pub-hero {
    background: #1a1a2e;
    padding: 100px 2rem 3rem;
  }

  .pub-hero-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }

  .pub-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid rgba(247,244,239,0.15);
    flex-shrink: 0;
  }

  .pub-avatar img {
    width: 100%; height: 100%;
    object-fit: cover;
  }

  .pub-avatar-placeholder {
    width: 100%; height: 100%;
    background: rgba(200,73,26,0.3);
    color: #f7f4ef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    font-weight: 700;
  }

  .pub-dept {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #c8491a;
    margin-bottom: 0.5rem;
  }

  .pub-name {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.75rem, 3vw, 2.75rem);
    font-weight: 900;
    color: #f7f4ef;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .pub-designation {
    font-size: 1rem;
    color: rgba(247,244,239,0.7);
    margin-bottom: 1rem;
  }

  .pub-meta {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .pub-meta-item {
    font-size: 0.8125rem;
    color: rgba(247,244,239,0.6);
  }

  .pub-meta-link {
    color: #c8491a;
    text-decoration: none;
  }

  .pub-meta-link:hover { text-decoration: underline; }

  .pub-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pub-tag {
    font-size: 0.75rem;
    font-weight: 500;
    background: rgba(247,244,239,0.1);
    color: rgba(247,244,239,0.8);
    padding: 4px 12px;
    border-radius: 100px;
    border: 1px solid rgba(247,244,239,0.12);
  }

  /* Tabs */
  .pub-tabs-bar {
    background: white;
    border-bottom: 1px solid rgba(26,26,46,0.08);
    position: sticky;
    top: 64px;
    z-index: 10;
  }

  .pub-tabs-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    gap: 0;
    overflow-x: auto;
  }

  .pub-tab {
    padding: 1rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    color: #6b6b8a;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.2s, border-color 0.2s;
  }

  .pub-tab:hover { color: #1a1a2e; }

  .pub-tab--active {
    color: #1a1a2e;
    border-bottom-color: #c8491a;
    font-weight: 600;
  }

  /* Content */
  .pub-content {
    padding: 2.5rem 2rem 5rem;
  }

  .pub-content-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  .pub-section-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  .pub-card {
    background: white;
    border: 1px solid rgba(26,26,46,0.08);
    border-radius: 16px;
    padding: 1.75rem;
  }

  .pub-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(26,26,46,0.06);
  }

  /* List items */
  .space-list { display: flex; flex-direction: column; gap: 1rem; }

  .list-item {
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(26,26,46,0.05);
  }

  .list-item:last-child { border-bottom: none; padding-bottom: 0; }

  .list-item--row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .list-item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    flex-wrap: wrap;
  }

  .list-item-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1a1a2e;
  }

  .list-item-sub {
    font-size: 0.8125rem;
    color: #4a4a6a;
    margin-top: 2px;
  }

  .list-item-meta {
    font-size: 0.75rem;
    color: #6b6b8a;
    margin-top: 2px;
  }

  .list-item-right {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  /* Quick Stats */
  .quick-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .quick-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 1rem;
    background: #f7f4ef;
    border-radius: 12px;
  }

  .qs-num {
    font-family: 'Playfair Display', serif;
    font-size: 1.75rem;
    font-weight: 900;
    color: #1a1a2e;
  }

  .qs-lbl {
    font-size: 0.75rem;
    color: #6b6b8a;
  }

  /* Badges & Pills */
  .tag-pill {
    font-size: 0.6875rem;
    font-weight: 500;
    background: rgba(26,26,46,0.06);
    color: #4a4a6a;
    padding: 3px 10px;
    border-radius: 100px;
  }

  .tag-pill--role {
    background: rgba(200,73,26,0.08);
    color: #c8491a;
  }

  .tag-pill--green {
    background: rgba(34,197,94,0.1);
    color: #15803d;
  }

  .tag-pill--orange {
    background: rgba(251,146,60,0.1);
    color: #c2410c;
  }

  .exp-type-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: #1a1a2e;
    color: #f7f4ef;
    padding: 3px 10px;
    border-radius: 100px;
  }

  .pub-type-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: rgba(26,26,46,0.08);
    color: #1a1a2e;
    padding: 3px 10px;
    border-radius: 100px;
  }

  .indexing-badge {
    font-size: 0.6875rem;
    font-weight: 700;
    background: rgba(59,130,246,0.1);
    color: #1d4ed8;
    padding: 3px 10px;
    border-radius: 100px;
  }

  .doi-link {
    font-size: 0.75rem;
    color: #c8491a;
    text-decoration: none;
    margin-top: 4px;
    display: inline-block;
  }

  .doi-link:hover { text-decoration: underline; }

  .empty-msg {
    font-size: 0.875rem;
    color: #6b6b8a;
    text-align: center;
    padding: 2rem;
  }

  .italic { font-style: italic; }

  @media (max-width: 768px) {
    .pub-hero-inner { flex-direction: column; }
    .pub-section-grid { grid-template-columns: 1fr; }
    .list-item--row { flex-direction: column; }
  }
`;