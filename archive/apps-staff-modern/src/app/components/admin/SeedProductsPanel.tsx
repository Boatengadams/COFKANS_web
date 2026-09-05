import { useState } from 'react';
import { collection, doc, setDoc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { products } from '../../data/products-full';
import { Upload, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type Status = 'idle' | 'clearing' | 'seeding' | 'done' | 'error';

export function SeedProductsPanel() {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState('');

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  async function clearExisting() {
    const snap = await getDocs(collection(db, 'products'));
    const batches: ReturnType<typeof writeBatch>[] = [];
    let batch = writeBatch(db);
    let count = 0;
    for (const d of snap.docs) {
      batch.delete(d.ref);
      count++;
      if (count % 400 === 0) { batches.push(batch); batch = writeBatch(db); }
    }
    if (count % 400 !== 0) batches.push(batch);
    for (const b of batches) await b.commit();
    return snap.size;
  }

  async function seedProducts() {
    // Only write price + stock to Firestore.
    // All other product data (name, image, category) lives in the codebase.
    const BATCH_SIZE = 400;
    let done = 0;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const chunk = products.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      for (const p of chunk) {
        const ref = doc(collection(db, 'products'), p.id);
        batch.set(ref, {
          sku: p.sku,
          price: p.price,
          stock: p.stock,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
      await batch.commit();
      done += chunk.length;
      setProgress(Math.round((done / products.length) * 100));
      addLog(`Seeded ${done}/${products.length} price+stock records…`);
    }
  }

  async function handleSeed() {
    try {
      setLog([]);
      setError('');
      setProgress(0);

      setStatus('clearing');
      addLog('Clearing existing products from Firestore…');
      const cleared = await clearExisting();
      addLog(`Cleared ${cleared} existing product(s).`);

      setStatus('seeding');
      addLog(`Seeding ${products.length} products…`);
      await seedProducts();

      addLog('✅ All products uploaded successfully!');
      addLog(`• Active: ${products.filter(p => p.category !== 'Uncategorized').length} products`);
      addLog(`• Pending review: ${products.filter(p => p.category === 'Uncategorized').length} products`);
      setStatus('done');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStatus('error');
    }
  }

  const busy = status === 'clearing' || status === 'seeding';

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-lg">Initialise Price & Stock in Firestore</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Writes default price + stock for all {products.length} products to Firestore.
          Product names, images, and categories live in the codebase — only price and
          stock are stored in Firebase and can be edited from the Pricing tab.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Total Products', value: products.length },
          { label: 'Active', value: products.filter(p => p.category !== 'Uncategorized').length },
          { label: 'Pending Review', value: products.filter(p => p.category === 'Uncategorized').length },
        ].map(s => (
          <div key={s.label} className="bg-muted/50 rounded-xl p-3">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {busy && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {status === 'clearing' ? 'Clearing…' : 'Uploading…'}
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="bg-muted/40 rounded-xl p-3 max-h-40 overflow-y-auto space-y-0.5">
          {log.map((l, i) => (
            <div key={i} className="text-xs font-mono text-muted-foreground">{l}</div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {status === 'done' && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Products live in Firestore. Refresh the store to see them.</span>
        </div>
      )}

      <button
        onClick={handleSeed}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> {status === 'clearing' ? 'Clearing…' : 'Uploading…'}</>
        ) : (
          <><Upload className="w-4 h-4" /> Upload {products.length} Products to Firestore</>
        )}
      </button>
    </div>
  );
}
