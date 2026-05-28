'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import type { ActivePage } from '@/types';
import { Bell, ChevronDown, Search, Settings, LogOut, User, HelpCircle } from 'lucide-react';

// ── Breadcrumb config ──────────────────────────────────────────────────────
const PAGE_LABELS: Record<ActivePage, string> = {
  home:                'Home',
  'my-groups':         'My Groups',
  assignments:         'Assignments',
  'ai-toolkit':        'AI Toolkit',
  'my-library':        'My Library',
  'create-assignment': 'Create Assignment',
  'assignment-output': 'Assignment Output',
};

// ── Notification mock data ─────────────────────────────────────────────────
const NOTIFICATIONS = [
  { id: '1', text: 'Assignment "Quiz on Electricity" is due tomorrow.', time: '2m ago', unread: true },
  { id: '2', text: 'New student joined My Group – Science 8B.',          time: '1h ago', unread: true },
  { id: '3', text: 'Assignment generated successfully.',                  time: '3h ago', unread: false },
];

// ── Dropdown menu items ────────────────────────────────────────────────────
interface DropdownMenuItem {
  icon: React.ReactNode;
  label: string;
  id: string;
  danger?: boolean;
}

const USER_MENU: DropdownMenuItem[] = [
  { id: 'menu-profile',  icon: <User size={14} />,      label: 'My Profile'   },
  { id: 'menu-settings', icon: <Settings size={14} />,  label: 'Settings'     },
  { id: 'menu-help',     icon: <HelpCircle size={14} />,label: 'Help & Support'},
  { id: 'menu-logout',   icon: <LogOut size={14} />,    label: 'Sign Out', danger: true },
];

export default function Header() {
  const activePage        = useAppStore((s) => s.activePage);
  const searchQuery       = useAppStore((s) => s.searchQuery);
  const setSearchQuery    = useAppStore((s) => s.setSearchQuery);

  const [notifOpen, setNotifOpen]   = useState(false);
  const [userOpen,  setUserOpen]    = useState(false);

  const notifRef  = useRef<HTMLDivElement>(null);
  const userRef   = useRef<HTMLDivElement>(null);

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pageLabel = PAGE_LABELS[activePage] ?? 'Dashboard';

  return (
    <header
      className="fixed z-20 flex items-center gap-4 border border-[#E5E7EB]/50"
      style={{
        top: '12px',
        left: '327px',
        right: '12px',
        height: '56px',
        borderRadius: '16px',
        background: '#FFFFFFBF',
        backdropFilter: 'blur(12px)',
        paddingLeft: '24px',
        paddingRight: '12px',
        boxShadow: '0px 2px 12px rgba(0,0,0,0.03)'
      }}
    >
      {/* ── Breadcrumb / Title ──────────────────── */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
          VedaAI
        </span>
        <span style={{ color: '#D1D5DB', fontSize: '10px' }}>›</span>
        <span className="text-xs font-semibold" style={{ color: '#374151' }}>
          {pageLabel}
        </span>

        <div className="ml-4 flex-1 max-w-xs">
          {activePage === 'assignments' && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #E5E7EB' }}
            >
              <Search size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              <input
                id="header-search"
                type="text"
                placeholder="Search assignments…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-xs flex-1"
                style={{ color: '#111111' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Right Controls ──────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications"
            onClick={() => { setNotifOpen((v) => !v); setUserOpen(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150"
            style={{ background: notifOpen ? '#F3F4F6' : 'rgba(255,255,255,0.7)', border: '1px solid #E5E7EB' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = notifOpen ? '#F3F4F6' : 'rgba(255,255,255,0.7)')}
          >
            <Bell size={16} style={{ color: '#374151' }} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full"
                style={{ background: '#EF4444' }}
              />
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-[20px] shadow-veda-popup animate-fade-in overflow-hidden"
              style={{ background: 'white', border: '1px solid #F3F4F6', top: '100%' }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <h3 className="text-sm font-semibold text-[#111111] font-bricolage">Notifications</h3>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full font-bricolage"
                  style={{ background: '#FEE2E2', color: '#EF4444' }}
                >
                  {unreadCount} new
                </span>
              </div>
              <div className="flex flex-col">
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{ background: n.unread ? '#FAFAFA' : 'white', borderTop: '1px solid #F3F4F6' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = n.unread ? '#FAFAFA' : 'white')}
                  >
                    {n.unread && (
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#EF4444' }} />
                    )}
                    {!n.unread && <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-xs leading-relaxed font-bricolage" style={{ color: '#374151' }}>{n.text}</p>
                      <p className="text-[10px] mt-1 font-bricolage" style={{ color: '#9CA3AF' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 text-center" style={{ borderTop: '1px solid #F3F4F6' }}>
                <button className="text-xs font-semibold font-bricolage" style={{ color: '#EF4444' }}>
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── User Dropdown ─────────────────────── */}
        <div className="relative" ref={userRef}>
          <button
            id="btn-user-menu"
            onClick={() => { setUserOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2.5 pl-1 pr-3.5 py-1 rounded-xl transition-all duration-150 border border-gray-250/50 hover:bg-gray-50/50"
            style={{
              background: userOpen ? '#F3F4F6' : 'rgba(255,255,255,0.7)',
            }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border border-white/20"
              style={{ background: 'linear-gradient(135deg, #1E1E1E 0%, #4B5563 100%)' }}
            >
              S
            </div>
            <span className="text-xs font-bold hidden sm:block text-[#1E1E1E] font-bricolage">
              Samyak
            </span>
            <ChevronDown
              size={12}
              style={{
                color: '#9CA3AF',
                transform: userOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {/* User Menu Dropdown (Explicit 280px wide, spacious details, Bricolage fonts) */}
          {userOpen && (
            <div
              className="absolute right-0 mt-2.5 shadow-2xl animate-fade-in z-50 p-2 flex flex-col gap-1"
              style={{
                background: 'white',
                border: '1px solid #F3F4F6',
                borderRadius: '24px', // Premium L rounded
                top: '100%',
                width: '280px', // Explicitly lock width to prevent squishing
                minWidth: '280px',
              }}
            >
              {/* Profile header with clear spacing */}
              <div className="px-6 py-5 pb-4 border-b border-gray-100 flex flex-col select-none gap-1">
                <p className="text-sm font-bold text-[#1E1E1E] font-bricolage leading-tight">Samyak Srijan</p>
                <p className="text-[11px] font-normal text-gray-500 font-bricolage mt-1 select-text">samyak@vedaai.com</p>
              </div>

              {/* Menu Options */}
              <div className="flex flex-col gap-1 p-2.5">
                {USER_MENU.map((item) => (
                  <button
                    key={item.id}
                    id={item.id}
                    className="w-full flex items-center gap-4 px-5 py-3.5 text-xs font-bold rounded-xl transition-all text-left font-bricolage hover:scale-[1.01] active:scale-[0.99] select-none"
                    style={{ color: item.danger ? '#EF4444' : '#5E5E5ECC' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = item.danger ? '#FEF2F2' : '#F3F4F6';
                      e.currentTarget.style.color = item.danger ? '#EF4444' : '#1E1E1E';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = item.danger ? '#EF4444' : '#5E5E5ECC';
                    }}
                  >
                    <span className="shrink-0 opacity-80">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
