import { useEffect, useState, type ReactNode } from 'react';

const logo = '/images/brand/cofkans.png';

const MINIMUM_DISPLAY_TIME = 900;
const FADE_DURATION = 320;

export default function CustomerSplash({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFading(true), MINIMUM_DISPLAY_TIME);
    const hideTimer = window.setTimeout(
      () => setVisible(false),
      MINIMUM_DISPLAY_TIME + FADE_DURATION,
    );

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {children}
      {visible && (
        <div
          className={`customer-splash${fading ? ' customer-splash--fading' : ''}`}
          role="status"
          aria-label="Loading Cofkans Electricals"
        >
          <div className="customer-splash__glow" />
          <div className="customer-splash__content">
            <img
              src={logo}
              alt="Cofkans Electricals"
              className="customer-splash__logo"
              width={220}
              height={88}
            />
            <div className="customer-splash__loader" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p>Powering better spaces</p>
          </div>
        </div>
      )}
    </>
  );
}
