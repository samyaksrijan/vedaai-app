'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { ActivePage } from '@/types';
import {
  LayoutDashboard,
  ClipboardList,
  Library,
  Wand2,
  Plus,
  Bell,
  Menu,
  Search,
  Eye,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import CreateAssignmentForm from '@/components/assignments/CreateAssignmentForm';
import ExamPaperView from '@/components/assignments/ExamPaperView';

export default function MobileAppShell() {
  const activePage    = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const assignments   = useAppStore((s) => s.assignments);

  const renderMobileContent = () => {
    switch (activePage) {
      case 'assignments':
        if (assignments.length > 0) {
          return <MobileAssignmentsView />;
        }
        return <MobileEmptyState />;
      case 'create-assignment':
        return <CreateAssignmentForm />;
      case 'assignment-output':
        return <ExamPaperView />;
      default:
        // Default to mobile empty state for demo sections
        return <MobileEmptyState />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EBEBEB] text-[#303030] font-sans pb-24 select-none">
      {/* ── Mobile Top Safe Area & Domain Mockup ── */}
      <div className="w-full bg-[#EBEBEB] text-center py-2 text-[10px] text-gray-500 font-semibold select-none border-b border-gray-200">
        9:41 📱 web-to-figma.design
      </div>

      {/* ── Status Bar / Mobile Header (Frame 105) ── */}
      <header
        className="w-full flex items-center justify-between px-5 py-[18px] bg-white border-b border-gray-200/50"
        style={{ height: '81px' }}
      >
        <div className="flex items-center gap-2 select-none">
          {/* Logo */}
          <div className="w-7 h-7 rounded-lg bg-[#1E1E1E] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 7.5H13.5L17.5 19.5L21.5 7.5H29L20.5 25.5H14.5L6 7.5Z" fill="url(#mobile-v-logo-grad)" />
              <path d="M14.5 25.5L17.5 19.5L21.5 7.5H29L20.5 25.5H14.5Z" fill="url(#mobile-v-logo-fold)" opacity="0.18" />
              <defs>
                <linearGradient id="mobile-v-logo-grad" x1="6" y1="7.5" x2="29" y2="25.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="1" stopColor="#E5E7EB" />
                </linearGradient>
                <linearGradient id="mobile-v-logo-fold" x1="14.5" y1="7.5" x2="29" y2="25.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#000000" />
                  <stop offset="1" stopColor="#000000" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight text-[#1E1E1E] font-bricolage">
            VedaAI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 bg-white/70 border border-gray-200 rounded-xl">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E1E1E] to-[#4B5563] text-white flex items-center justify-center text-xs font-bold border border-white font-bricolage">
            JD
          </div>
          <button className="p-2 bg-white/70 border border-gray-200 rounded-xl md:hidden">
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* ── Mobile Scrollable Canvas Area ── */}
      <main className="flex-1 p-4 overflow-y-auto max-w-md mx-auto w-full">
        {renderMobileContent()}
      </main>

      {/* ── Mobile Floating Bottom Menu (Frame 373) ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] max-w-sm z-50">
        <nav
          className="w-full flex items-center justify-between px-6 py-2 bg-[#181818] border border-white/10 shadow-[0px_32px_48px_0px_rgba(0,0,0,0.2),0px_16px_48px_0px_rgba(0,0,0,0.12)]"
          style={{ height: '72px', borderRadius: '24px' }}
        >
          <MobileTabButton
            active={activePage === 'home'}
            onClick={() => setActivePage('home')}
            icon={<LayoutDashboard size={20} />}
            label="Home"
          />
          <MobileTabButton
            active={activePage === 'assignments' || activePage === 'create-assignment' || activePage === 'assignment-output'}
            onClick={() => setActivePage('assignments')}
            icon={<ClipboardList size={20} />}
            label="Assignments"
          />
          <MobileTabButton
            active={activePage === 'my-library'}
            onClick={() => setActivePage('my-library')}
            icon={<Library size={20} />}
            label="Library"
          />
          <MobileTabButton
            active={activePage === 'ai-toolkit'}
            onClick={() => setActivePage('ai-toolkit')}
            icon={<Wand2 size={20} />}
            label="AI Toolkit"
          />
        </nav>
      </div>
    </div>
  );
}

// ── Mobile Bottom Navigation Tab Component ──────────────────────────────────
interface MobileTabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function MobileTabButton({ active, onClick, icon, label }: MobileTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 select-none ${
        active ? 'text-white' : 'text-[#888888] hover:text-white'
      }`}
    >
      <div
        className="w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200"
        style={{
          background: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        }}
      >
        {icon}
      </div>
      <span className="text-[9px] font-bold tracking-tight uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
        {label}
      </span>
    </button>
  );
}

// ── Mobile Empty State (No Assignments Yet Section) ───────────────────────
function MobileEmptyState() {
  const setActivePage = useAppStore((s) => s.setActivePage);

  return (
    <div
      className="w-full bg-white border border-gray-200 rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-4 mt-8 shadow-sm"
      style={{ minHeight: '338px' }}
    >
      {/* Search illustration mockup */}
      <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center select-none text-veda-orange">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h2
          className="font-bricolage text-[20px] font-extrabold text-[#303030] tracking-tight leading-[140%] uppercase"
        >
          No assignments yet
        </h2>
        <p
          className="font-bricolage text-sm text-[#5E5E5ECC] font-normal leading-[140%] tracking-tight"
        >
          Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
        </p>
      </div>

      <button
        onClick={() => setActivePage('create-assignment')}
        className="btn-create-assignment mt-3 select-none flex items-center justify-center gap-1.5 transition-all duration-300"
        style={{
          width: '277px',
          height: '46px',
          borderRadius: '48px',
          background: '#181818',
          border: '1.5px solid transparent',
          backgroundImage: 'linear-gradient(#181818, #181818), linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(102, 102, 102, 0) 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        <Plus size={16} strokeWidth={2.5} />
        Create Your First Assignment
      </button>
    </div>
  );
}

// ── Mobile Assignments Grid List View Component ─────────────────────────────
function MobileAssignmentsView() {
  const assignments       = useAppStore((s) => s.assignments);
  const deleteAssignment  = useAppStore((s) => s.deleteAssignment);
  const setActivePage     = useAppStore((s) => s.setActivePage);
  const searchQuery       = useAppStore((s) => s.searchQuery);
  const setSearchQuery    = useAppStore((s) => s.setSearchQuery);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAssignment(id);
    setActiveMenuId(null);
  };

  return (
    <div className="w-full flex flex-col gap-4 max-w-sm mx-auto select-none relative pb-20">
      {/* ── Title on Top ── */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-extrabold font-bricolage text-[#303030]">
          Assignments
        </h1>
      </div>

      {/* ── Search Bar Container Card (width: 373, height: 64) ── */}
      <div
        className="w-full bg-white flex items-center justify-between px-4 shadow-sm"
        style={{ height: '64px', borderRadius: '16px' }}
      >
        {/* Search input box */}
        <div
          className="flex items-center gap-2.5 border border-[#00000033] px-4"
          style={{ width: '228px', height: '44px', borderRadius: '100px' }}
        >
          <Search size={14} className="text-[#9CA3AF]" />
          <input
            id="mobile-search-name"
            type="text"
            placeholder="Search Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-xs w-full text-gray-800 font-medium font-bricolage"
          />
        </div>

        {/* Filter label */}
        <div className="flex items-center gap-4 text-xs font-bold text-[#5E5E5ECC]" style={{ width: '55px', height: '20px' }}>
          <span>Filter</span>
        </div>
      </div>

      {/* ── Assignments List Rows (width: 373, height: 116) ── */}
      <div className="flex flex-col gap-3.5">
        {filtered.map((a) => (
          <div
            key={a.id}
            onClick={() => {
              if (a.status === 'completed' || a.status === 'active') {
                setActivePage('assignment-output');
              }
            }}
            className="w-full relative shadow-sm border border-white/40 flex flex-col justify-between"
            style={{
              height: '116px',
              borderRadius: '24px',
              padding: '20px',
              background: '#FFFFFFBF',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Header section (Title & 3-Dot Actions) */}
            <div className="flex items-start justify-between w-full">
              <h3 className="text-sm font-bold font-bricolage text-[#303030] truncate max-w-[240px]">
                {a.title}
              </h3>

              {/* 3-Dot Actions */}
              <div className="relative">
                <button
                  className="p-1 rounded-lg hover:bg-gray-150 transition-colors"
                  style={{ color: '#9CA3AF' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === a.id ? null : a.id);
                  }}
                >
                  <MoreVertical size={16} />
                </button>

                {activeMenuId === a.id && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(null);
                      }}
                    />
                    <div
                      className="absolute right-0 mt-1 w-32 rounded-xl shadow-veda-popup bg-white border border-gray-100 z-50 py-1 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors text-left"
                        onClick={() => {
                          setActivePage('assignment-output');
                          setActiveMenuId(null);
                        }}
                      >
                        <Eye size={12} />
                        View
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-650 hover:bg-red-50 transition-colors text-left"
                        onClick={(e) => handleDelete(a.id, e)}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Date Details using Bricolage Grotesque fonts and custom weights */}
            <div className="flex flex-col gap-1 text-xs text-[#5E5E5ECC] font-bricolage tracking-[-0.04em]">
              <div style={{ height: '19px', lineHeight: '120%' }}>
                <span className="font-extrabold text-[#303030]">Assigned on : </span>
                <span className="font-normal">{a.assignedOn || '20-06-2025'}</span>
              </div>
              <div style={{ height: '19px', lineHeight: '120%' }}>
                <span className="font-extrabold text-[#303030]">Due : </span>
                <span className="font-normal">{a.dueDate || '21-06-2025'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Symbol in the right bottom for Assignments (Floating circular FAB) ── */}
      <div className="fixed bottom-24 right-4 z-40">
        <button
          onClick={() => setActivePage('create-assignment')}
          className="flex items-center justify-center transition-all duration-300 shadow-[0px_32px_48px_0px_rgba(0,0,0,0.2),0px_16px_48px_0px_rgba(0,0,0,0.12)] hover:scale-105 select-none"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '100px',
            background: '#FFFFFF',
          }}
        >
          <Plus size={20} className="text-[#303030]" />
        </button>
      </div>
    </div>
  );
}
