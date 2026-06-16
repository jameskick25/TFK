export const metadata = { title: "Contact - AM MODE" };

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
                <div style={{ fontSize: '2.2rem' }}>📱</div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '4px', color: 'var(--accent)' }}>
                    Téléphone
                  </h3>
                  <p style={{ color: 'var(--text-muted, #6b7280)', margin: 0 }} dir="ltr">
                    07 91 99 50 55
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
                <div style={{ fontSize: '2.2rem' }}>📸</div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '4px', color: 'var(--accent)' }}>
                    Instagram
                  </h3>
                  <p style={{ margin: 0 }}>
                    <a
                      href="https://www.instagram.com/am_mode_16?igsh=MWI2bGVwNnZ5azV5eA%3D%3D&utm_source=qr"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-muted, #6b7280)', textDecoration: 'none' }}
                    >
                      @am_mode_16 →
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
                <div style={{ fontSize: '2.2rem' }}>📘</div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '4px', color: 'var(--accent)' }}>
                    Facebook
                  </h3>
                  <p style={{ margin: 0 }}>
                    <a
                      href="https://www.facebook.com/share/1CotJm4fa4/?mibextid=wwXIfr"
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
                <div style={{ fontSize: '2.2rem' }}>🕐</div>
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
