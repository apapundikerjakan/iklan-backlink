'use client';
import { useState } from 'react';

// Slot iklan sitewide: Social Bar (otomatis pojok kanan oleh vendor),
// Interstitial, dan sticky box pojok kanan bawah dengan tombol tutup.
export default function SiteAds({ settings }) {
  const [stickyOpen, setStickyOpen] = useState(true);
  const s = settings || {};
  return (
    <>
      {s.socialBar ? <div dangerouslySetInnerHTML={{ __html: s.socialBar }} /> : null}
      {s.interstitial ? <div dangerouslySetInnerHTML={{ __html: s.interstitial }} /> : null}
      {s.stickyAd && stickyOpen ? (
        <div className="sticky-ad" role="complementary" aria-label="Sponsored">
          <button className="sticky-ad-close" onClick={() => setStickyOpen(false)} aria-label="Tutup iklan">
            ✕
          </button>
          <div dangerouslySetInnerHTML={{ __html: s.stickyAd }} />
        </div>
      ) : null}
    </>
  );
}
