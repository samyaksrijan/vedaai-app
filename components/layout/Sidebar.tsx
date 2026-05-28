'use client';

import { useAppStore } from '@/lib/store';
import type { ActivePage } from '@/types';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wand2,
  Library,
  Plus,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface NavItemConfig {
  id: ActivePage;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: <LayoutDashboard size={18} /> },
  { id: 'my-groups', label: 'My Groups', icon: <Users size={18} /> },
  { id: 'assignments', label: 'Assignments', icon: <ClipboardList size={18} /> },
  { id: 'ai-toolkit', label: 'AI Toolkit', icon: <Wand2 size={18} /> },
  { id: 'my-library', label: 'My Library', icon: <Library size={18} /> },
];

export default function Sidebar() {
  const activePage = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);

  return (
    <aside
      className="fixed top-0 left-0 h-full w-[232px] flex flex-col z-30 bg-white shadow-veda-sidebar"
      style={{ borderRadius: '0 20px 20px 0' }}
    >
      {/* ── Logo ───────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        {/* Orange flame mark */}
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #E8540A 0%, #FF8C42 100%)' }}
        >
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
            <path
              d="M8 0C8 0 13 4.5 13 9.5C13 12.538 10.761 15 8 15C5.239 15 3 12.538 3 9.5C3 7.5 4 6 4 6C4 6 4.5 8 6 8.5C5.5 7 5.5 4 8 0Z"
              fill="white"
            />
            <path d="M8 11C8 11 9.5 10 9.5 8.5C9.5 10 11 11 11 12.5C11 14.433 9.657 16 8 16C6.343 16 5 14.433 5 12.5C5 11 6.5 10 6.5 8.5C6.5 10 8 11 8 11Z" fill="rgba(255,255,255,0.7)" />
          </svg>
        </div>
        <div>
          <span className="font-bold text-base tracking-tight" style={{ color: '#111111' }}>
            Veda<span style={{ color: '#E8540A' }}>AI</span>
          </span>
          <p className="text-[10px] font-medium" style={{ color: '#9CA3AF', marginTop: '-1px' }}>
            Assessment Creator
          </p>
        </div>
      </div>

      {/* ── Divider ────────────────────────────── */}
      <div className="mx-4 mb-4" style={{ height: '1px', background: '#F3F4F6' }} />

      {/* ── Nav ────────────────────────────────── */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <button
            key={id}
            id={`nav-${id}`}
            onClick={() => setActivePage(id)}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
          >
            <span
              className="flex-shrink-0"
              style={{ color: activePage === id ? '#E8540A' : '#9CA3AF' }}
            >
              {icon}
            </span>
            <span className="flex-1 text-left">{label}</span>
            {activePage === id && (
              <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
            )}
          </button>
        ))}

        {/* ── Divider ──────────────────────────── */}
        <div className="my-3 mx-1" style={{ height: '1px', background: '#F3F4F6' }} />

        {/* ── Create Assignment CTA ─────────────── */}
        <button
          id="btn-create-assignment-sidebar"
          className="btn-create-assignment"
          onClick={() => setActivePage('create-assignment')}
        >
          <Plus size={16} strokeWidth={2.5} />
          Create Assignment
        </button>
      </nav>

      {/* ── User Profile (floating bottom) ─────── */}
      <div className="px-3 pb-5 pt-3">
        <div
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150"
          style={{ background: '#F9FAFB' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#F9FAFB')}
          id="user-profile-sidebar"
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #E8540A 0%, #FF8C42 100%)' }}
          >
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-600 truncate" style={{ color: '#111111', fontWeight: 600 }}>
              Samyak Srijan
            </p>
            <p className="text-[10px] truncate" style={{ color: '#9CA3AF' }}>
              samyak@vedaai.com
            </p>
          </div>
          <button
            className="flex-shrink-0 p-1 rounded-lg transition-colors"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#E8540A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            title="Sign out"
            id="btn-sign-out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
