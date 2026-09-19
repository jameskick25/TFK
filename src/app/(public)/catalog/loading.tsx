export default function CatalogLoading() {
  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px', minHeight: '80vh' }}>
      {/* Hero / Filter bar skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="skeleton-box" style={{ width: '220px', height: '36px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="skeleton-box" style={{ width: '80px', height: '36px', borderRadius: '20px' }} />
          <div className="skeleton-box" style={{ width: '90px', height: '36px', borderRadius: '20px' }} />
          <div className="skeleton-box" style={{ width: '80px', height: '36px', borderRadius: '20px' }} />
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f4f4f5' }}>
            <div className="skeleton-box" style={{ width: '100%', height: '280px' }} />
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="skeleton-box" style={{ width: '75%', height: '18px' }} />
              <div className="skeleton-box" style={{ width: '40%', height: '16px' }} />
              <div className="skeleton-box" style={{ width: '100%', height: '36px', marginTop: '8px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
