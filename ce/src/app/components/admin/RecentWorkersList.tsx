import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { getRecentWorkers, formatTimeAgo, type RecentWorker } from '@/lib/worker-tracking-service';
import toast from 'react-hot-toast';

interface RecentWorkersListProps {
  creatorUserId: string;
}

const ROLE_COLORS = {
  admin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  technician: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  driver: 'bg-green-500/10 text-green-600 dark:text-green-400',
};

export function RecentWorkersList({ creatorUserId }: RecentWorkersListProps) {
  const [workers, setWorkers] = useState<RecentWorker[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const recentWorkers = await getRecentWorkers(creatorUserId);
      setWorkers(recentWorkers);
    } catch (error) {
      console.error('Failed to load recent workers:', error);
      toast.error('Failed to load recent workers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, [creatorUserId]);

  const downloadWorkersList = () => {
    if (workers.length === 0) {
      toast.error('No workers to download');
      return;
    }

    const csv = [
      'Email,Display Name,Role,Created,Status',
      ...workers.map(w =>
        `${w.email},${w.displayName},${w.role},${w.createdAt.toISOString()},${w.mustChangePassword ? 'Pending First Login' : 'Active'}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recent-workers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workers list downloaded');
  };

  if (loading) {
    return (
      <div className="bg-card border-2 border-border rounded-2xl p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading recent workers...</p>
        </div>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="bg-card border-2 border-border rounded-2xl p-8">
        <div className="text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No Recent Workers</h3>
          <p className="text-sm text-muted-foreground">
            Workers you create will appear here for easy tracking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Recent Workers</h3>
            <p className="text-xs text-muted-foreground">
              {workers.length} worker{workers.length !== 1 ? 's' : ''} created in last 30 days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadWorkers}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={downloadWorkersList}
            className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Workers List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {workers.map((worker, idx) => (
          <motion.div
            key={worker.uid}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-background border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold truncate">{worker.displayName}</h4>
                  {worker.mustChangePassword ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded text-xs font-bold flex-shrink-0">
                      <AlertCircle className="w-3 h-3" />
                      Pending First Login
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs font-bold flex-shrink-0">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate mb-2">{worker.email}</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${ROLE_COLORS[worker.role]}`}>
                    {worker.role.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(worker.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Workers marked as "Pending First Login" haven't changed their temporary password yet.
          Once they log in and set a new password, their status will change to "Active".
        </p>
      </div>
    </div>
  );
}
