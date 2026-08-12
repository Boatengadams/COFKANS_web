/**
 * Error boundary for the in-place staff portal overlay.
 *
 * Without this, any render error inside the branch workspace propagates to the
 * root and unmounts the WHOLE app (blank preview) — including the storefront
 * rendered as a sibling. This isolates portal failures and shows the message.
 */
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Called when the user dismisses the error (e.g. to exit the portal). */
  onDismiss?: () => void;
}
interface State {
  error: Error | null;
}

export class PortalErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // Surface for debugging without crashing the app.
    console.error('[StaffPortal] render error:', error, info);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full rounded-2xl border-2 border-border bg-card p-6 space-y-3">
            <h2>Portal failed to load</h2>
            <p className="text-sm text-muted-foreground break-words">{error.message}</p>
            <button
              onClick={() => {
                this.setState({ error: null });
                this.props.onDismiss?.();
              }}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Back
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default PortalErrorBoundary;
