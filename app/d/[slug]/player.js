'use client';
import { useEffect, useState } from 'react';

function firePopunder(url) {
  try {
    const w = window.open(url, '_blank', 'noopener,width=1280,height=800');
    if (w) {
      try { w.blur(); } catch {}
    }
  } catch {}
  try { window.focus(); } catch {}
}

export default function VideoPlayer({ video, settings }) {
  const [unlocked, setUnlocked] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [adFired, setAdFired] = useState(false);
  const [count, setCount] = useState(0);

  const directLink = (settings?.directLink || '').trim();
  const mode = settings?.directLinkMode || 'modal'; // modal | popunder | tab
  const delay = Math.max(0, Number(settings?.popupDelay ?? 5));

  useEffect(() => {
    if (!showAd) return;
    setCount(delay);
    if (delay <= 0) return;
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [showAd, delay]);

  function handleClick() {
    if (!directLink) {
      setUnlocked(true);
      return;
    }
    if (mode === 'modal') {
      // Iklan DI DALAM halaman: tampilkan modal overlay berisi iklan
      if (!adFired) {
        setAdFired(true);
        setShowAd(true);
        return;
      }
      setUnlocked(true);
      return;
    }
    if (mode === 'tab') {
      if (!adFired) {
        setAdFired(true);
        try { window.open(directLink, '_blank', 'noopener,noreferrer'); } catch {}
        return;
      }
      setUnlocked(true);
      return;
    }
    // popunder: iklan di belakang, video langsung play
    if (!adFired) {
      setAdFired(true);
      firePopunder(directLink);
    }
    setUnlocked(true);
  }

  function closeAd() {
    setShowAd(false);
    setUnlocked(true);
  }

  return (
    <div className="video-content">
      <div id="player">
        {!unlocked ? (
          <div className="video-link" onClick={handleClick} style={{ cursor: 'pointer' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="thumbnail" src={video.thumb} alt={video.title} />
          </div>
        ) : video.embed ? (
          <iframe
            id="videq_iframe"
            scrolling="no"
            frameBorder="0"
            allowFullScreen
            allow="fullscreen"
            src={video.embed}
          />
        ) : (
          <video
            id="videq_iframe"
            controls
            autoPlay
            playsInline
            src={video.file || ''}
            poster={video.thumb}
          />
        )}
      </div>

      {showAd && (
        <div className="inpage-ad-overlay" role="dialog" aria-label="Advertisement">
          <div className="inpage-ad-box">
            <div className="inpage-ad-head">
              <span>Advertisement</span>
              <button
                className="inpage-ad-close"
                disabled={count > 0}
                onClick={closeAd}
              >
                {count > 0 ? `Tutup dalam ${count}s…` : 'Tutup & Putar Video ✕'}
              </button>
            </div>
            <div className="inpage-ad-body">
              <iframe
                src={directLink}
                title="Sponsored"
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        </div>
      )}

      {settings?.bannerBottom ? (
        <div style={{ background: '#0c0c12', padding: 12, textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: settings.bannerBottom }} />
      ) : null}
      {settings?.popunderScript ? <div dangerouslySetInnerHTML={{ __html: settings.popunderScript }} /> : null}
    </div>
  );
}
