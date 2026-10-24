import { useEffect } from 'react';

const ADSENSE_CLIENT = 'ca-pub-7197849036557828';
const SCRIPT_ID = 'adsbygoogle-loader';

/**
 * Loads the AdSense script only on public content pages.
 * Admin login and dashboard screens never call this, so no ads are
 * served on screens without publisher content (AdSense program policy).
 */
export const useAdSense = () => {
    useEffect(() => {
        if (document.getElementById(SCRIPT_ID)) return;
        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
        document.head.appendChild(script);
    }, []);
};

/** Sets the document title and meta description for a public page. */
export const usePageMeta = (title, description) => {
    useEffect(() => {
        document.title = title;
        if (description) {
            document.querySelector('meta[name="description"]')?.setAttribute('content', description);
        }
        window.scrollTo(0, 0);
    }, [title, description]);
};
