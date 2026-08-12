import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { Cpu, Globe, Key, User, Activity, CheckCircle2, XCircle, AlertCircle, Monitor, Package, Database, Wifi, HardDrive, Clock } from 'lucide-react';
import { db, storage, auth } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { ref, listAll } from 'firebase/storage';

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <div className="w-48 text-xs uppercase tracking-wider text-muted-foreground shrink-0">{label}</div>
      <div className="text-sm font-mono break-all">{String(value ?? '—')}</div>
    </div>
  );
}

interface HealthStatus {
  firestore: 'checking' | 'connected' | 'error';
  storage: 'checking' | 'connected' | 'error';
  auth: 'checking' | 'connected' | 'error';
  network: 'online' | 'offline';
}

interface SystemInfo {
  memoryUsage?: number;
  cpuCores?: number;
  platform: string;
  language: string;
  cookiesEnabled: boolean;
  localStorageAvailable: boolean;
  sessionStorageAvailable: boolean;
  screenResolution: string;
  viewport: string;
  colorDepth: number;
  pixelRatio: number;
  timezone: string;
}

export function EnvironmentInfo() {
  const { user } = useFirebaseAuth();
  const env = import.meta.env;
  const mask = (v: any) => (v ? `${String(v).slice(0, 6)}…${String(v).slice(-4)}` : '—');

  const [health, setHealth] = useState<HealthStatus>({
    firestore: 'checking',
    storage: 'checking',
    auth: 'checking',
    network: navigator.onLine ? 'online' : 'offline',
  });

  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    platform: navigator.platform,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    localStorageAvailable: false,
    sessionStorageAvailable: false,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<{
    loadTime?: number;
    domReady?: number;
    firstPaint?: number;
  }>({});

  useEffect(() => {
    // Check localStorage
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      setSystemInfo(prev => ({ ...prev, localStorageAvailable: true }));
    } catch {
      setSystemInfo(prev => ({ ...prev, localStorageAvailable: false }));
    }

    // Check sessionStorage
    try {
      const test = '__test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      setSystemInfo(prev => ({ ...prev, sessionStorageAvailable: true }));
    } catch {
      setSystemInfo(prev => ({ ...prev, sessionStorageAvailable: false }));
    }

    // Performance metrics
    if (performance && performance.timing) {
      const timing = performance.timing;
      setPerformanceMetrics({
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: timing.responseStart - timing.navigationStart,
      });
    }

    // Memory info (Chrome only)
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      setSystemInfo(prev => ({ ...prev, memoryUsage: usedMB }));
    }

    // CPU cores
    if (navigator.hardwareConcurrency) {
      setSystemInfo(prev => ({ ...prev, cpuCores: navigator.hardwareConcurrency }));
    }

    // Network status listener
    const handleOnline = () => setHealth(prev => ({ ...prev, network: 'online' }));
    const handleOffline = () => setHealth(prev => ({ ...prev, network: 'offline' }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Test Firestore
    const testFirestore = async () => {
      try {
        await getDocs(query(collection(db, 'users'), limit(1)));
        setHealth(prev => ({ ...prev, firestore: 'connected' }));
      } catch {
        setHealth(prev => ({ ...prev, firestore: 'error' }));
      }
    };

    // Test Storage
    const testStorage = async () => {
      try {
        await listAll(ref(storage, 'products'));
        setHealth(prev => ({ ...prev, storage: 'connected' }));
      } catch {
        setHealth(prev => ({ ...prev, storage: 'error' }));
      }
    };

    // Test Auth
    const testAuth = () => {
      try {
        const currentUser = auth.currentUser;
        setHealth(prev => ({ ...prev, auth: currentUser ? 'connected' : 'error' }));
      } catch {
        setHealth(prev => ({ ...prev, auth: 'error' }));
      }
    };

    testFirestore();
    testStorage();
    testAuth();
  }, []);

  const StatusBadge = ({ status }: { status: 'checking' | 'connected' | 'error' | 'online' | 'offline' }) => {
    if (status === 'checking') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-600 text-xs font-bold">
          <AlertCircle className="w-3 h-3" /> Checking
        </span>
      );
    }
    if (status === 'connected' || status === 'online') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-200 text-green-600 text-xs font-bold">
          <CheckCircle2 className="w-3 h-3" /> Connected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
        <XCircle className="w-3 h-3" /> Error
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" /> Environment & System Diagnostics
        </h2>
        <p className="text-sm text-muted-foreground">Runtime environment, Firebase connectivity, and system health monitoring.</p>
      </div>

      {/* Health Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-muted-foreground">Firestore</span>
          </div>
          <StatusBadge status={health.firestore} />
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold text-muted-foreground">Storage</span>
          </div>
          <StatusBadge status={health.storage} />
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-muted-foreground">Authentication</span>
          </div>
          <StatusBadge status={health.auth} />
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-muted-foreground">Network</span>
          </div>
          <StatusBadge status={health.network} />
        </div>
      </div>

      {/* Performance Metrics */}
      {(performanceMetrics.loadTime || systemInfo.memoryUsage) && (
        <div className="bg-card border-2 border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-bold">Performance Metrics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {performanceMetrics.loadTime && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Page Load Time</div>
                <div className="text-2xl font-bold">{(performanceMetrics.loadTime / 1000).toFixed(2)}s</div>
              </div>
            )}
            {performanceMetrics.domReady && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">DOM Ready</div>
                <div className="text-2xl font-bold">{(performanceMetrics.domReady / 1000).toFixed(2)}s</div>
              </div>
            )}
            {systemInfo.memoryUsage && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">JS Heap Used</div>
                <div className="text-2xl font-bold">{systemInfo.memoryUsage}MB</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="bg-card border-2 border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="w-4 h-4 text-primary" />
          <h3 className="font-bold">Browser & System</h3>
        </div>
        <Row label="Platform" value={systemInfo.platform} />
        <Row label="Language" value={systemInfo.language} />
        <Row label="Timezone" value={systemInfo.timezone} />
        <Row label="User Agent" value={navigator.userAgent} />
        <Row label="Screen Resolution" value={systemInfo.screenResolution} />
        <Row label="Viewport" value={systemInfo.viewport} />
        <Row label="Color Depth" value={`${systemInfo.colorDepth}-bit`} />
        <Row label="Pixel Ratio" value={systemInfo.pixelRatio} />
        {systemInfo.cpuCores && <Row label="CPU Cores" value={systemInfo.cpuCores} />}
        <Row label="Cookies Enabled" value={systemInfo.cookiesEnabled ? 'Yes' : 'No'} />
        <Row label="LocalStorage" value={systemInfo.localStorageAvailable ? 'Available' : 'Blocked'} />
        <Row label="SessionStorage" value={systemInfo.sessionStorageAvailable ? 'Available' : 'Blocked'} />
      </div>

      {/* Developer Info */}
      <div className="bg-card border-2 border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-primary" />
          <h3 className="font-bold">Authenticated Developer</h3>
        </div>
        <Row label="UID" value={user?.uid} />
        <Row label="Email" value={user?.email} />
        <Row label="Display Name" value={user?.displayName} />
        <Row label="Role" value={user?.role} />
        <Row label="Developer Flag" value={(user as any)?.isDeveloper ? 'true' : 'false'} />
      </div>

      {/* Build Info */}
      <div className="bg-card border-2 border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="font-bold">Build & Runtime</h3>
        </div>
        <Row label="Mode" value={env.MODE} />
        <Row label="Environment" value={env.VITE_ENV || 'production'} />
        <Row label="Origin" value={window.location.origin} />
        <Row label="Hostname" value={window.location.hostname} />
        <Row label="Protocol" value={window.location.protocol} />
        <Row label="Current Time" value={new Date().toISOString()} />
      </div>

      {/* Package Versions */}
      <div className="bg-card border-2 border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-primary" />
          <h3 className="font-bold">Dependencies</h3>
        </div>
        <Row label="React" value="18.3.1" />
        <Row label="Firebase" value="11.1.0" />
        <Row label="React Router" value="7.15.1" />
        <Row label="Tailwind CSS" value="4.0.0" />
        <Row label="Motion" value="Latest" />
        <Row label="Recharts" value="Latest" />
      </div>

      {/* Firebase Config */}
      <div className="bg-card border-2 border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-primary" />
          <h3 className="font-bold">Firebase Configuration (Masked)</h3>
        </div>
        <Row label="Project ID" value={env.VITE_FIREBASE_PROJECT_ID} />
        <Row label="Auth Domain" value={env.VITE_FIREBASE_AUTH_DOMAIN} />
        <Row label="Storage Bucket" value={env.VITE_FIREBASE_STORAGE_BUCKET} />
        <Row label="API Key" value={mask(env.VITE_FIREBASE_API_KEY)} />
        <Row label="App ID" value={env.VITE_FIREBASE_APP_ID} />
        <Row label="App Check Site Key" value={mask(env.VITE_FIREBASE_APPCHECK_SITE_KEY)} />
        <Row label="Developer Email" value={env.VITE_DEVELOPER_EMAIL} />
      </div>
    </div>
  );
}
