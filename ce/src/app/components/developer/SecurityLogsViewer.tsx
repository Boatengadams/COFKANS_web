import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, limit, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ShieldAlert, FileText, AlertTriangle, Lock, UserX, TrendingUp, Filter, Search, RefreshCw, ChevronDown, ChevronRight, Clock, User, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface LogRow { id: string; [k: string]: any; }
interface Stats {
  totalEvents: number;
  failedLogins: number;
  accountLockouts: number;
  successfulAuths: number;
  topFailedIPs: { ip: string; count: number }[];
  eventsByType: { type: string; count: number }[];
  eventsByHour: { hour: string; count: number }[];
}

const SEVERITY_COLORS = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200',
  info: 'text-gray-600 bg-gray-50 border-gray-200',
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function LogList({
  name,
  icon: Icon,
  color,
  onStatsUpdate
}: {
  name: string;
  icon: any;
  color: string;
  onStatsUpdate?: (stats: Partial<Stats>) => void;
}) {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowLimit, setRowLimit] = useState(50);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let q;
      try {
        q = query(collection(db, name), orderBy('createdAt', 'desc'), limit(rowLimit));
      } catch {
        q = query(collection(db, name), limit(rowLimit));
      }
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRows(data);

      // Calculate stats for security events
      if (name === 'securityEvents' && onStatsUpdate) {
        const failedLogins = data.filter(r => r.action === 'failed_login' || r.action === 'failed_auth').length;
        const accountLockouts = data.filter(r => r.action === 'account_locked').length;
        const successfulAuths = data.filter(r => r.action === 'successful_auth' || r.action === 'login_success').length;

        // Count by IP
        const ipCounts: Record<string, number> = {};
        data.forEach(r => {
          if (r.ipAddress && (r.action === 'failed_login' || r.action === 'failed_auth')) {
            ipCounts[r.ipAddress] = (ipCounts[r.ipAddress] || 0) + 1;
          }
        });
        const topFailedIPs = Object.entries(ipCounts)
          .map(([ip, count]) => ({ ip, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Count by type
        const typeCounts: Record<string, number> = {};
        data.forEach(r => {
          const type = r.action || r.type || 'unknown';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        const eventsByType = Object.entries(typeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count);

        // Count by hour (last 24 hours)
        const hourCounts: Record<number, number> = {};
        const now = Date.now();
        data.forEach(r => {
          const timestamp = r.createdAt?.toMillis?.() || r.timestamp?.toMillis?.() || now;
          const hourDiff = Math.floor((now - timestamp) / (1000 * 60 * 60));
          if (hourDiff < 24) {
            hourCounts[hourDiff] = (hourCounts[hourDiff] || 0) + 1;
          }
        });
        const eventsByHour = Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}h ago`,
          count: hourCounts[23 - i] || 0,
        }));

        onStatsUpdate({
          totalEvents: data.length,
          failedLogins,
          accountLockouts,
          successfulAuths,
          topFailedIPs,
          eventsByType,
          eventsByHour,
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [name, rowLimit]);

  const eventTypes = useMemo(() => {
    const types = new Set<string>();
    rows.forEach(r => {
      const type = r.action || r.type || 'unknown';
      types.add(type);
    });
    return Array.from(types).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    let filtered = rows;

    if (filterType !== 'all') {
      filtered = filtered.filter(r => (r.action || r.type) === filterType);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        JSON.stringify(r).toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [rows, filterType, searchTerm]);

  const toggleExpanded = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatTimestamp = (ts: any): string => {
    if (!ts) return 'N/A';
    if (ts instanceof Timestamp) {
      return new Date(ts.toMillis()).toLocaleString();
    }
    if (ts.seconds !== undefined) {
      return new Date(ts.seconds * 1000).toLocaleString();
    }
    return String(ts);
  };

  const getSeverity = (row: LogRow): keyof typeof SEVERITY_COLORS => {
    if (row.severity) return row.severity;
    const action = row.action || row.type || '';
    if (action.includes('failed') || action.includes('locked') || action.includes('blocked')) return 'high';
    if (action.includes('warning')) return 'medium';
    if (action.includes('success')) return 'low';
    return 'info';
  };

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className="font-bold">{name}</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">{filteredRows.length} of {rows.length}</span>
          <select
            value={rowLimit}
            onChange={e => setRowLimit(Number(e.target.value))}
            className="px-2 py-1 text-xs rounded border-2 border-border bg-background"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-1 rounded hover:bg-muted disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border-2 border-border bg-background font-bold"
        >
          <option value="all">All Types</option>
          {eventTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <div className="flex-1 min-w-[200px]">
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search logs..."
            className="w-full px-3 py-1.5 text-xs rounded-lg border-2 border-border bg-background"
          />
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground py-4 text-center">Loading…</div>}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="space-y-1 max-h-96 overflow-auto">
        {filteredRows.map(r => {
          const isExpanded = expandedRows.has(r.id);
          const severity = getSeverity(r);
          const severityClass = SEVERITY_COLORS[severity];

          return (
            <div key={r.id} className={`text-xs rounded-lg border overflow-hidden ${severityClass}`}>
              <button
                onClick={() => toggleExpanded(r.id)}
                className="w-full px-3 py-2 flex items-start gap-2 hover:opacity-80 transition-opacity"
              >
                {isExpanded ? <ChevronDown className="w-3 h-3 mt-0.5 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                <div className="flex-1 text-left space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{r.action || r.type || 'Event'}</span>
                    <span className="text-[10px] opacity-70">{r.id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] opacity-70 flex-wrap">
                    {(r.createdAt || r.timestamp) && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(r.createdAt || r.timestamp)}
                      </span>
                    )}
                    {r.email && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {r.email}
                      </span>
                    )}
                    {r.ipAddress && (
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {r.ipAddress}
                      </span>
                    )}
                  </div>
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 pb-2 pt-1 bg-white/50">
                  <pre className="font-mono text-[10px] whitespace-pre-wrap break-all opacity-70">
                    {JSON.stringify(r, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
        {!loading && filteredRows.length === 0 && !error && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            {searchTerm || filterType !== 'all' ? 'No matching entries.' : 'No entries.'}
          </div>
        )}
      </div>
    </div>
  );
}

export function SecurityLogsViewer() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    failedLogins: 0,
    accountLockouts: 0,
    successfulAuths: 0,
    topFailedIPs: [],
    eventsByType: [],
    eventsByHour: [],
  });

  const handleStatsUpdate = (newStats: Partial<Stats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const successRate = stats.totalEvents > 0
    ? ((stats.successfulAuths / (stats.successfulAuths + stats.failedLogins)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" /> Security &amp; Audit Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">Real-time security monitoring, authentication analytics, and audit trails.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-muted-foreground">Total Events</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-muted-foreground">Failed Logins</span>
          </div>
          <div className="text-2xl font-bold text-red-500">{stats.failedLogins}</div>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-muted-foreground">Account Lockouts</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">{stats.accountLockouts}</div>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-muted-foreground">Auth Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-green-500">{successRate}%</div>
        </div>
      </div>

      {/* Charts */}
      {stats.eventsByType.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border-2 border-border rounded-2xl p-4">
            <h3 className="font-bold mb-3">Events by Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.eventsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border-2 border-border rounded-2xl p-4">
            <h3 className="font-bold mb-3">Events Timeline (24h)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.eventsByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Failed IPs */}
      {stats.topFailedIPs.length > 0 && (
        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <UserX className="w-4 h-4 text-red-500" />
            Top Failed Login IP Addresses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {stats.topFailedIPs.map((item, idx) => (
              <div key={item.ip} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-xs text-red-600 font-bold mb-1">#{idx + 1}</div>
                <div className="font-mono text-sm font-bold truncate" title={item.ip}>{item.ip}</div>
                <div className="text-xs text-muted-foreground">{item.count} attempts</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LogList
          name="securityEvents"
          icon={ShieldAlert}
          color="text-red-500"
          onStatsUpdate={handleStatsUpdate}
        />
        <LogList
          name="auditLogs"
          icon={FileText}
          color="text-blue-500"
        />
      </div>
    </div>
  );
}
