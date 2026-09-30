import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readDB } from '@/lib/db';
import SiteAds from '@/components/SiteAds';
import VideoPlayer from './player';

export async function generateMetadata({ params }) {
  const db = readDB();
  const v = db.videos.find((x) => x.id === params.slug);
  return { title: v?.title || 'Video', robots: 'noindex, nofollow' };
}

export const viewport = { width: 'device-width', initialScale: 1 };

export default function VideoPage({ params }) {
  const db = readDB();
  const video = db.videos.find((x) => x.id === params.slug);
  if (!video) return notFound();
  const settings = db.settings || {};
  const parentFolder = db.folders.find((f) => f.id === video.folderId);
  const backHref = parentFolder ? `/f/${parentFolder.id}` : '/';
  const backLabel = parentFolder ? parentFolder.title : 'Beranda';

  return (
    <>
      <style>{`.vv-player,.video-link .thumbnail{height:100%;width:100%}
#videq_iframe,.video-link{width:100%;height:100dvh;padding-bottom:env(safe-area-inset-bottom);box-sizing:border-box}
.video-page-dark{margin:0 auto;padding:0;background:#000;min-height:100dvh}
.video-link{display:block;overflow:visible;position:relative;background-color:#000;cursor:pointer}
.video-link .thumbnail{object-fit:contain;object-position:center}
.video-link::after{content:"";position:absolute;top:50%;left:50%;border-radius:50%;transform:translate(-50%,-50%);background:#fe6081;width:48px;height:48px;background-image:url(data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiAgd2lkdGg9IjI0IiAgaGVpZ2h0PSIyNCIgIHZpZXdCb3g9IjAgMCAyNCAyNCIgIGZpbGw9IiNmZmYiICBjbGFzcz0iaWNvbiBpY29uLXRhYmxlciBpY29ucy10YWJsZXItZmlsbGVkIGljb24tdGFibGVyLXBsYXllci1wbGF5Ij48cGF0aCBzdHJva2U9Im5vbmUiIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNiA0djE2YTEgMSAwIDAgMCAxLjUyNCAuODUybDEzIC04YTEgMSAwIDAgMCAwIC0xLjcwNGwtMTMgLThhMSAxIDAgMCAwIC0xLjUyNCAuODUyeiIgLz48L3N2Zz4=);background-position:center;background-repeat:no-repeat;background-size:24px;filter:drop-shadow(0 0 10px rgba(0,0,0,.4))}
#videq_iframe{border:none;margin-bottom:-3%;background:#000}
.back-fab{position:fixed;top:12px;left:12px;z-index:5000;display:flex;align-items:center;gap:8px;max-width:70vw;padding:9px 14px;border-radius:999px;background:rgba(20,20,27,.85);border:1px solid #2d2d38;color:#f7f7fb;font-size:14px;font-weight:700;backdrop-filter:blur(8px);text-decoration:none}
.back-fab:hover{border-color:rgba(254,96,129,.6)}
.back-fab svg{width:18px;height:18px;fill:#fe6081;flex:0 0 auto}
.back-fab span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`}</style>
      <Link href={backHref} className="back-fab" aria-label="Kembali ke daftar">
        <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
        <span>{backLabel}</span>
      </Link>
      <div className="video-page-dark">
        {settings.bannerTop ? <div style={{ textAlign: 'center', background: '#0c0c12', padding: 8 }} dangerouslySetInnerHTML={{ __html: settings.bannerTop }} /> : null}
        <VideoPlayer video={video} settings={settings} />
        {settings.customHeadScript ? <div dangerouslySetInnerHTML={{ __html: settings.customHeadScript }} /> : null}
        <SiteAds settings={settings} />
      </div>
    </>
  );
}
