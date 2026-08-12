import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Trash2,
  RefreshCw,
  Play,
  Settings,
  ChevronDown,
  ChevronRight,
  Info,
  AlertTriangle,
  FileText,
  Eye,
} from 'lucide-react';
import { runFullMigration } from '../../../scripts/migrate-products';
import { fullProductCatalog } from '../../data/products-full';
import { collection, getDocs, deleteDoc, doc, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

type MigrationMode = 'full' | 'selective' | 'dry-run';
type MigrationOption = 'overwrite' | 'skip' | 'merge';

interface MigrationLog {
  timestamp: number;
  mode: string;
  total: number;
  migrated: number;
  failed: number;
  duration: number;
}

export function ProductMigrationPanel() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0, productName: '' });
  const [result, setResult] = useState<{ migrated: number; total: number; failed?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentProductCount, setCurrentProductCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [migrationMode, setMigrationMode] = useState<MigrationMode>('full');
  const [duplicateOption, setDuplicateOption] = useState<MigrationOption>('skip');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [migrationLogs, setMigrationLogs] = useState<MigrationLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const categories = Array.from(new Set(fullProductCatalog.map(p => p.category)));

  useEffect(() => {
    fetchCurrentProductCount();
    loadMigrationLogs();
  }, []);

  const fetchCurrentProductCount = async () => {
    setLoadingCount(true);
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      setCurrentProductCount(snapshot.size);
    } catch (err) {
      console.error('Error fetching product count:', err);
      setCurrentProductCount(null);
    } finally {
      setLoadingCount(false);
    }
  };

  const loadMigrationLogs = () => {
    const logsStr = localStorage.getItem('migration_logs');
    if (logsStr) {
      try {
        setMigrationLogs(JSON.parse(logsStr));
      } catch (err) {
        console.error('Error loading migration logs:', err);
      }
    }
  };

  const saveMigrationLog = (log: MigrationLog) => {
    const updatedLogs = [log, ...migrationLogs].slice(0, 10); // Keep last 10
    setMigrationLogs(updatedLogs);
    localStorage.setItem('migration_logs', JSON.stringify(updatedLogs));
  };

  const handleMigration = async (isDryRun: boolean = false) => {
    setStatus('running');
    setProgress({ current: 0, total: 0, productName: '' });
    setResult(null);
    setError(null);

    const startTime = Date.now();

    try {
      if (isDryRun) {
        // Simulate dry run
        const totalProducts = migrationMode === 'selective' && selectedCategories.length > 0
          ? fullProductCatalog.filter(p => selectedCategories.includes(p.category)).length
          : fullProductCatalog.length;

        for (let i = 0; i < totalProducts; i++) {
          await new Promise(resolve => setTimeout(resolve, 10)); // Faster simulation
          setProgress({
            current: i + 1,
            total: totalProducts,
            productName: fullProductCatalog[i]?.name || 'Product',
          });
        }

        setResult({ migrated: totalProducts, total: totalProducts, failed: 0 });
        setStatus('success');
        toast.success(`Dry run complete: ${totalProducts} products would be migrated`);
        return;
      }

      const migrationResult = await runFullMigration((current, total, productName) => {
        setProgress({ current, total, productName });
      });

      const duration = Date.now() - startTime;
      const log: MigrationLog = {
        timestamp: Date.now(),
        mode: migrationMode,
        total: migrationResult.total,
        migrated: migrationResult.migrated,
        failed: 0,
        duration,
      };
      saveMigrationLog(log);

      setResult(migrationResult);
      setStatus('success');
      await fetchCurrentProductCount();
      toast.success(`Migration complete: ${migrationResult.migrated} products migrated`);
    } catch (err) {
      console.error('Migration error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
      toast.error('Migration failed');
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm('⚠️ Are you sure you want to delete ALL products from Firestore? This action cannot be undone!')) {
      return;
    }

    setStatus('running');
    setProgress({ current: 0, total: 0, productName: 'Deleting products...' });

    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const total = snapshot.size;
      let current = 0;

      for (const productDoc of snapshot.docs) {
        await deleteDoc(doc(db, 'products', productDoc.id));
        current++;
        setProgress({ current, total, productName: 'Deleting products...' });
      }

      toast.success(`Deleted ${total} products successfully`);
      await fetchCurrentProductCount();
      setStatus('idle');
    } catch (err) {
      console.error('Error clearing database:', err);
      toast.error('Failed to clear database');
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const handleExportDatabase = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const dataStr = JSON.stringify(products, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products_backup_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${products.length} products`);
    } catch (err) {
      console.error('Error exporting database:', err);
      toast.error('Failed to export database');
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const previewProductCount = migrationMode === 'selective' && selectedCategories.length > 0
    ? fullProductCatalog.filter(p => selectedCategories.includes(p.category)).length
    : fullProductCatalog.length;

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl border-2 border-border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-secondary to-primary p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Database className="w-8 h-8" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Product Migration</h2>
                <p className="text-white/90 text-sm">Advanced product database management</p>
              </div>
            </div>
            {!loadingCount && currentProductCount !== null && (
              <div className="text-right">
                <div className="text-4xl font-bold">{currentProductCount}</div>
                <div className="text-xs text-white/80">Products in DB</div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Database Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-700">Current Database</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {loadingCount ? <Loader2 className="w-6 h-6 animate-spin" /> : currentProductCount || 0}
              </div>
              <div className="text-xs text-blue-600">products</div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-green-700">Available to Migrate</span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {previewProductCount}
              </div>
              <div className="text-xs text-green-600">products</div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-purple-700">Categories</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {categories.length}
              </div>
              <div className="text-xs text-purple-600">categories</div>
            </div>
          </div>

          {/* Migration Mode Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-foreground">Migration Mode</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setMigrationMode('full')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  migrationMode === 'full'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4" />
                  <span className="font-bold text-sm">Full Migration</span>
                </div>
                <p className="text-xs text-muted-foreground">Migrate all {fullProductCatalog.length} products</p>
              </button>

              <button
                onClick={() => setMigrationMode('selective')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  migrationMode === 'selective'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Settings className="w-4 h-4" />
                  <span className="font-bold text-sm">Selective</span>
                </div>
                <p className="text-xs text-muted-foreground">Choose specific categories</p>
              </button>

              <button
                onClick={() => setMigrationMode('dry-run')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  migrationMode === 'dry-run'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="font-bold text-sm">Dry Run</span>
                </div>
                <p className="text-xs text-muted-foreground">Preview without changes</p>
              </button>
            </div>
          </div>

          {/* Selective Category Selection */}
          {migrationMode === 'selective' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/50 border-2 border-border rounded-xl p-4"
            >
              <label className="block text-sm font-bold text-foreground mb-3">Select Categories</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map(category => {
                  const count = fullProductCatalog.filter(p => p.category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCategories.includes(category)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="font-bold text-sm truncate">{category}</div>
                      <div className="text-xs text-muted-foreground">{count} products</div>
                    </button>
                  );
                })}
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Select at least one category to proceed
                </p>
              )}
            </motion.div>
          )}

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors"
            >
              {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Advanced Options
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3"
                >
                  <div className="bg-muted/50 border-2 border-border rounded-xl p-4">
                    <label className="block text-sm font-bold text-foreground mb-2">
                      Duplicate Handling
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['skip', 'overwrite', 'merge'] as MigrationOption[]).map(option => (
                        <button
                          key={option}
                          onClick={() => setDuplicateOption(option)}
                          className={`p-2 rounded-lg border-2 transition-all capitalize ${
                            duplicateOption === option
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <span className="text-xs font-bold">{option}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <Info className="w-3 h-3 inline mr-1" />
                      {duplicateOption === 'skip' && 'Skip products that already exist in database'}
                      {duplicateOption === 'overwrite' && 'Replace existing products with new data'}
                      {duplicateOption === 'merge' && 'Merge new data with existing products'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Display */}
          {status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Progress Bar */}
              {status === 'running' && progress.total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{migrationMode === 'dry-run' ? 'Simulating migration...' : 'Migrating products...'}</span>
                    <span className="font-bold text-foreground">
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  {progress.productName && (
                    <p className="text-xs text-muted-foreground truncate">
                      Current: <span className="text-foreground font-medium">{progress.productName}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Success Message */}
              {status === 'success' && result && (
                <div className="flex items-start gap-4 p-6 bg-green-50 dark:bg-green-950/30 border-2 border-green-500 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div className="flex-1">
                    <h4 className="font-bold text-green-700 dark:text-green-400 mb-1">
                      {migrationMode === 'dry-run' ? 'Dry Run Complete!' : 'Migration Successful!'}
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      {migrationMode === 'dry-run'
                        ? `Would migrate ${result.migrated} out of ${result.total} products`
                        : `Successfully migrated ${result.migrated} out of ${result.total} products to Firestore`
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {status === 'error' && (
                <div className="flex items-start gap-4 p-6 bg-red-50 dark:bg-red-950/30 border-2 border-red-500 rounded-2xl">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <h4 className="font-bold text-red-700 dark:text-red-400 mb-1">Migration Failed</h4>
                    <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: status === 'running' ? 1 : 1.02, y: -2 }}
              whileTap={{ scale: status === 'running' ? 1 : 0.98 }}
              onClick={() => handleMigration(migrationMode === 'dry-run')}
              disabled={status === 'running' || (migrationMode === 'selective' && selectedCategories.length === 0)}
              className={`py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
                status === 'running' || (migrationMode === 'selective' && selectedCategories.length === 0)
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary via-secondary to-primary text-white hover:shadow-lg cursor-pointer'
              }`}
            >
              {status === 'running' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                  <span>{migrationMode === 'dry-run' ? 'Running Simulation...' : 'Migrating...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" strokeWidth={2.5} />
                  <span>
                    {migrationMode === 'dry-run' ? 'Run Simulation' : status === 'success' ? 'Re-run Migration' : 'Start Migration'}
                  </span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fetchCurrentProductCount()}
              disabled={status === 'running'}
              className="py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 border-2 border-border hover:border-primary transition-all disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5" strokeWidth={2.5} />
              <span>Refresh Count</span>
            </motion.button>
          </div>

          {/* Utility Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t-2 border-border">
            <button
              onClick={handleExportDatabase}
              disabled={status === 'running'}
              className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export Backup
            </button>

            <button
              onClick={() => setShowLogs(!showLogs)}
              className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-purple-500 text-white hover:bg-purple-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Migration Logs ({migrationLogs.length})
            </button>

            <button
              onClick={handleClearDatabase}
              disabled={status === 'running'}
              className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Clear Database
            </button>
          </div>

          {/* Migration Logs */}
          <AnimatePresence>
            {showLogs && migrationLogs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-muted/50 border-2 border-border rounded-xl p-4 max-h-64 overflow-y-auto"
              >
                <h3 className="font-bold text-sm mb-3">Recent Migration History</h3>
                <div className="space-y-2">
                  {migrationLogs.map((log, idx) => (
                    <div key={idx} className="bg-card rounded-lg p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold capitalize">
                          {log.mode}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Migrated {log.migrated}/{log.total} products
                        {log.failed > 0 && ` (${log.failed} failed)`}
                        {' · '}Duration: {(log.duration / 1000).toFixed(1)}s
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Warning */}
          {status === 'idle' && migrationMode !== 'dry-run' && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  <p className="font-bold">⚠️ Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>This will upload products to your Firebase Firestore database</li>
                    <li>Duplicate handling: <strong>{duplicateOption}</strong></li>
                    <li>Make sure you're ready to modify your production database</li>
                    <li>Consider running a dry-run first to preview changes</li>
                    <li>Export a backup before proceeding if you have existing data</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
