export default function ProductPageSkeleton() {
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px', minHeight: '80vh' }}>
      {/* Breadcrumb Skeleton */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
        <div className="skeleton-box" style={{ width: '70px', height: '14px' }} />
        <span style={{ color: '#d4d4d8' }}>&gt;</span>
        <div className="skeleton-box" style={{ width: '90px', height: '14px' }} />
        <span style={{ color: '#d4d4d8' }}>&gt;</span>
        <div className="skeleton-box" style={{ width: '140px', height: '14px' }} />
      </div>

      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px' }}>
        {/* Left: Gallery Skeleton */}
        <div>
          <div 
            className="skeleton-box" 
            style={{ 
              width: '100%', 
              height: '460px', 
              borderRadius: '8px', 
              marginBottom: '14px' 
            }} 
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="skeleton-box" style={{ width: '68px', height: '68px', borderRadius: '6px' }} />
            <div className="skeleton-box" style={{ width: '68px', height: '68px', borderRadius: '6px' }} />
            <div className="skeleton-box" style={{ width: '68px', height: '68px', borderRadius: '6px' }} />
          </div>
        </div>

        {/* Right: Info & Checkout Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div className="skeleton-box" style={{ width: '130px', height: '14px', marginBottom: '10px' }} />
            <div className="skeleton-box" style={{ width: '85%', height: '32px', marginBottom: '12px' }} />
            <div className="skeleton-box" style={{ width: '160px', height: '28px' }} />
          </div>

          {/* Description line skeletons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
            <div className="skeleton-box" style={{ width: '100%', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '92%', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '70%', height: '14px' }} />
          </div>

          {/* Options / Selectors skeleton */}
          <div style={{ borderTop: '1px solid #f4f4f5', borderBottom: '1px solid #f4f4f5', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="skeleton-box" style={{ width: '70px', height: '34px', borderRadius: '6px' }} />
              <div className="skeleton-box" style={{ width: '70px', height: '34px', borderRadius: '6px' }} />
              <div className="skeleton-box" style={{ width: '70px', height: '34px', borderRadius: '6px' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="skeleton-box" style={{ width: '50px', height: '36px', borderRadius: '6px' }} />
              <div className="skeleton-box" style={{ width: '50px', height: '36px', borderRadius: '6px' }} />
              <div className="skeleton-box" style={{ width: '50px', height: '36px', borderRadius: '6px' }} />
              <div className="skeleton-box" style={{ width: '50px', height: '36px', borderRadius: '6px' }} />
            </div>
          </div>

          {/* Checkout form skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton-box" style={{ width: '100%', height: '42px', borderRadius: '6px' }} />
            <div className="skeleton-box" style={{ width: '100%', height: '42px', borderRadius: '6px' }} />
            <div className="skeleton-box" style={{ width: '100%', height: '42px', borderRadius: '6px' }} />
            <div className="skeleton-box" style={{ width: '100%', height: '48px', borderRadius: '6px', marginTop: '6px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
