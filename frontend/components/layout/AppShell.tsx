'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header  from '@/components/layout/Header';
import { useAppStore } from '@/lib/store';
import AssignmentsPage from '@/components/assignments/AssignmentsPage';
import CreateAssignmentForm from '@/components/assignments/CreateAssignmentForm';
import ExamPaperView from '@/components/assignments/ExamPaperView';
import MobileAppShell from '@/components/layout/MobileAppShell';

// ── Placeholder page views (will be replaced in later phases) ────────────
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4 bg-white rounded-2xl p-8 border border-gray-150 shadow-sm">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-100"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#1E1E1E" opacity="0.15"/>
          <path d="M12 8v4m0 4h.01" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 className="text-lg font-semibold font-bricolage text-[#303030]">{title}</h2>
      <p className="text-sm text-gray-400 select-none">This section is coming soon.</p>
    </div>
  );
}

export default function AppShell() {
  const activePage = useAppStore((s) => s.activePage);
  const [isMobile, setIsMobile] = useState(false);

  // Viewport detector hook
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // trigger once initially
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <PlaceholderPage title="Home View" />;
      case 'my-groups':
        return <PlaceholderPage title="My Groups View" />;
      case 'assignments':
        return <AssignmentsPage />;
      case 'ai-toolkit':
        return <PlaceholderPage title="AI Toolkit View" />;
      case 'my-library':
        return <PlaceholderPage title="My Library View" />;
      case 'create-assignment':
        return <CreateAssignmentForm />;
      case 'assignment-output':
        return <ExamPaperView />;
      default:
        return <PlaceholderPage title="Dashboard" />;
    }
  };

  // ── Render Responsive Mobile shell ──
  if (isMobile) {
    return <MobileAppShell />;
  }

  // ── Render Desktop Floating Shell ──
  return (
    <div className="flex min-h-screen bg-[#EBEBEB] select-none">
      {/* Floating Sidebar (fixed size: 304px wide, calculated h, 12px margin) */}
      <Sidebar />

      {/* Main floating section offset by 327px leftwards */}
      <div className="flex flex-col flex-1" style={{ marginLeft: '327px' }}>
        {/* Floating top Header (Frame 1618872397) */}
        <Header />

        {/* Floating Canvas Main Content area (Frame 1984077326) */}
        <main
          className="flex-1 overflow-y-auto animate-fade-in pr-3"
          style={{
            marginTop: '90px', // exact top gap
            paddingBottom: '24px',
            minHeight: '678px',
          }}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
