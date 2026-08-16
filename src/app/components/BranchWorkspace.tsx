import { Database } from 'lucide-react';

/**
 * Staff workspace shell. The former branch module seeded local mock records
 * when a live backend record was missing; showing an honest empty state keeps
 * staff from acting on fabricated sales, stock, staff, or branch statistics.
 */
export function BranchWorkspace({ initialEntry: _initialEntry }: { initialEntry: string }) {
  return (
    <div className="erp-theme flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <Database className="h-7 w-7 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Staff workspace ready</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Live branch data is not connected yet. Once the account is linked, sales, inventory, transfers, and reports will appear here.
        </p>
      </div>
    </div>
  );
}

export default BranchWorkspace;
