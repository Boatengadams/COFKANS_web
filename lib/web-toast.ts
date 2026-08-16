/**
 * Tiny web-only toast used by the portal `.web.tsx` screens.
 * Keeps the unified web/mobile portals free of native-only `Alert` calls.
 */
import { createRoot } from 'react-dom/client';

let host: HTMLElement | null = null;

function ensureHost(): HTMLElement {
  if (host) return host;
  host = document.createElement('div');
  host.id = 'cofkans-portal-toast';
  Object.assign(host.style, {
    position: 'fixed',
    right: '16px',
    bottom: '16px',
    zIndex: '9999',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '320px',
  } as CSSStyleDeclaration);
  document.body.appendChild(host);
  return host;
}

export function portalToast(title: string, body?: string) {
  try {
    const root = ensureHost();
    const node = document.createElement('div');
    Object.assign(node.style, {
      background: '#111A2E',
      color: '#F8FAFC',
      border: '1px solid #243049',
      borderRadius: '14px',
      padding: '12px 14px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      fontSize: '13px',
    } as CSSStyleDeclaration);

    const titleNode = document.createElement('div');
    titleNode.style.fontWeight = '800';
    titleNode.textContent = title;
    node.appendChild(titleNode);

    if (body) {
      const bodyNode = document.createElement('div');
      bodyNode.style.color = '#94A3B8';
      bodyNode.style.marginTop = '2px';
      bodyNode.textContent = body;
      node.appendChild(bodyNode);
    }

    root.appendChild(node);
    setTimeout(() => {
      node.style.transition = 'opacity .3s';
      node.style.opacity = '0';
      setTimeout(() => node.remove(), 300);
    }, 3200);
  } catch {
    /* no-op on non-DOM environments (native) */
  }
}
