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
  ChevronRight,
  Settings,
} from 'lucide-react';

interface NavItemConfig {
  id: ActivePage;
  label: string;
  icon: React.ReactNode;
  hasBadge?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home',          label: 'Home',         icon: <LayoutDashboard size={18} /> },
  { id: 'my-groups',     label: 'My Groups',    icon: <Users size={18} /> },
  { id: 'assignments',   label: 'Assignments',  icon: <ClipboardList size={18} />, hasBadge: true },
  { id: 'ai-toolkit',    label: 'AI Toolkit',   icon: <Wand2 size={18} /> },
  { id: 'my-library',    label: 'My Library',   icon: <Library size={18} /> },
];

export default function Sidebar() {
  const activePage    = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const assignments   = useAppStore((s) => s.assignments);

  // Dynamic assignment badge calculation (matches Figma numbers)
  const assignmentCount = assignments.length > 0 ? assignments.length : 32;

  return (
    <aside
      className="fixed z-30 bg-white flex flex-col justify-between"
      style={{
        top: '12px',
        left: '12px',
        width: '304px',
        height: 'calc(100vh - 24px)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0px 32px 48px 0px rgba(0,0,0,0.2), 0px 16px 48px 0px rgba(0,0,0,0.12)',
      }}
    >
      {/* ── Top Half Block (Logo & Create Assignment & Navigation) ── */}
      <div className="flex flex-col gap-6" style={{ height: '418px' }}>
        {/* ── Logo (Frame width: 251) ── */}
        <div className="flex items-center gap-2.5 px-1 select-none" style={{ width: '251px', height: '40px' }}>
          {/* Modern dark square logo with white ribbon gradient fold V */}
          <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 bg-[#1E1E1E]">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 7.5H13.5L17.5 19.5L21.5 7.5H29L20.5 25.5H14.5L6 7.5Z" fill="url(#sidebar-v-logo-grad)" />
              <path d="M14.5 25.5L17.5 19.5L21.5 7.5H29L20.5 25.5H14.5Z" fill="url(#sidebar-v-logo-fold)" opacity="0.18" />
              <defs>
                <linearGradient id="sidebar-v-logo-grad" x1="6" y1="7.5" x2="29" y2="25.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="1" stopColor="#E5E7EB" />
                </linearGradient>
                <linearGradient id="sidebar-v-logo-fold" x1="14.5" y1="7.5" x2="29" y2="25.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#000000" />
                  <stop offset="1" stopColor="#000000" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-[#1E1E1E] font-bricolage">
            VedaAI
          </span>
        </div>

        {/* ── Create Assignment CTA (width: 251, height: 42) ── */}
        <div style={{ width: '251px', height: '42px' }}>
          <button
            id="btn-create-assignment-sidebar"
            className="btn-create-assignment w-full h-full flex items-center justify-between px-4 py-2 text-xs font-bold rounded-full select-none"
            onClick={() => setActivePage('create-assignment')}
          >
            <span className="flex items-center gap-2">
              <Plus size={16} strokeWidth={2.5} />
              Create Assignment
            </span>
            <ChevronRight size={14} className="opacity-75" />
          </button>
        </div>

        {/* ── Nav Options (width: 251px, gap: 56px inside sidebar) ── */}
        <nav className="flex flex-col gap-1 px-0 overflow-y-auto" style={{ width: '251px' }}>
          {NAV_ITEMS.map(({ id, label, icon, hasBadge }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                id={`nav-${id}`}
                onClick={() => setActivePage(id)}
                className="flex items-center select-none"
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '8px',
                  gap: '8px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  background: isActive ? '#F0F0F0' : 'transparent',
                  color: isActive ? '#111111' : '#5E5E5ECC',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  className="flex-shrink-0"
                  style={{ color: isActive ? '#1E1E1E' : '#9CA3AF' }}
                >
                  {icon}
                </span>
                <span className="flex-1 text-left">{label}</span>
                {hasBadge && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-[#1E1E1E] scale-90 select-none">
                    {assignmentCount}
                  </span>
                )}
                {isActive && !hasBadge && (
                  <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom Half Block (Settings & School Context - space width: 256, height: 126) ── */}
      <div className="flex flex-col gap-3" style={{ width: '256px', height: '126px' }}>
        {/* Settings button (width: 204, height: 22) */}
        <button
          id="nav-settings"
          onClick={() => setActivePage('home')}
          className="flex items-center select-none px-3"
          style={{
            width: '204px',
            height: '22px',
            gap: '8px',
            fontFamily: 'var(--font-bricolage)',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '140%',
            letterSpacing: '-0.04em',
            color: '#5E5E5ECC',
            textAlign: 'left',
          }}
        >
          <Settings size={16} className="text-[#9CA3AF]" />
          <span>Settings</span>
        </button>

        {/* School option context card (width: 256, height: 80) */}
        <div
          className="flex items-center border border-gray-100 shadow-sm select-none"
          style={{
            width: '256px',
            height: '80px',
            borderRadius: '16px',
            padding: '12px',
            gap: '16px',
            background: '#F9FAFB',
          }}
          id="user-profile-sidebar"
        >
          {/* Green circular School Crest */}
          <div className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0 overflow-hidden select-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="white" stroke="#16A34A" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="8" fill="#E2EBE2" />
              {/* Tree emblem */}
              <path
                d="M12 6v10M9 10c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5-1.5 2.5-3 2.5-3-1-3-2.5zM10 16h4"
                stroke="#16A34A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold truncate leading-tight" style={{ color: '#111111' }}>
              Delhi Public School
            </p>
            <p className="text-[9px] font-medium truncate mt-0.5" style={{ color: '#9CA3AF' }}>
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
