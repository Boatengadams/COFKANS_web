import { useState, useMemo } from 'react';
import { collection, getDocs, limit, query, orderBy, where, getCountFromServer, startAfter, QueryConstraint, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Database, Search, Copy, Check, Download, ChevronDown, ChevronRight, Filter, Calendar, Hash, RefreshCw, AlertCircle } from 'lucide-react';

const PRESETS = ['users', 'products', 'orders', 'reviews', 'deliveries', 'serviceRequests', 'notifications', 'securityEvents', 'auditLogs', 'carts', 'categories', 'productPriceOverrides', 'heroSlides', 'collections'];

type ViewMode = 'json' | 'table';

export function CollectionInspector() {
  const [name, setName] = useState('users');
  const [rowLimit, setRowLimit] = useState(20);
  const [orderField, setOrderField] = useState('');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('json');
  const [collectionCount, setCollectionCount] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(row =>
      JSON.stringify(row).toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const allFields = useMemo(() => {
    if (rows.length === 0) return [];
    const fields = new Set<string>();
    rows.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== '__id') fields.add(key);
      });
    });
    return Array.from(fields).sort();
  }, [rows]);

  const run = async (loadMore = false) => {
    setLoading(true);
    setError(null);
    if (!loadMore) {
      setRows([]);
      setLastDoc(null);
      setHasMore(false);
    }

    try {
      const constraints: QueryConstraint[] = [];

      if (orderField.trim()) {
        constraints.push(orderBy(orderField.trim(), orderDirection));
      }

      if (loadMore && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      constraints.push(limit(rowLimit));

      const q = query(collection(db, name), ...constraints);
      const snap = await getDocs(q);
      const newRows = snap.docs.map(d => ({ __id: d.id, ...d.data() }));

      if (loadMore) {
        setRows(prev => [...prev, ...newRows]);
      } else {
        setRows(newRows);
      }

      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === rowLimit);

      // Get total count
      try {
        const countSnap = await getCountFromServer(collection(db, name));
        setCollectionCount(countSnap.data().count);
      } catch (e) {
        setCollectionCount(null);
      }
    } catch (e: any) {
      setError(e?.message || 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (row: any) => {
    await navigator.clipboard.writeText(JSON.stringify(row, null, 2));
    setCopiedId(row.__id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredRows, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}_${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (filteredRows.length === 0) return;

    const headers = ['__id', ...allFields];
    const csvRows = [headers.join(',')];

    filteredRows.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}_${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpanded = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (value instanceof Timestamp) {
      return new Date(value.toMillis()).toLocaleString();
    }
    if (typeof value === 'object') {
      if (value.seconds && value.nanoseconds !== undefined) {
        // Firestore Timestamp object
        return new Date(value.seconds * 1000).toLocaleString();
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getValueType = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (value instanceof Timestamp) return 'timestamp';
    if (typeof value === 'object') {
      if (value.seconds && value.nanoseconds !== undefined) return 'timestamp';
      if (Array.isArray(value)) return 'array';
      return 'object';
    }
    return typeof value;
  };

  const renderTableView = () => {
    if (filteredRows.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-muted border-b-2 border-border">
              <th className="px-3 py-2 text-left font-bold sticky left-0 bg-muted">ID</th>
              {allFields.map(field => (
                <th key={field} className="px-3 py-2 text-left font-bold whitespace-nowrap">
                  {field}
                </th>
              ))}
              <th className="px-3 py-2 text-left font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(row => (
              <tr key={row.__id} className="border-b border-border hover:bg-muted/50">
                <td className="px-3 py-2 font-mono text-primary font-bold sticky left-0 bg-card">
                  {row.__id}
                </td>
                {allFields.map(field => {
                  const value = row[field];
                  const type = getValueType(value);
                  return (
                    <td key={field} className="px-3 py-2 max-w-xs truncate" title={formatValue(value)}>
                      <span className={`inline-flex items-center gap-1 ${
                        type === 'timestamp' ? 'text-blue-600' :
                        type === 'number' ? 'text-green-600' :
                        type === 'boolean' ? 'text-purple-600' :
                        type === 'object' || type === 'array' ? 'text-orange-600' :
                        'text-foreground'
                      }`}>
                        {formatValue(value)}
                      </span>
                    </td>
                  );
                })}
                <td className="px-3 py-2">
                  <button onClick={() => copy(row)} className="p-1 rounded hover:bg-muted">
                    {copiedId === row.__id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderJsonView = () => {
    return (
      <div className="space-y-2">
        {filteredRows.map(row => {
          const isExpanded = expandedRows.has(row.__id);
          return (
            <div key={row.__id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-muted/50">
                <button
                  onClick={() => toggleExpanded(row.__id)}
                  className="flex items-center gap-2 text-primary font-bold font-mono text-sm hover:underline"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {row.__id}
                </button>
                <button onClick={() => copy(row)} className="p-1 rounded hover:bg-muted">
                  {copiedId === row.__id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              {isExpanded && (
                <div className="p-3">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all text-muted-foreground">
                    {JSON.stringify(row, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" /> Firestore Inspector
          </h2>
          <p className="text-sm text-muted-foreground">Query and explore Firestore collections with advanced filtering and export.</p>
        </div>
        {collectionCount !== null && (
          <div className="text-right">
            <div className="text-2xl font-bold">{collectionCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Documents</div>
          </div>
        )}
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => setName(p)}
              className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-colors ${
                name === p ? 'bg-primary text-white border-primary' : 'bg-muted border-border hover:border-primary/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Collection name"
            className="md:col-span-2 px-3 py-2 rounded-lg border-2 border-border bg-background"
          />
          <input
            value={orderField}
            onChange={e => setOrderField(e.target.value)}
            placeholder="Order by field"
            className="md:col-span-2 px-3 py-2 rounded-lg border-2 border-border bg-background"
          />
          <select
            value={orderDirection}
            onChange={e => setOrderDirection(e.target.value as 'asc' | 'desc')}
            className="px-3 py-2 rounded-lg border-2 border-border bg-background"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <input
            type="number"
            value={rowLimit}
            min={1}
            max={200}
            onChange={e => setRowLimit(Number(e.target.value) || 20)}
            placeholder="Limit"
            className="px-3 py-2 rounded-lg border-2 border-border bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => run(false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            <Search className="w-4 h-4" /> {loading ? 'Querying…' : 'Run Query'}
          </button>

          {hasMore && (
            <button
              onClick={() => run(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white font-bold text-sm disabled:opacity-50 hover:bg-secondary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Load More
            </button>
          )}

          {rows.length > 0 && (
            <>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'json' ? 'table' : 'json')}
                  className="px-3 py-2 rounded-lg border-2 border-border bg-background text-sm font-bold hover:bg-muted transition-colors"
                >
                  {viewMode === 'json' ? 'Table View' : 'JSON View'}
                </button>
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-border bg-background text-sm font-bold hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4" /> JSON
                </button>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-border bg-background text-sm font-bold hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4" /> CSV
                </button>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold">
              Showing {filteredRows.length} of {rows.length} documents
            </div>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search in results..."
              className="px-3 py-1.5 rounded-lg border-2 border-border bg-background text-sm w-64"
            />
          </div>

          <div className="max-h-[600px] overflow-auto">
            {viewMode === 'table' ? renderTableView() : renderJsonView()}
          </div>
        </div>
      )}

      {!loading && rows.length === 0 && !error && (
        <div className="text-center py-12 text-muted-foreground">
          <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-bold">No Results</p>
          <p className="text-sm">Run a query to see documents from Firestore.</p>
        </div>
      )}
    </div>
  );
}
