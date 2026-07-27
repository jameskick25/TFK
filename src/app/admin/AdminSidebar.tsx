'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Tableau de Bord', icon: '📊' },
    { href: '/admin/orders', label: 'Commandes', icon: '📦' },
    { href: '/admin/products', label: 'Produits', icon: '👕' },
    { href: '/admin/categories', label: 'Catégories', icon: '📁' },
    { href: '/admin/stock', label: 'Gestion Stocks', icon: '🔢' },
    { href: '/admin/sales', label: 'Ventes', icon: '📈' },
    { href: '/admin/expenses', label: 'Dépenses', icon: '📉' },
    { href: '/admin/optimize-images', label: 'Optimisation Images', icon: '📸' },
  ];

  return (
    <aside className="admin-sidebar">
      <h2>TFK STORE ADMIN</h2>
      <nav className="admin-nav">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
        
      </nav>
    </aside>
  );
}
