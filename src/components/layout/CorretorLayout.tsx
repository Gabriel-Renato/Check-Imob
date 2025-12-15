import { Outlet } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { CorretorSidebar } from './CorretorSidebar';

export function CorretorLayout() {
  return (
    <div className="min-h-screen bg-background">
      <CorretorSidebar />
      <main className="lg:ml-64 min-h-screen transition-all duration-300 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
