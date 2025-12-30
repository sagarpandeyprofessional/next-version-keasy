/**
 * @file MarketplaceAdmin.jsx
 * @description Admin console for moderating marketplace listings, marking items as sold,
 * and attaching promotional details such as discounts and seasonal offers.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../../api/supabase-client';
import { isSuperadmin } from '../../../../../utils/adminUtils';
import AdminSignIn from '../../../../admin/AdminSignIn';
import {
  ArrowLeft,
  CheckCircle,
  Gift,
  Loader2,
  Percent,
  RefreshCw,
  Search,
  Shield,
  ShoppingBag,
  Tag,
  XCircle
} from 'lucide-react';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'sold', label: 'Sold/Unavailable' },
  { id: 'discount', label: 'Discounted' },
  { id: 'offer', label: 'Special Offer' }
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(amount || 0);

const StatusPill = ({ label, tone = 'gray', icon: Icon }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${colors[tone] || colors.gray}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
};

const MarketplaceAdmin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [savingState, setSavingState] = useState({});
  const [promoDrafts, setPromoDrafts] = useState({});
  const [supportsPromos, setSupportsPromos] = useState(true);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // ---------------------------------------------------------------------------
  // Auth + data loading
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const currentUser = data?.user || null;
        setUser(currentUser);

        if (!currentUser) {
          setAuthLoading(false);
          return;
        }

        const admin = await isSuperadmin(currentUser);
        setIsAdmin(admin);
        setAuthLoading(false);

        if (admin) {
          await fetchItems();
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(err.message || 'Failed to verify admin access.');
        setAuthLoading(false);
      }
    };

    init();
  }, []);

  const fetchItems = useCallback(async () => {
    setListLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const { data, error: fetchError } = await supabase
        .from('marketplace')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const rows = data || [];
      setItems(rows);

      const nextDrafts = {};
      rows.forEach((item) => {
        nextDrafts[item.id] = {
          discount_percent: item.discount_percent ?? '',
          special_offer_label: item.special_offer_label ?? '',
          special_offer_expires_at: item.special_offer_expires_at
            ? item.special_offer_expires_at.substring(0, 10)
            : ''
        };
      });
      setPromoDrafts(nextDrafts);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load marketplace items.');
    } finally {
      setListLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const setDraftField = (id, field, value) => {
    setPromoDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.location?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      const isAvailable = item.available !== false;
      const hasDiscount = Number(item.discount_percent) > 0;
      const hasOffer = !!item.special_offer_label;

      switch (filter) {
        case 'active':
          return isAvailable;
        case 'sold':
          return !isAvailable;
        case 'discount':
          return hasDiscount;
        case 'offer':
          return hasOffer;
        default:
          return true;
      }
    });
  }, [items, search, filter]);

  const stats = useMemo(() => {
    const active = items.filter((item) => item.available !== false).length;
    const sold = items.length - active;
    const discounted = items.filter((item) => Number(item.discount_percent) > 0).length;
    const offers = items.filter((item) => !!item.special_offer_label).length;

    return { total: items.length, active, sold, discounted, offers };
  }, [items]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const toggleAvailability = async (itemId, shouldBeAvailable) => {
    setSavingState((prev) => ({ ...prev, [itemId]: true }));
    setError(null);
    setSuccessMessage('');

    try {
      const { error: updateError } = await supabase
        .from('marketplace')
        .update({ available: shouldBeAvailable })
        .eq('id', itemId);

      if (updateError) throw updateError;

      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, available: shouldBeAvailable } : item))
      );
      setSuccessMessage(shouldBeAvailable ? 'Listing marked as available.' : 'Listing marked as sold/unavailable.');
    } catch (err) {
      console.error('Availability update error:', err);
      setError(err.message || 'Failed to update availability.');
    } finally {
      setSavingState((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const savePromo = async (itemId, overrideDraft) => {
    const draft = overrideDraft || promoDrafts[itemId] || {};
    const discountValue = draft.discount_percent === '' ? null : Number(draft.discount_percent);

    if (discountValue !== null && (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 90)) {
      setError('Discount must be between 0 and 90%.');
      return;
    }

    setSavingState((prev) => ({ ...prev, [itemId]: true }));
    setError(null);
    setSuccessMessage('');

    const payload = {
      discount_percent: discountValue,
      special_offer_label: draft.special_offer_label?.trim() || null,
      special_offer_expires_at: draft.special_offer_expires_at || null
    };

    try {
      const { error: updateError } = await supabase
        .from('marketplace')
        .update(payload)
        .eq('id', itemId);

      if (updateError) {
        // If columns are missing, disable promos and surface guidance
        const message = updateError.message || '';
        if (message.toLowerCase().includes('column') && message.toLowerCase().includes('does not exist')) {
          setSupportsPromos(false);
          setError(
            'Promo columns are missing. Add discount_percent (numeric), special_offer_label (text), and special_offer_expires_at (date) to the marketplace table.'
          );
          throw updateError;
        }
        throw updateError;
      }

      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, ...payload } : item))
      );
      setSuccessMessage('Promotional details saved.');
    } catch (err) {
      console.error('Promo update error:', err);
      setError(err.message || 'Failed to save promotion.');
    } finally {
      setSavingState((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const clearPromo = async (itemId) => {
    const resetDraft = {
      discount_percent: '',
      special_offer_label: '',
      special_offer_expires_at: ''
    };

    setPromoDrafts((prev) => ({
      ...prev,
      [itemId]: resetDraft
    }));

    await savePromo(itemId, resetDraft);
  };

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminSignIn />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marketplace Admin</h1>
              <p className="text-sm text-gray-600">Moderate listings, mark sold, and add promotions.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill label="Admin Mode" tone="green" icon={Shield} />
            <button
              onClick={fetchItems}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {(error || successMessage) && (
          <div className="space-y-2">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <XCircle className="w-4 h-4 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Action required</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
            {successMessage && (
              <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                <CheckCircle className="w-4 h-4 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Success</p>
                  <p>{successMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Listings', value: stats.total, tone: 'gray', icon: ShoppingBag },
            { label: 'Active', value: stats.active, tone: 'green', icon: CheckCircle },
            { label: 'Sold/Unavailable', value: stats.sold, tone: 'red', icon: XCircle },
            { label: 'Promos', value: stats.discounted + stats.offers, tone: 'amber', icon: Gift }
          ].map((card) => (
            <div
              key={card.label}
              className="p-4 rounded-xl bg-white border border-gray-200 flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 text-gray-700">
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or location"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
              />
            </div>
            <button
              onClick={() => setSearch('')}
              className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                  filter === item.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {listLoading ? (
            <div className="flex items-center justify-center py-12 bg-white border border-gray-200 rounded-xl">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-700 text-sm">Loading listings...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-600">
              No listings match your filters.
            </div>
          ) : (
            filteredItems.map((item) => {
              const draft = promoDrafts[item.id] || {};
              const isAvailable = item.available !== false;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition-all"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">{item.title || 'Untitled listing'}</h3>
                        <StatusPill
                          label={isAvailable ? 'Active' : 'Sold/Unavailable'}
                          tone={isAvailable ? 'green' : 'red'}
                          icon={isAvailable ? CheckCircle : XCircle}
                        />
                        {item.verified === false && <StatusPill label="Pending verification" tone="amber" icon={Shield} />}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                        <span>{formatCurrency(item.price)}</span>
                        {item.location && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>{item.location}</span>
                          </>
                        )}
                        {item.category_name && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>{item.category_name}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {Number(item.discount_percent) > 0 && (
                          <StatusPill
                            label={`${item.discount_percent}% off`}
                            tone="blue"
                            icon={Percent}
                          />
                        )}
                        {item.special_offer_label && (
                          <StatusPill
                            label={item.special_offer_label}
                            tone="amber"
                            icon={Tag}
                          />
                        )}
                        {item.special_offer_expires_at && (
                          <StatusPill
                            label={`Ends ${item.special_offer_expires_at.substring(0, 10)}`}
                            tone="gray"
                            icon={Gift}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAvailability(item.id, !isAvailable)}
                        disabled={savingState[item.id]}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                          isAvailable
                            ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'
                            : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {savingState[item.id] ? 'Updating...' : isAvailable ? 'Mark Sold' : 'Mark Available'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={draft.discount_percent}
                        onChange={(e) => setDraftField(item.id, 'discount_percent', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 disabled:opacity-60"
                        placeholder="0"
                        disabled={!supportsPromos}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Special offer label</label>
                      <input
                        type="text"
                        value={draft.special_offer_label}
                        onChange={(e) => setDraftField(item.id, 'special_offer_label', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 disabled:opacity-60"
                        placeholder="e.g. Christmas offer"
                        disabled={!supportsPromos}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Offer ends on</label>
                      <input
                        type="date"
                        value={draft.special_offer_expires_at}
                        onChange={(e) => setDraftField(item.id, 'special_offer_expires_at', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 disabled:opacity-60"
                        disabled={!supportsPromos}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        onClick={() => savePromo(item.id)}
                        disabled={savingState[item.id] || !supportsPromos}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {savingState[item.id] && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save promo
                      </button>
                      <button
                        onClick={() => clearPromo(item.id)}
                        disabled={savingState[item.id] || !supportsPromos}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          {!supportsPromos && (
            <p className="text-red-600 font-semibold">
              Promotions are disabled because the table is missing required columns.
            </p>
          )}
          <p>
            Ensure the marketplace table includes the fields
            <code className="mx-1 bg-gray-100 px-1 py-0.5 rounded text-gray-700">discount_percent</code>,
            <code className="mx-1 bg-gray-100 px-1 py-0.5 rounded text-gray-700">special_offer_label</code>,
            <code className="mx-1 bg-gray-100 px-1 py-0.5 rounded text-gray-700">special_offer_expires_at</code>,
            and <code className="mx-1 bg-gray-100 px-1 py-0.5 rounded text-gray-700">available</code> to store these updates.
          </p>
        </div>
      </main>
    </div>
  );
};

export default MarketplaceAdmin;
