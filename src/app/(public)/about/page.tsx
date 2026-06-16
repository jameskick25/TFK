export const metadata = {
  title: 'À Propos | AM MODE',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <span className="hero-kicker" style={{ marginBottom: '16px' }}>Notre Histoire</span>
      <h1 className="section-title" style={{ marginBottom: '40px' }}>À propos de AM MODE</h1>
      
      <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
        <p>
          Fondée avec la volonté de proposer un vestiaire masculin simple et efficace en Algérie, la marque <strong>AM MODE</strong> s'inscrit dans une démarche de qualité et de transparence.
        </p>
        <p>
          Nous croyons que l'élégance se trouve dans la simplicité : des coupes étudiées, des matières naturelles comme le coton et le lin, et des couleurs qui s'accordent facilement au quotidien. Nous avons laissé de côté les logos imposants et les designs surchargés pour nous concentrer sur l'essentiel.
        </p>
        <p>
          Chacune de nos pièces est conçue pour être portée tous les jours, offrant un confort optimal et une excellente tenue dans le temps. Notre objectif est de vous accompagner dans votre quotidien avec des vêtements qui vous mettent en valeur, naturellement.
        </p>
        <p>
          Basés à Alger, nous expédions nos collections dans les 58 wilayas, en veillant toujours à vous offrir un service client réactif et de proximité.
        </p>
      </div>
    </div>
  );
}
