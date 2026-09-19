export const metadata = { title: "Contact - TFK Store" };

export default function ContactPage() {
  return (
    <>
      <section
        style={{
          background: 'linear-gradient(180deg, var(--surface-muted) 0%, var(--bg) 100%)',
          padding: '80px 20px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <span className="hero-kicker">Service Clientèle</span>
          <h1 className="section-title">Contactez-nous</h1>
          <p className="section-subtitle">
            Une question ? Notre équipe est à votre entière disposition.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: '40px',
              marginTop: '20px',
            }}
          >
            {/* Contact Form */}
            <div
              style={{
                background: 'var(--surface, #fff)',
                padding: '40px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e5e7eb)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <h2 style={{ marginBottom: '24px', fontWeight: 500, fontSize: '1.3rem' }}>
                Envoyer un message
              </h2>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="form-group">
                  <label>Nom Complet</label>
                  <input type="text" name="name" required placeholder="Votre nom" />
                </div>
                <div className="form-group">
                  <label>Numéro de Téléphone</label>
                  <input type="tel" name="phone" required placeholder="05XXXXXXXX" />
                </div>
                <div className="form-group">
                  <label>Adresse Email (Optionnel)</label>
                  <input type="email" name="email" placeholder="votre@email.com" />
                </div>
                <div className="form-group">
                  <label>Votre Message</label>
                  <textarea
                    name="message"
                    required
                    placeholder="Comment pouvons-nous vous aider ?"
                    rows={5}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
                <button type="button" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Envoyer le message
                </button>
              </form>
            </div>

            {/* Contact Info Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Phone */}
              <div
                style={{
                  background: 'var(--surface, #fff)',
                  padding: '28px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #e5e7eb)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.25s ease',
                  cursor: 'default',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '4px', color: 'var(--accent)' }}>
                    Téléphone
                  </h3>
                  <p style={{ color: 'var(--text-muted, #6b7280)', margin: 0 }} dir="ltr">
                    +213 5 54140339
                  </p>
                </div>
              </div>

              {/* Instagram */}
              <div
                style={{
                  background: 'var(--surface, #fff)',
                  padding: '28px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #e5e7eb)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '4px', color: 'var(--accent)' }}>
                    Instagram
                  </h3>
                  <p style={{ margin: 0 }}>
                    <a
                      href="https://www.instagram.com/tfk_stor_e?igsh=eWhhOXF2b3FsbGdo"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-muted, #6b7280)', textDecoration: 'none' }}
                    >
                      @tfk_stor_e →
                    </a>
                  </p>
                </div>
              </div>

              {/* Facebook */}
              <div
                style={{
                  background: 'var(--surface, #fff)',
                  padding: '28px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #e5e7eb)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '4px', color: 'var(--accent)' }}>
                    Facebook
                  </h3>
                  <p style={{ margin: 0 }}>
                    <a
                      href="https://www.facebook.com/tfk_store"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-muted, #6b7280)', textDecoration: 'none' }}
                    >
                      Visitez notre page →
                    </a>
                  </p>
                </div>
              </div>

              {/* Horaires */}
              <div
                style={{
                  background: 'var(--surface, #fff)',
                  padding: '28px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #e5e7eb)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '4px', color: 'var(--accent)' }}>
                    Heures d'Ouverture
                  </h3>
                  <p style={{ color: 'var(--text-muted, #6b7280)', margin: 0 }}>
                    Samedi — Jeudi : 09:00 — 18:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive */}
      <style>{`
        @media (max-width: 992px) {
          .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
