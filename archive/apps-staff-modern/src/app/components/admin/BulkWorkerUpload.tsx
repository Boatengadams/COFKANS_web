import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X, Loader } from 'lucide-react';
import { createWorkerAccount, generateTempPassword } from '@/lib/create-worker';
import toast from 'react-hot-toast';

interface BulkWorkerUploadProps {
  creatorUserId: string;
  onComplete: () => void;
  onClose: () => void;
}

interface WorkerRow {
  username: string;
  displayName: string;
  role: 'manager' | 'technician' | 'driver';
  password?: string;
}

interface ProcessedWorker extends WorkerRow {
  email?: string;
  password: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export function BulkWorkerUpload({ creatorUserId, onComplete, onClose }: BulkWorkerUploadProps) {
  const [workers, setWorkers] = useState<ProcessedWorker[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csv = `username,displayName,role\nkwame,Kwame Mensah,technician\nakua,Akua Asante,driver\nkofi,Kofi Owusu,manager`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'worker-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());

        if (lines.length < 2) {
          toast.error('CSV file must contain at least one worker');
          return;
        }

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const requiredHeaders = ['username', 'displayname', 'role'];
        const hasAllHeaders = requiredHeaders.every(h => headers.includes(h));

        if (!hasAllHeaders) {
          toast.error('CSV must have columns: username, displayName, role');
          return;
        }

        const usernameIdx = headers.indexOf('username');
        const displayNameIdx = headers.indexOf('displayname');
        const roleIdx = headers.indexOf('role');
        const passwordIdx = headers.indexOf('password');

        const parsedWorkers: ProcessedWorker[] = lines.slice(1).map((line, idx) => {
          const cols = line.split(',').map(c => c.trim());
          const role = cols[roleIdx]?.toLowerCase();

          if (!['manager', 'technician', 'driver'].includes(role)) {
            throw new Error(`Invalid role "${role}" at row ${idx + 2}`);
          }

          return {
            username: cols[usernameIdx] || '',
            displayName: cols[displayNameIdx] || '',
            role: role as 'manager' | 'technician' | 'driver',
            password: passwordIdx >= 0 && cols[passwordIdx] ? cols[passwordIdx] : generateTempPassword(),
            status: 'pending' as const,
          };
        });

        if (parsedWorkers.length === 0) {
          toast.error('No valid workers found in CSV');
          return;
        }

        if (parsedWorkers.length > 50) {
          toast.error('Maximum 50 workers per batch');
          return;
        }

        setWorkers(parsedWorkers);
        setCurrentStep('preview');
        toast.success(`${parsedWorkers.length} workers loaded`);
      } catch (err: any) {
        console.error('CSV parse error:', err);
        toast.error(err.message || 'Failed to parse CSV file');
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processWorkers = async () => {
    setProcessing(true);
    const updatedWorkers = [...workers];

    for (let i = 0; i < updatedWorkers.length; i++) {
      const worker = updatedWorkers[i];

      try {
        const result = await createWorkerAccount({
          creatorUserId,
          username: worker.username,
          displayName: worker.displayName,
          role: worker.role,
          password: worker.password,
        });

        if (result.success && result.email) {
          updatedWorkers[i] = {
            ...worker,
            email: result.email,
            password: result.password || worker.password,
            status: 'success',
          };
        } else {
          updatedWorkers[i] = {
            ...worker,
            status: 'error',
            error: result.error || 'Unknown error',
          };
        }
      } catch (err: any) {
        updatedWorkers[i] = {
          ...worker,
          status: 'error',
          error: err.message || 'Failed to create account',
        };
      }

      setWorkers([...updatedWorkers]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successCount = updatedWorkers.filter(w => w.status === 'success').length;
    const errorCount = updatedWorkers.filter(w => w.status === 'error').length;

    if (successCount > 0) {
      toast.success(`${successCount} worker(s) created successfully`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} worker(s) failed`);
    }

    setProcessing(false);
    setCurrentStep('complete');
    onComplete();
  };

  const downloadCredentials = () => {
    const successWorkers = workers.filter(w => w.status === 'success');
    if (successWorkers.length === 0) {
      toast.error('No successful workers to download');
      return;
    }

    const csv = [
      'Email,Password,Display Name,Role',
      ...successWorkers.map(w => `${w.email},${w.password},${w.displayName},${w.role}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worker-credentials-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Credentials downloaded');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border-2 border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Bulk Worker Upload</h2>
              <p className="text-sm text-muted-foreground">Create multiple worker accounts at once</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {['Upload', 'Preview', 'Complete'].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    currentStep === step.toLowerCase()
                      ? 'bg-primary text-white'
                      : idx < ['upload', 'preview', 'complete'].indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === step.toLowerCase() ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step}
                </span>
                {idx < 2 && <div className="w-12 h-0.5 bg-border mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'upload' && (
            <div className="space-y-6">
              {/* Download Template */}
              <div className="bg-blue-500/10 border-2 border-blue-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">CSV Template</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                      Download our template to get started. Fill in the username, display name, and role for each worker.
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary rounded-xl p-12 text-center cursor-pointer transition-colors group"
              >
                <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary mx-auto mb-4 transition-colors" />
                <h3 className="text-lg font-bold mb-2">Upload CSV File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click to browse or drag and drop your CSV file here
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum 50 workers per batch
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Instructions */}
              <div className="bg-muted/50 border border-border rounded-xl p-4">
                <h4 className="font-bold mb-2 text-sm">CSV Format</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Required columns: username, displayName, role</li>
                  <li>• Optional column: password (auto-generated if empty)</li>
                  <li>• Valid roles: admin, technician, driver</li>
                  <li>• Username will get @cofkanselectricals.com domain</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Review {workers.length} worker(s) before creating accounts
                </p>
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Back to Upload
                </button>
              </div>

              <div className="border-2 border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Username</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Display Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Password</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {workers.map((worker, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm font-mono">{worker.username}</td>
                          <td className="px-4 py-3 text-sm">{worker.displayName}</td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold">
                              {worker.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">{worker.password.substring(0, 8)}...</td>
                          <td className="px-4 py-3">
                            {worker.status === 'pending' && (
                              <span className="text-xs text-muted-foreground">Pending</span>
                            )}
                            {worker.status === 'success' && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {worker.status === 'error' && (
                              <AlertCircle className="w-4 h-4 text-red-600" title={worker.error} />
                            )}
                            {processing && worker.status === 'pending' && (
                              <Loader className="w-4 h-4 text-primary animate-spin" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="px-4 py-2 border-2 border-border rounded-lg font-bold hover:bg-muted transition-colors"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={processWorkers}
                  disabled={processing}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating Workers...
                    </>
                  ) : (
                    `Create ${workers.length} Worker(s)`
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="space-y-6">
              <div className="bg-green-500/10 border-2 border-green-500/20 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Bulk Upload Complete</h3>
                <p className="text-sm text-muted-foreground">
                  {workers.filter(w => w.status === 'success').length} out of {workers.length} worker(s) created successfully
                </p>
              </div>

              {/* Results Table */}
              <div className="border-2 border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Display Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {workers.map((worker, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm font-mono">{worker.email || `${worker.username}@...`}</td>
                          <td className="px-4 py-3 text-sm">{worker.displayName}</td>
                          <td className="px-4 py-3">
                            {worker.status === 'success' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs font-bold">
                                <CheckCircle className="w-3 h-3" />
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded text-xs font-bold">
                                <AlertCircle className="w-3 h-3" />
                                {worker.error || 'Failed'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadCredentials}
                  disabled={workers.filter(w => w.status === 'success').length === 0}
                  className="flex-1 px-6 py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Credentials
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-border rounded-xl font-bold hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-800 dark:text-orange-300">
                    <strong>Important:</strong> Download and securely store the credentials file. Passwords cannot be recovered later.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
