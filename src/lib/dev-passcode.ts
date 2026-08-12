/**
 * Developer-portal passcode gate.
 *
 * Trust model: every mutating action in the developer portal MUST be
 * preceded by `requireDevPasscode(label)`. No session caching — each call
 * shows a modal and resolves true only when the developer enters the
 * passcode baked in at build time via VITE_DEV_PASSCODE.
 *
 * This is a client-side gate. The Firebase custom claim + Firestore
 * rules remain the actual authorisation boundary. The passcode is a
 * second factor against shoulder-surfing / unlocked dev laptops, not a
 * replacement for backend enforcement.
 */

const env = (process.env as any) || {};
const DEV_PASSCODE = (env.VITE_DEV_PASSCODE as string | undefined) ?? '';

export function isDevPasscodeConfigured(): boolean {
  return DEV_PASSCODE.length >= 4;
}

/** Constant-time string compare (cosmetic for client-side, but cheap). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

type Resolver = (ok: boolean) => void;

interface PromptRequest {
  label: string;
  resolve: Resolver;
}

type Subscriber = (req: PromptRequest | null) => void;

let activeRequest: PromptRequest | null = null;
let queue: PromptRequest[] = [];
const subscribers = new Set<Subscriber>();

function emit() {
  subscribers.forEach((s) => s(activeRequest));
}

function pumpQueue() {
  if (activeRequest || queue.length === 0) return;
  activeRequest = queue.shift() ?? null;
  emit();
}

/**
 * Ask the user for the passcode and resolve true on success, false on
 * cancel. The returned promise NEVER rejects.
 */
export function requireDevPasscode(label: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isDevPasscodeConfigured()) {
      // Misconfiguration: refuse the action outright rather than silently
      // bypassing the gate. Surfaced via a one-time console warning so a
      // dev can fix the env.
      const msg =
        'Developer passcode is not configured. Set VITE_DEV_PASSCODE in ' +
        'GitHub Secrets and redeploy. Action refused: ' + label;
      console.error('[dev-passcode]', msg);
      // Toast loudly so the dev sees the problem instead of a dead click.
      // Imported lazily to avoid pulling react-hot-toast into bundles that
      // never need it.
      import('react-hot-toast')
        .then(({ default: toast }) => toast.error(msg, { duration: 7000 }))
        .catch(() => {});
      resolve(false);
      return;
    }
    queue.push({ label, resolve });
    pumpQueue();
  });
}

/** Internal — called by the modal when the developer submits the form. */
export function _submitDevPasscode(input: string): boolean {
  if (!activeRequest) return false;
  const ok = safeEqual(input, DEV_PASSCODE);
  const req = activeRequest;
  activeRequest = null;
  req.resolve(ok);
  pumpQueue();
  return ok;
}

/** Internal — called by the modal when the developer cancels. */
export function _cancelDevPasscode(): void {
  if (!activeRequest) return;
  const req = activeRequest;
  activeRequest = null;
  req.resolve(false);
  pumpQueue();
}

export function subscribeDevPasscode(s: Subscriber): () => void {
  subscribers.add(s);
  s(activeRequest);
  return () => { subscribers.delete(s); };
}
