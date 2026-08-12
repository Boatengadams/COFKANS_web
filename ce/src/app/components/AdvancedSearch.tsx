import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, SlidersHorizontal, Check, RotateCcw, BadgeCheck, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LocalProduct {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  category?: string;
  subcategory?: string;
  image?: string;
  description?: string;
  specs?: string[];
  stock?: number;
  rating?: number;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClose?: () => void;
  categories?: { id: string; label: string }[];
  subcategories?: string[];
  maxPrice?: number;
  localProducts?: LocalProduct[];
}

export interface SearchFilters {
  searchTerm: string;
  category: string;
  subcategory?: string;
  priceRange: { min: number; max: number };
  minRating: number;
  inStock: boolean;
}

const RECENT_KEY = 'cofkans:recentSearches';
const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  categories: categoriesProp,
  maxPrice,
  localProducts = [],
}) => {
  // PRICE_MAX from actual products (with sane fallback)
  const PRICE_MAX = useMemo(() => {
    const fromProducts = Math.max(0, ...localProducts.map(p => p.price ?? 0));
    return Math.max(1000, Math.ceil((fromProducts || maxPrice || 10000) / 100) * 100);
  }, [localProducts, maxPrice]);

  // Build category list from actual product categories — guaranteed to match
  const CATEGORIES = useMemo(() => {
    const counts = new Map<string, number>();
    localProducts.forEach(p => {
      if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    });
    const list = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => {
        const fromProp = categoriesProp?.find(c => c.id === id);
        return { id, label: fromProp?.label ?? id, count };
      });
    return [{ id: 'all', label: 'All products', count: localProducts.length }, ...list];
  }, [localProducts, categoriesProp]);

  // Subcategories filtered to current category
  const SUBCATEGORIES = useMemo(() => {
    const counts = new Map<string, number>();
    return { counts, getFor(catId: string) {
      const map = new Map<string, number>();
      localProducts.forEach(p => {
        if (!p.subcategory) return;
        if (catId !== 'all' && p.category !== catId) return;
        map.set(p.subcategory, (map.get(p.subcategory) ?? 0) + 1);
      });
      return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    }};
  }, [localProducts]);

  const PRESETS = useMemo(() => {
    const top = PRICE_MAX;
    const q1 = Math.round(top * 0.05), q2 = Math.round(top * 0.2);
    const q3 = Math.round(top * 0.5), q4 = Math.round(top * 0.8);
    return [
      { label: `Under ₵${fmt(q1)}`, min: 0, max: q1 },
      { label: `₵${fmt(q1)}–${fmt(q2)}`, min: q1, max: q2 },
      { label: `₵${fmt(q2)}–${fmt(q3)}`, min: q2, max: q3 },
      { label: `₵${fmt(q3)}–${fmt(q4)}`, min: q3, max: q4 },
      { label: `₵${fmt(q4)}+`, min: q4, max: PRICE_MAX },
    ];
  }, [PRICE_MAX]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<LocalProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // `applied` = what the parent actually filters on. `draft` = what user is editing in the sheet.
  const [applied, setApplied] = useState<SearchFilters>({
    searchTerm: '', category: 'all', subcategory: 'all',
    priceRange: { min: 0, max: PRICE_MAX },
    minRating: 0, inStock: false,
  });
  const [draft, setDraft] = useState<SearchFilters>(applied);

  // When the sheet opens, snapshot the current applied filters into the draft
  useEffect(() => {
    if (showFilters) setDraft(applied);
  }, [showFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep price max in sync if products change
  useEffect(() => {
    setApplied(f => f.priceRange.max === 0 || f.priceRange.max > PRICE_MAX
      ? { ...f, priceRange: { min: f.priceRange.min, max: PRICE_MAX } } : f);
    setDraft(f => f.priceRange.max === 0 || f.priceRange.max > PRICE_MAX
      ? { ...f, priceRange: { min: f.priceRange.min, max: PRICE_MAX } } : f);
  }, [PRICE_MAX]);

  const subOptions = useMemo(() => SUBCATEGORIES.getFor(draft.category), [SUBCATEGORIES, draft.category]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (applied.category !== 'all') n++;
    if (applied.subcategory && applied.subcategory !== 'all') n++;
    if (applied.priceRange.min !== 0 || applied.priceRange.max !== PRICE_MAX) n++;
    if (applied.inStock) n++;
    return n;
  }, [applied, PRICE_MAX]);

  const draftDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(applied), [draft, applied]);

  // Preview count for the *draft* — so user sees what Apply will give them
  const previewCount = useMemo(() => {
    if (!localProducts.length) return null;
    const tokens = searchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return localProducts.filter(p => {
      if (draft.category !== 'all' && p.category !== draft.category) return false;
      if (draft.subcategory && draft.subcategory !== 'all' && p.subcategory !== draft.subcategory) return false;
      if (typeof p.price === 'number') {
        if (p.price < draft.priceRange.min || p.price > draft.priceRange.max) return false;
      }
      if (draft.inStock && (p.stock ?? 0) <= 0) return false;
      if (tokens.length) {
        const hay = `${p.name} ${p.sku ?? ''} ${p.category ?? ''} ${p.subcategory ?? ''} ${p.description ?? ''} ${(p.specs ?? []).join(' ')}`.toLowerCase();
        if (!tokens.every(t => hay.includes(t))) return false;
      }
      return true;
    }).length;
  }, [localProducts, draft, searchTerm]);

  useEffect(() => {
    try { const raw = localStorage.getItem(RECENT_KEY); if (raw) setRecent(JSON.parse(raw)); } catch {/* */}
  }, []);

  const pushRecent = (q: string) => {
    const v = q.trim(); if (!v) return;
    setRecent(prev => {
      const next = [v, ...prev.filter(x => x.toLowerCase() !== v.toLowerCase())].slice(0, 6);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {/* */}
      return next;
    });
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!showFilters) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showFilters]);

  // Live suggestions
  useEffect(() => {
    if (searchTerm.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const needle = searchTerm.toLowerCase();
    const list = localProducts.filter(p => {
      const hay = `${p.name} ${p.sku ?? ''} ${p.category ?? ''} ${p.subcategory ?? ''}`.toLowerCase();
      return hay.includes(needle);
    }).slice(0, 6);
    setSuggestions(list);
    setShowSuggestions(list.length > 0);
  }, [searchTerm, localProducts]);

  // Apply immediately (search, chip-clears) — used outside the sheet
  const fireApplied = (next?: Partial<SearchFilters>) => {
    const merged = { ...applied, ...next, searchTerm };
    setApplied(merged);
    setDraft(merged);
    onSearch(merged);
  };

  // Stage a change in the draft only — Apply button commits it
  const stageDraft = (next: Partial<SearchFilters>) => {
    setDraft(d => ({ ...d, ...next }));
  };

  const applyDraft = () => {
    const merged = { ...draft, searchTerm };
    setApplied(merged);
    onSearch(merged);
    setShowFilters(false);
  };

  const handleSearch = () => { fireApplied(); pushRecent(searchTerm); setShowSuggestions(false); };

  const clearSearch = () => { setSearchTerm(''); fireApplied({}); setShowSuggestions(false); };

  const resetDraft = () => {
    setDraft({
      searchTerm: '', category: 'all', subcategory: 'all',
      priceRange: { min: 0, max: PRICE_MAX },
      minRating: 0, inStock: false,
    });
  };

  const clearAllApplied = () => {
    const fresh: SearchFilters = {
      searchTerm: '', category: 'all', subcategory: 'all',
      priceRange: { min: 0, max: PRICE_MAX },
      minRating: 0, inStock: false,
    };
    setApplied(fresh); setDraft(fresh); setSearchTerm('');
    onSearch(fresh);
  };

  const showRecent = !searchTerm && recent.length > 0;

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={2.4} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); fireApplied({}); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); if (e.key === 'Escape') setShowSuggestions(false); }}
            onFocus={() => (suggestions.length > 0 || showRecent) && setShowSuggestions(true)}
            placeholder="Search products…"
            className="w-full pl-12 pr-12 py-3 sm:py-3.5 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm sm:text-base font-medium transition-all"
          />
          {searchTerm && (
            <button onClick={clearSearch} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(v => !v)}
          className={`relative px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border-2 flex items-center gap-2 font-bold text-sm transition-all ${
            showFilters || activeCount > 0
              ? 'bg-foreground text-background border-foreground shadow-md'
              : 'bg-card text-foreground border-border hover:border-primary/40 hover:bg-muted/40'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Filter</span>
          {activeCount > 0 && (
            <span className="min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center bg-primary text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="mt-2 flex flex-wrap items-center gap-1.5">
            {applied.category !== 'all' && (
              <Chip onClear={() => fireApplied({ category: 'all', subcategory: 'all' })}>
                {CATEGORIES.find(c => c.id === applied.category)?.label ?? applied.category}
              </Chip>
            )}
            {applied.subcategory && applied.subcategory !== 'all' && (
              <Chip onClear={() => fireApplied({ subcategory: 'all' })}>{applied.subcategory}</Chip>
            )}
            {(applied.priceRange.min !== 0 || applied.priceRange.max !== PRICE_MAX) && (
              <Chip onClear={() => fireApplied({ priceRange: { min: 0, max: PRICE_MAX } })}>
                ₵{applied.priceRange.min.toLocaleString()}–{applied.priceRange.max.toLocaleString()}
              </Chip>
            )}
            {applied.inStock && <Chip onClear={() => fireApplied({ inStock: false })}>In stock</Chip>}
            <button onClick={clearAllApplied} className="text-[11px] font-bold text-muted-foreground hover:text-foreground underline underline-offset-2 ml-auto">
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || showRecent) && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-xl shadow-2xl overflow-hidden z-40 max-h-[400px] overflow-y-auto">
            {showRecent && suggestions.length === 0 && recent.map(r => (
              <button key={r} onClick={() => { setSearchTerm(r); pushRecent(r); fireApplied({}); setShowSuggestions(false); }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted/60 flex items-center gap-2 border-b border-border/50 last:border-0">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="flex-1 truncate font-medium">{r}</span>
              </button>
            ))}
            {suggestions.map((p) => (
              <button key={p.id}
                onClick={() => { setSearchTerm(p.name); pushRecent(p.name); fireApplied({}); setShowSuggestions(false); }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/60 transition-colors text-left border-b border-border last:border-0">
                {p.image
                  ? <img src={p.image} alt={p.name} className="w-11 h-11 object-cover rounded-lg flex-shrink-0 border border-border" />
                  : <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"><Package className="w-5 h-5 text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.subcategory ?? p.category}</p>
                </div>
                {typeof p.price === 'number' && (
                  <p className="font-bold text-sm text-primary whitespace-nowrap">₵{p.price.toFixed(0)}</p>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" />
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 md:absolute md:inset-x-auto md:bottom-auto md:top-full md:left-0 md:right-0 md:mt-3"
            >
              <div className="bg-card md:border-2 border-border md:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[75vh]">
                <div className="md:hidden flex justify-center pt-2 pb-1">
                  <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0">
                  <div>
                    <div className="text-sm font-bold">Filter products</div>
                    <div className="text-[11px] text-muted-foreground">
                      {previewCount !== null
                        ? <><span className="font-bold text-foreground">{previewCount}</span> match{previewCount !== 1 ? 'es' : ''} {draftDirty && <span className="text-amber-600">· unsaved</span>}</>
                        : ''}
                    </div>
                  </div>
                  <button onClick={() => setShowFilters(false)} aria-label="Close" className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5 overflow-y-auto flex-1">
                  {/* Category */}
                  <Section title="Category">
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map(c => {
                        const active = draft.category === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => stageDraft({ category: c.id, subcategory: 'all' })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all flex items-center gap-1.5 ${
                              active
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-card text-foreground border-border hover:border-foreground/40 hover:bg-muted/50'
                            }`}
                          >
                            {active && <Check className="w-3 h-3" strokeWidth={3} />}
                            <span>{c.label}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${active ? 'bg-background/20' : 'bg-muted text-muted-foreground'}`}>
                              {c.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Section>

                  {/* Subcategory (only if any) */}
                  {subOptions.length > 0 && (
                    <Section title="Type">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => stageDraft({ subcategory: 'all' })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                            !draft.subcategory || draft.subcategory === 'all'
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-card text-foreground border-border hover:border-foreground/40 hover:bg-muted/50'
                          }`}
                        >
                          All
                        </button>
                        {subOptions.map(([sc, count]) => {
                          const active = draft.subcategory === sc;
                          return (
                            <button
                              key={sc}
                              onClick={() => stageDraft({ subcategory: sc })}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all flex items-center gap-1.5 ${
                                active
                                  ? 'bg-foreground text-background border-foreground'
                                  : 'bg-card text-foreground border-border hover:border-foreground/40 hover:bg-muted/50'
                              }`}
                            >
                              {active && <Check className="w-3 h-3" strokeWidth={3} />}
                              <span>{sc}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${active ? 'bg-background/20' : 'bg-muted text-muted-foreground'}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </Section>
                  )}

                  {/* Price — simple preset chips, no slider */}
                  <Section title="Price">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => stageDraft({ priceRange: { min: 0, max: PRICE_MAX } })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                          draft.priceRange.min === 0 && draft.priceRange.max === PRICE_MAX
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-card text-foreground border-border hover:border-foreground/40 hover:bg-muted/50'
                        }`}
                      >
                        Any price
                      </button>
                      {PRESETS.map(p => {
                        const active = draft.priceRange.min === p.min && draft.priceRange.max === p.max;
                        return (
                          <button
                            key={p.label}
                            onClick={() => stageDraft({ priceRange: { min: p.min, max: p.max } })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                              active
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-card text-foreground border-border hover:border-foreground/40 hover:bg-muted/50'
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </Section>

                  {/* In stock toggle */}
                  <Section title="Availability">
                    <button
                      onClick={() => stageDraft({ inStock: !draft.inStock })}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        draft.inStock
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : 'bg-card border-border hover:bg-muted/50'
                      }`}
                    >
                      <span className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${draft.inStock ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${draft.inStock ? 'left-[22px]' : 'left-0.5'}`} />
                      </span>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-bold flex items-center gap-1">
                          {draft.inStock && <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />}
                          In stock only
                        </div>
                        <div className="text-[11px] text-muted-foreground">Hide sold-out products</div>
                      </div>
                    </button>
                  </Section>
                </div>

                {/* Footer — Cancel / Reset / Apply */}
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border bg-muted/30 flex-shrink-0">
                  <button
                    onClick={resetDraft}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-foreground hover:bg-card border-2 border-border transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyDraft}
                      disabled={!draftDirty}
                      className="flex-1 max-w-[220px] px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-xs shadow-md shadow-primary/30 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      {draftDirty
                        ? (previewCount !== null
                            ? `Apply · ${previewCount.toLocaleString()} result${previewCount !== 1 ? 's' : ''}`
                            : 'Apply filters')
                        : 'No changes'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-foreground/10 text-foreground text-[11px] font-bold border border-foreground/20">
      {children}
      <button onClick={onClear} aria-label="Remove" className="w-4 h-4 rounded-full hover:bg-foreground/20 flex items-center justify-center">
        <X className="w-2.5 h-2.5" strokeWidth={3} />
      </button>
    </span>
  );
}
