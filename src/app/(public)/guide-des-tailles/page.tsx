export const metadata = {
  title: 'Guide des Tailles | TFK Store',
};

export default function GuideDesTailles() {
  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
      <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Guide des Tailles</h1>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px', textAlign: 'center', fontSize: '1.1rem' }}>
        Pour vous aider à choisir la bonne taille, voici un tableau récapitulatif de nos mensurations standards. Nos coupes sont conçues pour être confortables et légèrement amples (coupe moderne).
      </p>

      <div style={{ backgroundColor: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', padding: '32px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', borderBottom: '2px solid var(--border)', paddingBottom: '12px' }}>
          T-shirts & Polos (Hauts)
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Taille</th>
                <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Poitrine (cm)</th>
                <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Longueur (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>S</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>92 - 96</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>68</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>M</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>96 - 100</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>70</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>L</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>100 - 104</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>72</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>XL</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>104 - 108</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>74</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', borderBottom: '2px solid var(--border)', paddingBottom: '12px' }}>
          Pantalons en Lin (Bas)
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Taille</th>
                <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Taille Pantalon</th>
                <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Tour de taille (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>S</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>38</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>76 - 80</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>M</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>40</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>80 - 84</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>L</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>42</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>84 - 88</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>XL</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>44</td>
                <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>88 - 92</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
