import Link from 'next/link';

export const metadata = {
  title: 'TFK Store — Choisissez votre univers',
  description: 'Entrez dans la boutique TFK Store et choisissez entre notre collection de Vêtements modernes et nos Accessoires Téléphone premium.',
};

export default function Home() {
  return (
    <div className="split-container">
      {/* Clothes Track */}
      <Link href="/clothes" className="split-pane clothes">
        <div className="split-pane-overlay"></div>
        <div className="split-pane-content">
          <span className="hero-kicker" style={{ color: 'var(--accent)' }}>Univers Mode</span>
          <h2 className="split-pane-title">Collection Vêtements</h2>
          <p className="split-pane-desc">
            Des designs modernes, des matières sélectionnées et un style soigné pour toutes vos occasions.
          </p>
          <span className="btn btn-primary btn-lg" style={{ pointerEvents: 'none' }}>
            Découvrir l'univers 👕
          </span>
        </div>
      </Link>

      <div className="split-divider"></div>

      {/* Accessories Track */}
      <Link href="/accessories" className="split-pane accessories">
        <div className="split-pane-overlay"></div>
        <div className="split-pane-content">
          <span className="hero-kicker" style={{ color: 'var(--accent)' }}>Univers Tech</span>
          <h2 className="split-pane-title">Accessoires Téléphone</h2>
          <p className="split-pane-desc">
            Protégez et optimisez vos smartphones avec nos coques élégantes, chargeurs rapides et gadgets audio.
          </p>
          <span className="btn btn-primary btn-lg" style={{ pointerEvents: 'none' }}>
            Découvrir l'univers 📱
          </span>
        </div>
      </Link>
    </div>
  );
}
