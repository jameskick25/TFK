'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LivraisonClient() {
  const { language } = useLanguage();

  const isAr = language === 'ar';

  const wilayas1_29 = [
    { code: '01', name: 'Adrar', desk: 750, home: 1100 },
    { code: '02', name: 'Chlef', desk: 400, home: 680 },
    { code: '03', name: 'Laghouat', desk: 500, home: 800 },
    { code: '04', name: 'Oum El Bouaghi', desk: 400, home: 680 },
    { code: '05', name: 'Batna', desk: 400, home: 700 },
    { code: '06', name: 'Béjaïa', desk: 400, home: 700 },
    { code: '07', name: 'Biskra', desk: 500, home: 800 },
    { code: '08', name: 'Béchar', desk: 700, home: 1000 },
    { code: '09', name: 'Blida', desk: 350, home: 500 },
    { code: '10', name: 'Bouira', desk: 400, home: 600 },
    { code: '11', name: 'Tamanrasset', desk: 1050, home: 1500 },
    { code: '12', name: 'Tébessa', desk: 450, home: 720 },
    { code: '13', name: 'Tlemcen', desk: 400, home: 700 },
    { code: '14', name: 'Tiaret', desk: 400, home: 700 },
    { code: '15', name: 'Tizi Ouzou', desk: 400, home: 600 },
    { code: '16', name: 'Alger', desk: 300, home: 500, highlight: true },
    { code: '17', name: 'Djelfa', desk: 500, home: 800 },
    { code: '18', name: 'Jijel', desk: 400, home: 700 },
    { code: '19', name: 'Sétif', desk: 400, home: 680 },
    { code: '20', name: 'Saïda', desk: 450, home: 730 },
    { code: '21', name: 'Skikda', desk: 400, home: 700 },
    { code: '22', name: 'Sidi Bel Abbès', desk: 400, home: 700 },
    { code: '23', name: 'Annaba', desk: 450, home: 700 },
    { code: '24', name: 'Guelma', desk: 400, home: 700 },
    { code: '25', name: 'Constantine', desk: 400, home: 680 },
    { code: '26', name: 'Médéa', desk: 400, home: 600 },
    { code: '27', name: 'Mostaganem', desk: 400, home: 700 },
    { code: '28', name: 'M\'Sila', desk: 400, home: 700 },
    { code: '29', name: 'Mascara', desk: 400, home: 700 },
  ];

  const wilayas30_58 = [
    { code: '30', name: 'Ouargla', desk: 550, home: 900 },
    { code: '31', name: 'Oran', desk: 400, home: 580 },
    { code: '32', name: 'El Bayadh', desk: 700, home: 970 },
    { code: '33', name: 'Illizi', desk: 1050, home: 1500 },
    { code: '34', name: 'Bordj Bou Arréridj', desk: 400, home: 680 },
    { code: '35', name: 'Boumerdès', desk: 350, home: 530 },
    { code: '36', name: 'El Tarf', desk: 450, home: 730 },
    { code: '37', name: 'Tindouf', desk: 750, home: 1100 },
    { code: '38', name: 'Tissemsilt', desk: 400, home: 700 },
    { code: '39', name: 'El Oued', desk: 550, home: 900 },
    { code: '40', name: 'Khenchela', desk: 400, home: 700 },
    { code: '41', name: 'Souk Ahras', desk: 450, home: 730 },
    { code: '42', name: 'Tipaza', desk: 350, home: 530 },
    { code: '43', name: 'Mila', desk: 400, home: 700 },
    { code: '44', name: 'Aïn Defla', desk: 400, home: 700 },
    { code: '45', name: 'Naâma', desk: 550, home: 930 },
    { code: '46', name: 'Aïn Témouchent', desk: 400, home: 700 },
    { code: '47', name: 'Ghardaïa', desk: 500, home: 850 },
    { code: '48', name: 'Relizane', desk: 400, home: 700 },
    { code: '49', name: 'Timimoun', desk: 750, home: 1100 },
    { code: '51', name: 'Ouled Djellal', desk: 500, home: 800 },
    { code: '52', name: 'Béni Abbès', desk: 750, home: 1000 },
    { code: '53', name: 'In Salah', desk: 950, home: 1400 },
    { code: '55', name: 'Touggourt', desk: 550, home: 930 },
    { code: '56', name: 'Djanet', desk: 1500, home: 2100 },
    { code: '57', name: 'El M\'Ghair', desk: 550, home: 930 },
    { code: '58', name: 'El Meniaa', desk: 500, home: 850 },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', direction: isAr ? 'rtl' : 'ltr' }}>
      
      {/* Return Policy Block */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '40px', marginBottom: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f1f1' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2.5rem', fontWeight: 800 }}>
          {isAr ? 'سياسة تغيير المنتجات' : 'Politique d\'échange'}
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '1.1rem' }}>
          {isAr ? 'نحرص دائماً على خدمتكم وتقديم أفضل تجربة شراء.' : 'Nous veillons toujours à vous servir et à offrir la meilleure expérience d\'achat.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>📏</div>
            <p style={{ margin: 0, fontSize: '1rem', color: '#374151', lineHeight: 1.6 }}>
              {isAr ? 'عند طلب المقاس (M مثلاً)، يتم إرسال المقاس الذي اخترتموه. لذلك نرجو التأكد من المقاس قبل تأكيد الطلب.' 
                   : 'Lors de la commande d\'une taille (M par exemple), la taille choisie est envoyée. Veuillez donc vérifier la taille avant de confirmer la commande.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>🚚</div>
            <p style={{ margin: 0, fontSize: '1rem', color: '#374151', lineHeight: 1.6 }}>
              {isAr ? 'في حال الرغبة في تغيير المنتج بسبب اختيار مقاس غير مناسب، يمكننا إجراء التغيير، وتكون مصاريف التوصيل الخاصة بالتغيير على الزبون.'
                   : 'Si vous souhaitez échanger le produit en raison d\'un mauvais choix de taille, nous pouvons le faire, mais les frais de livraison pour l\'échange seront à la charge du client.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>📦</div>
            <p style={{ margin: 0, fontSize: '1rem', color: '#374151', lineHeight: 1.6 }}>
              {isAr ? 'إذا لم يكن المقاس أو المنتج المطلوب متوفراً حالياً، نرجو منكم الانتظار إلى حين توفره. وفي حال عدم توفره نهائياً، سنقترح عليكم حلاً مناسباً.'
                   : 'Si la taille ou le produit souhaité n\'est pas disponible actuellement, veuillez patienter jusqu\'à son réassort. S\'il n\'est plus disponible définitivement, nous vous proposerons une solution appropriée.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>✓</div>
            <p style={{ margin: 0, fontSize: '1rem', color: '#374151', lineHeight: 1.6 }}>
              {isAr ? 'أما إذا كان الخطأ من طرفنا (مقاس أو منتج مختلف عن المطلوب)، فإننا نتحمل كامل مسؤولية التغيير، ويتم استبدال المنتج دون أي مصاريف إضافية على الزبون.'
                   : 'Cependant, si l\'erreur vient de notre part (taille ou produit différent de celui commandé), nous prenons l\'entière responsabilité de l\'échange, et le produit sera remplacé sans aucun frais supplémentaire pour le client.'}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Block */}
      <div style={{ backgroundColor: '#fcfcfc', borderRadius: '16px', padding: '40px', marginBottom: '40px', border: '1px solid #e5e7eb' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2.5rem', fontWeight: 800 }}>
          {isAr ? 'أسعار التوصيل' : 'Prix de livraison'}
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '1.1rem' }}>
          {isAr ? 'نوصل طلباتكم إلى جميع ولايات الجزائر' : 'Nous livrons vos commandes dans toutes les wilayas d\'Algérie'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <div style={{ fontSize: '3rem', flexShrink: 0 }}>🏠</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.3rem', fontWeight: 700 }}>
                {isAr ? 'التوصيل إلى المنزل' : 'Livraison à domicile'}
              </h3>
              <ul style={{ margin: 0, paddingLeft: isAr ? 0 : '20px', paddingRight: isAr ? '20px' : 0, color: '#4b5563', lineHeight: 1.8 }}>
                <li>{isAr ? 'الأسعار تختلف حسب الولاية' : 'Les prix varient selon la wilaya'}</li>
                <li>{isAr ? 'الجزائر العاصمة : 500 دج' : 'Alger : 500 DA'}</li>
                <li>{isAr ? 'باقي الولايات : حسب الجدول' : 'Autres wilayas : selon le tableau'}</li>
              </ul>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <div style={{ fontSize: '3rem', flexShrink: 0 }}>🏢</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.3rem', fontWeight: 700 }}>
                {isAr ? 'التوصيل إلى مكتب Noest Express' : 'Livraison au bureau Noest Express'}
              </h3>
              <ul style={{ margin: 0, paddingLeft: isAr ? 0 : '20px', paddingRight: isAr ? '20px' : 0, color: '#4b5563', lineHeight: 1.8 }}>
                <li>{isAr ? 'استلم طلبك من أقرب مكتب في ولايتك' : 'Récupérez votre commande au bureau le plus proche'}</li>
                <li>{isAr ? 'أسعار أقل من التوصيل المنزلي' : 'Prix inférieurs à la livraison à domicile'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tables */}
        <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>
          {isAr ? 'قائمة الأسعار' : 'Grille tarifaire'}
        </h3>
        
        <div style={{ overflowX: 'auto', marginBottom: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '16px', textAlign: isAr ? 'right' : 'left', fontWeight: 700, width: '40%' }}>{isAr ? 'الولاية' : 'Wilaya'}</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 700, width: '30%' }}>🏢 {isAr ? 'المكتب' : 'Bureau'}</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 700, width: '30%' }}>🏠 {isAr ? 'المنزل' : 'Domicile'}</th>
              </tr>
            </thead>
            <tbody>
              {wilayas1_29.map((w, i) => (
                <tr key={w.code} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: w.highlight ? '#fef3c7' : 'transparent' }}>
                  <td style={{ padding: '12px 16px', fontWeight: w.highlight ? 700 : 500 }}>{w.code} {w.name}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: w.highlight ? '#d97706' : '#374151' }}>{w.desk}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: w.highlight ? '#d97706' : '#374151' }}>{w.home}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '16px', textAlign: isAr ? 'right' : 'left', fontWeight: 700, width: '40%' }}>{isAr ? 'الولاية' : 'Wilaya'}</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 700, width: '30%' }}>🏢 {isAr ? 'المكتب' : 'Bureau'}</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 700, width: '30%' }}>🏠 {isAr ? 'المنزل' : 'Domicile'}</th>
              </tr>
            </thead>
            <tbody>
              {wilayas30_58.map((w, i) => (
                <tr key={w.code} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{w.code} {w.name}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#374151' }}>{w.desk}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#374151' }}>{w.home}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
