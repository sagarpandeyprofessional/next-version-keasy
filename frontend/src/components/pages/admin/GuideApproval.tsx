// @ts-nocheck
"use client";

/**
 * @file GuideApproval.jsx
 * @description Admin page for reviewing and approving/rejecting guide postings.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isSuperadmin } from '@/utils/adminUtils';
import AdminSignIn from '@/components/pages/admin/AdminSignIn';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Loader2,
  AlertCircle,
  BookOpen,
  User,
  Calendar,
  ExternalLink,
  X,
  CheckSquare,
  Square,
  RefreshCw,
  Heart,
  Trash2
} from 'lucide-react';

import {
  formatCount,
  formatDate,
  getRelativeTime
} from '@/components/pages/jobs/components/jobsUtils';

const LABELS = {
  pageTitle: { en: 'Guide Approval', ko: '가이드 승인' },
  pageSubtitle: { en: 'Review and approve guide postings', ko: '가이드 게시물 검토 및 승인' },
  pending: { en: 'Pending', ko: '대기중' },
  approved: { en: 'Approved', ko: '승인됨' },
  rejected: { en: 'Rejected', ko: '거절됨' },
  approve: { en: 'Approve', ko: '승인' },
  reject: { en: 'Reject', ko: '거절' },
  viewDetails: { en: 'View Details', ko: '자세히 보기' },
  searchPlaceholder: { en: 'Search guides or authors...', ko: '가이드 또는 작성자 검색...' },
  noGuides: { en: 'No guides found', ko: '가이드를 찾을 수 없습니다' },
  selectAll: { en: 'Select All', ko: '전체 선택' },
  selected: { en: 'selected', ko: '개 선택됨' },
  bulkApprove: { en: 'Approve Selected', ko: '선택 승인' },
  bulkReject: { en: 'Reject Selected', ko: '선택 거절' },
  clearSelection: { en: 'Clear', ko: '초기화' },
  postedBy: { en: 'Posted by', ko: '작성자' },
  refresh: { en: 'Refresh', ko: '새로고침' },
  adminOnly: { en: 'Admin access required', ko: '관리자 권한 필요' },
  goBack: { en: 'Go Back', ko: '뒤로가기' },
  confirmApprove: { en: 'Are you sure you want to approve this guide?', ko: '이 가이드를 승인하시겠습니까?' },
  confirmReject: { en: 'Are you sure you want to reject this guide?', ko: '이 가이드를 거절하시겠습니까?' },
  guideApproved: { en: 'Guide approved successfully', ko: '가이드가 승인되었습니다' },
  guideRejected: { en: 'Guide rejected successfully', ko: '가이드가 거절되었습니다' },
  delete: { en: 'Delete', ko: '삭제' },
  confirmDelete: { en: 'Delete this guide permanently?', ko: '이 가이드를 영구적으로 삭제하시겠습니까?' },
  deleteOnlyRejected: { en: 'Only rejected guides can be deleted', ko: '거절된 가이드만 삭제할 수 있습니다' }
};

const STORAGE_PUBLIC_PREFIX = '/storage/v1/object/public/guides/';

const extractStoragePath = (url) => {
  if (!url) return null;
  const idx = url.indexOf(STORAGE_PUBLIC_PREFIX);
  if (idx === -1) return null;
  return url.slice(idx + STORAGE_PUBLIC_PREFIX.length).split('?')[0];
};

const collectGuideStoragePaths = (guide) => {
  if (!guide) return [];

  const paths = [];
  const coverPath = extractStoragePath(guide.img_url);
  if (coverPath) paths.push(coverPath);

  const sections = guide.content?.sections || [];
  sections.forEach(section => {
    if (section?.type === 'image') {
      const imagePath = extractStoragePath(section.url);
      if (imagePath) paths.push(imagePath);
    }
  });

  return [...new Set(paths)];
};

const StatsCard = ({ icon: Icon, label, value, color, isActive, onClick }) => {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  const activeClasses = {
    gray: 'ring-2 ring-gray-400',
    amber: 'ring-2 ring-amber-400',
    green: 'ring-2 ring-green-400',
    red: 'ring-2 ring-red-400'
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex-1 p-4 rounded-xl border transition-all text-left
        ${colorClasses[color]}
        ${isActive ? activeClasses[color] : 'hover:shadow-md'}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-80">{label}</p>
        </div>
      </div>
    </button>
  );
};

const StatusBadge = ({ status, lang }) => {
  const config = {
    pending: {
      icon: Clock,
      label: lang === 'ko' ? '대기중' : 'Pending',
      className: 'bg-amber-100 text-amber-700'
    },
    approved: {
      icon: CheckCircle,
      label: lang === 'ko' ? '승인됨' : 'Approved',
      className: 'bg-green-100 text-green-700'
    },
    rejected: {
      icon: XCircle,
      label: lang === 'ko' ? '거절됨' : 'Rejected',
      className: 'bg-red-100 text-red-700'
    }
  };

  const { icon: Icon, label, className } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

const GuideRow = ({
  guide,
  author,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onDelete,
  onView,
  lang,
  isProcessing
}) => {
  const status = guide.approved === true ? 'approved' : guide.approved === false ? 'rejected' : 'pending';
  const likesCount = guide.like ? Object.keys(guide.like || {}).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all"
    >
      <div className="flex items-start gap-4">
        <button onClick={() => onSelect(guide.id)} className="mt-1 flex-shrink-0">
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>

        {guide.img_url ? (
          <img
            src={guide.img_url}
            alt={guide.name}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">{guide.name || 'Untitled Guide'}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {author?.username || 'Unknown author'}
              </p>
            </div>
            <StatusBadge status={status} lang={lang} />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {getRelativeTime(guide.created_at)}
            </span>
            {guide.category && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {guide.category}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatCount(guide.view || 0)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {formatCount(likesCount)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onView(guide)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              {lang === 'ko' ? '보기' : 'View'}
            </button>

            {status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(guide.id)}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {lang === 'ko' ? '승인' : 'Approve'}
                </button>
                <button
                  onClick={() => onReject(guide.id)}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  {lang === 'ko' ? '거절' : 'Reject'}
                </button>
              </>
            )}

            {status === 'rejected' && (
              <button
                onClick={() => onDelete(guide.id)}
                disabled={isProcessing}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {lang === 'ko' ? LABELS.delete.ko : LABELS.delete.en}
              </button>
            )}

            <Link
              href={`/guides/guide/${guide.id}`}
              target="_blank"
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors ml-auto"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GuideDetailModal = ({ guide, author, onClose, onApprove, onReject, onDelete, lang, isProcessing }) => {
  if (!guide) return null;

  const status = guide.approved === true ? 'approved' : guide.approved === false ? 'rejected' : 'pending';
  const likesCount = guide.like ? Object.keys(guide.like || {}).length : 0;
  const sections = guide.content?.sections || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{lang === 'ko' ? '가이드 상세' : 'Guide Details'}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {guide.img_url && (
            <img src={guide.img_url} alt={guide.name} className="w-full h-48 object-cover rounded-xl mb-6" />
          )}

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{guide.name}</h3>
              <p className="text-gray-600">{author?.username}</p>
            </div>
            <StatusBadge status={status} lang={lang} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{lang === 'ko' ? '카테고리' : 'Category'}</p>
              <p className="font-medium text-gray-900">{guide.category || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{lang === 'ko' ? '게시일' : 'Posted on'}</p>
              <p className="font-medium text-gray-900">{formatDate(guide.created_at)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{lang === 'ko' ? '조회수' : 'Views'}</p>
              <p className="font-medium text-gray-900">{formatCount(guide.view || 0)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{lang === 'ko' ? '좋아요' : 'Likes'}</p>
              <p className="font-medium text-gray-900">{formatCount(likesCount)}</p>
            </div>
          </div>

          {guide.description && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">{lang === 'ko' ? '설명' : 'Description'}</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{guide.description}</p>
            </div>
          )}

          {sections.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">{lang === 'ko' ? '콘텐츠 섹션' : 'Content Sections'}</h4>
              {sections.map((section, index) => (
                <div key={index} className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{section.type}</p>
                  {section.body && <p className="text-sm text-gray-700 whitespace-pre-line">{section.body}</p>}
                  {section.caption && <p className="text-sm text-gray-700 whitespace-pre-line">{section.caption}</p>}
                  {section.items && Array.isArray(section.items) && (
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
                      {section.items.slice(0, 5).map((item, i) => (
                        <li key={i}>{item.name || item.label || item}</li>
                      ))}
                    </ul>
                  )}
                  {section.url && (
                    <a href={section.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">
                      {section.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {status === 'pending' && (
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => onReject(guide.id)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              {lang === 'ko' ? '거절' : 'Reject'}
            </button>
            <button
              onClick={() => onApprove(guide.id)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {lang === 'ko' ? '승인' : 'Approve'}
            </button>
          </div>
        )}

        {status === 'rejected' && (
          <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => onDelete(guide.id)}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {lang === 'ko' ? LABELS.delete.ko : LABELS.delete.en}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const GuideApproval = () => {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isSuperadminUser, setIsSuperadminUser] = useState(false);
  const [guides, setGuides] = useState([]);
  const [authors, setAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lang, setLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedIds, setSelectedIds] = useState([]);
  const [processingIds, setProcessingIds] = useState([]);
  const [viewingGuide, setViewingGuide] = useState(null);

  const t = useCallback((key) => {
    return LABELS[key]?.[lang] || LABELS[key]?.en || key;
  }, [lang]);

  const fetchGuides = useCallback(async () => {
    try {
      const { data: guidesData, error: guidesError } = await supabase
        .from('guide')
        .select('*')
        .order('created_at', { ascending: false });

      if (guidesError) throw guidesError;

      setGuides(guidesData || []);

      if (guidesData && guidesData.length > 0) {
        const authorIds = [...new Set(guidesData.map(g => g.created_by).filter(Boolean))];

        if (authorIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, username')
            .in('user_id', authorIds);

          if (!profilesError) {
            const authorsMap = {};
            profilesData?.forEach(p => {
              authorsMap[p.user_id] = p;
            });
            setAuthors(authorsMap);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
          router.push('/admin/signin');
          return;
        }

        setUser(currentUser);

        const isSuperAdmin = await isSuperadmin(currentUser);
        setIsSuperadminUser(isSuperAdmin);

        if (isSuperAdmin) {
          await fetchGuides();
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, fetchGuides]);

  const stats = useMemo(() => {
    const pending = guides.filter(g => g.approved === null || g.approved === undefined).length;
    const approved = guides.filter(g => g.approved === true).length;
    const rejected = guides.filter(g => g.approved === false).length;
    return { total: guides.length, pending, approved, rejected };
  }, [guides]);

  const filteredGuides = useMemo(() => {
    let result = [...guides];

    if (statusFilter === 'pending') {
      result = result.filter(g => g.approved === null || g.approved === undefined);
    } else if (statusFilter === 'approved') {
      result = result.filter(g => g.approved === true);
    } else if (statusFilter === 'rejected') {
      result = result.filter(g => g.approved === false);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(g => {
        const author = authors[g.created_by];
        return (
          g.name?.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query) ||
          author?.username?.toLowerCase().includes(query) ||
          g.category?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [guides, authors, statusFilter, searchQuery]);

  const handleApprove = useCallback(async (guideId) => {
    setProcessingIds(prev => [...prev, guideId]);

    try {
      const { error } = await supabase
        .from('guide')
        .update({ approved: true })
        .eq('id', guideId);

      if (error) throw error;

      setGuides(prev => prev.map(g => g.id === guideId ? { ...g, approved: true } : g));
      setSelectedIds(prev => prev.filter(id => id !== guideId));

      if (viewingGuide?.id === guideId) {
        setViewingGuide(null);
      }
    } catch (err) {
      console.error('Error approving guide:', err);
      alert(lang === 'ko' ? '오류가 발생했습니다' : 'An error occurred');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== guideId));
    }
  }, [viewingGuide, lang]);

  const handleReject = useCallback(async (guideId) => {
    setProcessingIds(prev => [...prev, guideId]);

    try {
      const { error } = await supabase
        .from('guide')
        .update({ approved: false })
        .eq('id', guideId);

      if (error) throw error;

      setGuides(prev => prev.map(g => g.id === guideId ? { ...g, approved: false } : g));
      setSelectedIds(prev => prev.filter(id => id !== guideId));

      if (viewingGuide?.id === guideId) {
        setViewingGuide(null);
      }
    } catch (err) {
      console.error('Error rejecting guide:', err);
      alert(lang === 'ko' ? '오류가 발생했습니다' : 'An error occurred');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== guideId));
    }
  }, [viewingGuide, lang]);

  const handleDelete = useCallback(async (guideId) => {
    const guideToDelete = guides.find(g => g.id === guideId);

    if (!guideToDelete) {
      console.error('Guide not found for deletion');
      return;
    }

    if (guideToDelete && guideToDelete.approved !== false) {
      alert(lang === 'ko' ? LABELS.deleteOnlyRejected.ko : LABELS.deleteOnlyRejected.en);
      return;
    }

    const confirmed = window.confirm(lang === 'ko' ? LABELS.confirmDelete.ko : LABELS.confirmDelete.en);
    if (!confirmed) return;

    setProcessingIds(prev => [...prev, guideId]);

    try {
      const assetPaths = collectGuideStoragePaths(guideToDelete);

      if (assetPaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('guides')
          .remove(assetPaths);

        if (storageError) {
          console.error('Error deleting guide assets from storage:', storageError);
        }
      }

      const { data, error } = await supabase
        .from('guide')
        .delete()
        .eq('id', guideId)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Delete succeeded but no rows were removed. Check RLS policies.');
      }

      setGuides(prev => prev.filter(g => g.id !== guideId));
      setSelectedIds(prev => prev.filter(id => id !== guideId));
      await fetchGuides(); // Ensure Supabase state is the source of truth

      if (viewingGuide?.id === guideId) {
        setViewingGuide(null);
      }
    } catch (err) {
      console.error('Error deleting guide:', err);
      alert((lang === 'ko' ? '삭제 실패: ' : 'Delete failed: ') + (err?.message || 'Unknown error'));
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== guideId));
    }
  }, [guides, lang, viewingGuide, fetchGuides]);

  const handleBulkApprove = useCallback(async () => {
    for (const id of selectedIds) {
      await handleApprove(id);
    }
  }, [selectedIds, handleApprove]);

  const handleBulkReject = useCallback(async () => {
    for (const id of selectedIds) {
      await handleReject(id);
    }
  }, [selectedIds, handleReject]);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredGuides.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGuides.map(g => g.id));
    }
  }, [filteredGuides, selectedIds]);

  const handleSelect = useCallback((guideId) => {
    setSelectedIds(prev =>
      prev.includes(guideId)
        ? prev.filter(id => id !== guideId)
        : [...prev, guideId]
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isSuperadminUser) {
    return <AdminSignIn />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/guides"
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {t('pageTitle')}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">{t('pageSubtitle')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchGuides}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title={t('refresh')}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLang(prev => prev === 'en' ? 'ko' : 'en')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Globe className="w-4 h-4" />
                {lang === 'ko' ? 'EN' : '한글'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatsCard
            icon={BookOpen}
            label={lang === 'ko' ? '전체' : 'Total'}
            value={stats.total}
            color="gray"
            isActive={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          <StatsCard
            icon={Clock}
            label={t('pending')}
            value={stats.pending}
            color="amber"
            isActive={statusFilter === 'pending'}
            onClick={() => setStatusFilter('pending')}
          />
          <StatsCard
            icon={CheckCircle}
            label={t('approved')}
            value={stats.approved}
            color="green"
            isActive={statusFilter === 'approved'}
            onClick={() => setStatusFilter('approved')}
          />
          <StatsCard
            icon={XCircle}
            label={t('rejected')}
            value={stats.rejected}
            color="red"
            isActive={statusFilter === 'rejected'}
            onClick={() => setStatusFilter('rejected')}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                {selectedIds.length} {t('selected')}
              </span>
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-100 rounded"
              >
                {t('bulkApprove')}
              </button>
              <button
                onClick={handleBulkReject}
                className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 rounded"
              >
                {t('bulkReject')}
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded"
              >
                {t('clearSelection')}
              </button>
            </div>
          )}
        </div>

        {filteredGuides.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {selectedIds.length === filteredGuides.length ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {t('selectAll')} ({filteredGuides.length})
            </button>
          </div>
        )}

        {filteredGuides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('noGuides')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGuides.map(guide => (
              <GuideRow
                key={guide.id}
                guide={guide}
                author={authors[guide.created_by]}
                isSelected={selectedIds.includes(guide.id)}
                onSelect={handleSelect}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onView={setViewingGuide}
                lang={lang}
                isProcessing={processingIds.includes(guide.id)}
              />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {viewingGuide && (
          <GuideDetailModal
            guide={viewingGuide}
            author={authors[viewingGuide.created_by]}
            onClose={() => setViewingGuide(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            lang={lang}
            isProcessing={processingIds.includes(viewingGuide.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuideApproval;
