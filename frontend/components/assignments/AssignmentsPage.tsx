'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  MoreVertical,
  Calendar,
  Search,
  BookOpen,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import type { Assignment } from '@/types';

export default function AssignmentsPage() {
  const assignments = useAppStore((s) => s.assignments);
  const deleteAssignment = useAppStore((s) => s.deleteAssignment);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAssignment(id);
    setActiveMenuId(null);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return { bg: 'rgba(22, 163, 74, 0.1)', text: '#16A34A', label: 'Active' };
      case 'processing':
      case 'draft':
        return { bg: 'rgba(217, 119, 6, 0.1)', text: '#D97706', label: 'Processing' };
      case 'failed':
      case 'expired':
        return { bg: 'rgba(220, 38, 38, 0.1)', text: '#DC2626', label: 'Failed' };
      default:
        return { bg: '#F3F4F6', text: '#374151', label: status };
    }
  };

  const renderStatusBadge = (status: string) => {
    const style = getStatusStyle(status);
    return (
      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {status === 'processing' && <RefreshCw size={10} className="animate-spin" />}
        {status === 'failed' && <AlertCircle size={10} />}
        {status === 'completed' && <CheckCircle size={10} />}
        {style.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-[1100px] mx-auto pb-20 select-none">
      {/* ── Top Header Section ─────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-bricolage tracking-tight text-[#303030]">
            Assignments
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage, generate, and view assessment papers for your classes.
          </p>
        </div>
      </div>

      {/* ── Filter & Search Bar Container (width: 1100, height: 50) ── */}
      <div
        className="w-full bg-white/50 backdrop-blur-md border border-white/60 flex items-center justify-between px-6 shadow-sm"
        style={{ height: '50px', borderRadius: '16px', gap: '16px' }}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5E5E5ECC] font-bricolage">
          <BookOpen size={14} className="text-[#9CA3AF]" />
          <span>Filter By: Default</span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1 bg-white/60 border border-[#E5E7EB] rounded-full focus-within:border-gray-400 focus-within:bg-white transition-all duration-200"
          style={{ width: '228px', height: '32px' }}
        >
          <Search size={12} className="text-[#9CA3AF]" />
          <input
            id="search-box-desktop"
            type="text"
            placeholder="Search Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-xs flex-1 text-gray-800 font-semibold font-bricolage"
          />
        </div>
      </div>

      {/* ── Grid/Content Section ────────────────── */}
      {filteredAssignments.length === 0 ? (
        // Empty State or No Matches found
        <div
          className="flex flex-col items-center justify-center p-12 text-center rounded-3xl shadow-sm mt-4 border border-white/60 bg-white/50 backdrop-blur-md"
          style={{ minHeight: '400px' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gray-100/70 select-none text-gray-500"
          >
            <BookOpen size={32} />
          </div>

          <h2 className="text-lg font-extrabold font-bricolage text-[#303030] mb-2 uppercase">
            {searchQuery ? 'No matching assignments' : 'Create your first assignment'}
          </h2>
          <p className="text-xs max-w-sm mb-8 text-[#5E5E5ECC] font-medium leading-relaxed font-bricolage">
            {searchQuery
              ? `We couldn't find any assignments matching "${searchQuery}". Try a different keyword.`
              : 'Generate curriculum-aligned exam papers from slides, PDFs, or notes with AI in seconds.'}
          </p>

          {!searchQuery && (
            <button
              onClick={() => setActivePage('create-assignment')}
              className="btn-create-assignment"
              style={{ width: '208px', height: '46px', borderRadius: '48px', background: '#181818' }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Create Assignment
            </button>
          )}
        </div>
      ) : (
        // Assignment Cards Grid (Figma row layout: 1100 width, gap 16)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full" style={{ gap: '16px' }}>
          {filteredAssignments.map((a) => {
            const statusStyle = getStatusStyle(a.status);
            return (
              <div
                key={a.id}
                className="bg-white/50 backdrop-blur-md border border-white/60 hover:border-gray-250 shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  width: '100%',
                  height: '162px',
                  borderRadius: '24px',
                  padding: '24px',
                  gap: '12px',
                }}
                onClick={() => {
                  if (a.status === 'completed' || a.status === 'active') {
                    setActivePage('assignment-output');
                  }
                }}
              >
                {/* ── Content Detailing (height: 114px, justify: space-between) ── */}
                <div className="flex flex-col justify-between h-full w-full">
                  {/* Top line: Icon, Title & 3-Dot Actions */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(30, 30, 30, 0.06)', color: '#1E1E1E' }}
                      >
                        <BookOpen size={16} />
                      </span>
                      <div>
                        <h3
                          className="text-sm font-bold font-bricolage text-[#303030] truncate max-w-[200px]"
                          title={a.title}
                        >
                          {a.title}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                          Class 5 • English
                        </p>
                      </div>
                    </div>

                    {/* 3-Dot Actions */}
                    <div className="relative">
                      <button
                        className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
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
                            className="absolute right-0 mt-1 w-32 rounded-xl shadow-veda-popup bg-white border border-gray-150 z-50 py-1 overflow-hidden"
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
                              View Paper
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
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

                  {/* Dynamic Status / Progress Bar */}
                  {a.status === 'processing' && (
                    <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                      <div className="bg-[#1E1E1E] h-1 rounded-full animate-[pulse_1s_infinite]" style={{ width: '45%' }} />
                    </div>
                  )}

                  {/* Bottom Line: Dates & Status Badge (justify: space-between) */}
                  <div className="flex items-center justify-between border-t border-gray-50 pt-2.5 mt-2">
                    <div className="flex items-center gap-4 text-[11px] font-bricolage text-[#5E5E5ECC]">
                      <div>
                        <span className="font-extrabold text-gray-800">Assigned on:</span>{' '}
                        <span className="font-normal">{a.assignedOn || '20-06-2025'}</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-gray-800">Due:</span>{' '}
                        <span className="font-normal">{a.dueDate}</span>
                      </div>
                    </div>
                    {renderStatusBadge(a.status)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Sticky bottom floating button (w: 208, h: 46) ── */}
      {filteredAssignments.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
          <button
            onClick={() => setActivePage('create-assignment')}
            className="btn-create-assignment flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md hover:scale-105"
            style={{
              width: '208px',
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
            Create Assignment
          </button>
        </div>
      )}
    </div>
  );
}
