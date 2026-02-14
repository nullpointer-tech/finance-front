import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="lg:pl-64 pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
};