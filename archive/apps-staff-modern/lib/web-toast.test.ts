import { afterEach, describe, expect, it, vi } from 'vitest';
import { portalToast } from './web-toast';

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

describe('portalToast', () => {
  it('renders title and body as text instead of trusted HTML', () => {
    vi.useFakeTimers();

    portalToast('<img src=x onerror=alert(1)>', '<script>alert(1)</script>');

    const host = document.querySelector('#cofkans-portal-toast');
    expect(host).toBeInTheDocument();
    expect(host?.querySelector('img')).toBeNull();
    expect(host?.querySelector('script')).toBeNull();
    expect(host).toHaveTextContent('<img src=x onerror=alert(1)>');
    expect(host).toHaveTextContent('<script>alert(1)</script>');
  });
});
