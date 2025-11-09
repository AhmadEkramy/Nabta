import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <div className="flex pt-16 pb-16">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 z-40">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)] overflow-y-auto pt-4 pb-20">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Fixed Bottom Navigation (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
        <Sidebar />
      </div>
    </div>
  );
};

export default Layout;