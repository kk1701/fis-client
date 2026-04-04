import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      {/* ── Navbar ───────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="brand-dot" />
            <span className="brand-name">FIS</span>
          </div>
          <div className="nav-links">
            <Link to="/directory" className="nav-link">
              Faculty Directory
            </Link>
            <Link to="/reports" className="nav-link">
              Research Reports
            </Link>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-cta">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-grid-bg" />
        <div className="hero-inner">
          <div className="hero-eyebrow reveal">
            <span className="eyebrow-pill">Faculty Information System</span>
          </div>
          <h1 className="hero-title reveal">
            One platform.
            <br />
            Every faculty.
            <br />
            <span className="title-accent">Every insight.</span>
          </h1>
          <p className="hero-sub reveal">
            A unified system for managing faculty profiles, academic
            contributions, research output, and institutional analytics — built
            for modern universities.
          </p>
          <div className="hero-actions reveal">
            <Link to="/directory" className="btn-primary">
              Explore Faculty Directory
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/login" className="btn-ghost">
              Faculty Login
            </Link>
          </div>
        </div>

        {/* decorative stat cards */}
        <div className="hero-stats reveal">
          <div className="stat-card">
            <span className="stat-icon">🎓</span>
            <span className="stat-label">Academic Profiles</span>
            <span className="stat-desc">
              Complete faculty records with qualifications & experience
            </span>
          </div>
          <div className="stat-card stat-card--accent">
            <span className="stat-icon">📊</span>
            <span className="stat-label">Smart Analytics</span>
            <span className="stat-desc">
              Research domain mapping, publication trends & department insights
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🌐</span>
            <span className="stat-label">Public Reports</span>
            <span className="stat-desc">
              Institutional research reports published for transparency
            </span>
          </div>
          {/* <div className="stat-card">
            <span className="stat-icon">🔬</span>
            <span className="stat-label">Research Tracking</span>
            <span className="stat-desc">
              Journal, conference, books & supervision records
            </span>
          </div> */}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="features">
        <div className="features-inner">
          <div className="section-header reveal">
            <span className="section-tag">What FIS offers</span>
            <h2 className="section-title">Everything in one place</h2>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                className="feature-card reveal"
                key={i}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Strip ────────────────────────────────── */}
      <section className="cta-strip reveal">
        <div className="cta-inner">
          <div className="cta-text">
            <h2 className="cta-title">Ready to get started?</h2>
            <p className="cta-sub">
              Join your institution's faculty network today.
            </p>
          </div>
          <div className="cta-actions">
            <Link to="/register" className="btn-primary btn-large">
              Create Faculty Account
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/directory" className="btn-ghost-light">
              Browse Directory
            </Link>
            <Link to="/reports" className="btn-ghost-light">
              View Reports
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-dot" />
            <span className="brand-name">FIS</span>
            <span className="footer-tagline">Faculty Information System</span>
          </div>
          <div className="footer-links">
            <Link to="/directory">Directory</Link>
            <Link to="/reports">Reports</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </footer>

      {/* ── Styles ───────────────────────────────────── */}
      <style>{STYLES}</style>
    </div>
  );
}

const FEATURES = [
  {
    icon: "👤",
    title: "Complete Profiles",
    desc: "Personal info, academic qualifications, designations and specializations in one view.",
  },
  {
    icon: "📚",
    title: "Publication Records",
    desc: "Journal articles, conference papers, books and book chapters with DOI and indexing.",
  },
  {
    icon: "🏛️",
    title: "Department Management",
    desc: "Organize faculty by departments with course catalog and assignment tracking.",
  },
  {
    icon: "🧑‍🏫",
    title: "Teaching History",
    desc: "Course-wise teaching records with semester, academic year, role and hours.",
  },
  {
    icon: "🔍",
    title: "Public Directory",
    desc: "Open faculty directory with search, department and research domain filters.",
  },
  {
    icon: "📈",
    title: "Institutional Analytics",
    desc: "Research momentum, publication trends, dept health scores and more — exportable as PDF.",
  },
  {
    icon: "🌐",
    title: "Public Research Reports",
    desc: "Admin-curated institutional reports published for the public — research domains, qualification stats and more.",
  },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .landing {
    font-family: 'DM Sans', sans-serif;
    background: #f7f4ef;
    color: #1a1a2e;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Navbar ── */
  .landing-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(247, 244, 239, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(26, 26, 46, 0.08);
  }

  .nav-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 2rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .brand-dot {
    width: 10px;
    height: 10px;
    background: #c8491a;
    border-radius: 50%;
    display: inline-block;
  }

  .brand-name {
    font-family: 'Playfair Display', serif;
    font-weight: 900;
    font-size: 1.4rem;
    color: #1a1a2e;
    letter-spacing: -0.02em;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a4a6a;
    text-decoration: none;
    transition: color 0.2s;
  }

  .nav-link:hover { color: #1a1a2e; }

  .nav-cta {
    font-size: 0.875rem;
    font-weight: 600;
    color: #f7f4ef;
    background: #1a1a2e;
    padding: 8px 20px;
    border-radius: 100px;
    text-decoration: none;
    transition: background 0.2s, transform 0.15s;
  }

  .nav-cta:hover {
    background: #c8491a;
    transform: translateY(-1px);
  }

  /* ── Hero ── */
  .hero {
    min-height: 100vh;
    padding: 120px 2rem 80px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .hero-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(26, 26, 46, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26, 26, 46, 0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 40%, black 40%, transparent 100%);
  }

  .hero-inner {
    max-width: 820px;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .hero-eyebrow {
    margin-bottom: 1.5rem;
  }

  .eyebrow-pill {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #c8491a;
    background: rgba(200, 73, 26, 0.08);
    border: 1px solid rgba(200, 73, 26, 0.2);
    padding: 6px 16px;
    border-radius: 100px;
  }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(3rem, 7vw, 5.5rem);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: #1a1a2e;
    margin-bottom: 1.5rem;
  }

  .title-accent {
    color: #c8491a;
    font-style: italic;
  }

  .hero-sub {
    font-size: 1.125rem;
    font-weight: 400;
    color: #4a4a6a;
    line-height: 1.7;
    max-width: 580px;
    margin: 0 auto 2.5rem;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #1a1a2e;
    color: #f7f4ef;
    font-size: 0.9375rem;
    font-weight: 600;
    padding: 14px 28px;
    border-radius: 100px;
    text-decoration: none;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(26, 26, 46, 0.18);
  }

  .btn-primary:hover {
    background: #c8491a;
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(200, 73, 26, 0.28);
  }

  .btn-arrow {
    transition: transform 0.2s;
  }

  .btn-primary:hover .btn-arrow {
    transform: translateX(4px);
  }

  .btn-large {
    font-size: 1rem;
    padding: 16px 36px;
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: #1a1a2e;
    font-size: 0.9375rem;
    font-weight: 500;
    padding: 14px 28px;
    border-radius: 100px;
    text-decoration: none;
    border: 1.5px solid rgba(26, 26, 46, 0.2);
    transition: border-color 0.2s, background 0.2s;
  }

  .btn-ghost:hover {
    border-color: #1a1a2e;
    background: rgba(26, 26, 46, 0.04);
  }

  .btn-ghost-light {
    display: inline-flex;
    align-items: center;
    background: transparent;
    color: #f7f4ef;
    font-size: 0.9375rem;
    font-weight: 500;
    padding: 14px 28px;
    border-radius: 100px;
    text-decoration: none;
    border: 1.5px solid rgba(247, 244, 239, 0.3);
    transition: border-color 0.2s, background 0.2s;
  }

  .btn-ghost-light:hover {
    border-color: rgba(247, 244, 239, 0.7);
    background: rgba(247, 244, 239, 0.08);
  }

  /* ── Hero Stats ── */
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    max-width: 900px;
    width: 100%;
    margin-top: 5rem;
    position: relative;
    z-index: 1;
  }

  .stat-card {
    background: white;
    border: 1px solid rgba(26, 26, 46, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 2px 16px rgba(26, 26, 46, 0.06);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(26, 26, 46, 0.12);
  }

  .stat-card--accent {
    background: #1a1a2e;
    border-color: transparent;
  }

  .stat-card--accent .stat-label {
    color: #f7f4ef;
  }

  .stat-card--accent .stat-desc {
    color: rgba(247, 244, 239, 0.6);
  }

  .stat-icon { font-size: 1.75rem; }

  .stat-label {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 700;
    color: #1a1a2e;
  }

  .stat-desc {
    font-size: 0.8125rem;
    color: #6b6b8a;
    line-height: 1.5;
  }

  /* ── Features ── */
  .features {
    padding: 100px 2rem;
    background: white;
  }

  .features-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  .section-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .section-tag {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #c8491a;
    margin-bottom: 1rem;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.02em;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .feature-card {
    padding: 2rem;
    border: 1px solid rgba(26, 26, 46, 0.08);
    border-radius: 16px;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(26, 26, 46, 0.1);
    border-color: rgba(200, 73, 26, 0.2);
  }

  .feature-icon { font-size: 2rem; margin-bottom: 1rem; }

  .feature-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.125rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 0.5rem;
  }

  .feature-desc {
    font-size: 0.875rem;
    color: #6b6b8a;
    line-height: 1.6;
  }

  /* ── CTA Strip ── */
  .cta-strip {
    background: #1a1a2e;
    padding: 80px 2rem;
  }

  .cta-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .cta-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    font-weight: 700;
    color: #f7f4ef;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .cta-sub {
    font-size: 1rem;
    color: rgba(247, 244, 239, 0.6);
  }

  .cta-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  /* ── Footer ── */
  .landing-footer {
    background: #f7f4ef;
    border-top: 1px solid rgba(26, 26, 46, 0.08);
    padding: 2rem;
  }

  .footer-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .footer-tagline {
    font-size: 0.8125rem;
    color: #6b6b8a;
    margin-left: 4px;
  }

  .footer-links {
    display: flex;
    gap: 1.5rem;
  }

  .footer-links a {
    font-size: 0.875rem;
    color: #6b6b8a;
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-links a:hover { color: #1a1a2e; }

  /* ── Reveal Animations ── */
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .reveal.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .hero-stats {
      grid-template-columns: 1fr;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .cta-inner {
      flex-direction: column;
      text-align: center;
    }

    .cta-actions {
      justify-content: center;
    }

    .nav-links .nav-link {
      display: none;
    }
  }
`;
