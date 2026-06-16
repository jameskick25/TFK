import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
