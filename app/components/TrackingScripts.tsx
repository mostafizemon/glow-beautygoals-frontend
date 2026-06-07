'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/tracking';
import { getApiUrl } from '@/lib/api';

export default function TrackingScripts() {
  const [metaPixel, setMetaPixel] = useState<string | null>(null);
  const [tiktokPixel, setTikTokPixel] = useState<string | null>(null);
  const [metaReady, setMetaReady] = useState(false);
  const [tiktokReady, setTikTokReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Fetch pixel IDs from our backend
    const API_URL = getApiUrl();
    fetch(`${API_URL}/api/v1/config/pixels`)
      .then(res => res.json())
      .then(data => {
        if (data.meta?.is_active && data.meta?.pixel_id) {
          setMetaPixel(data.meta.pixel_id);
        }
        if (data.tiktok?.is_active && data.tiktok?.pixel_id) {
          setTikTokPixel(data.tiktok.pixel_id);
        }
      })
      .catch(console.error);
  }, []);

  // Track Page Views when route changes
  useEffect(() => {
    const hasPixel = Boolean(metaPixel || tiktokPixel);
    const ready = (!metaPixel || metaReady) && (!tiktokPixel || tiktokReady);

    if (hasPixel && ready) {
      trackEvent('PageView', { page_path: pathname });
    }
  }, [pathname, metaPixel, tiktokPixel, metaReady, tiktokReady]);

  return (
    <>
      {/* Meta Pixel Base Code */}
      {metaPixel && (
        <Script
          id="meta-pixel-base"
          strategy="afterInteractive"
          onReady={() => setMetaReady(true)}
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixel}');
            `,
          }}
        />
      )}

      {/* TikTok Pixel Base Code */}
      {tiktokPixel && (
        <Script
          id="tiktok-pixel-base"
          strategy="afterInteractive"
          onReady={() => setTikTokReady(true)}
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${tiktokPixel}');
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}
