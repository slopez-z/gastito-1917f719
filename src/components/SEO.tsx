import { useEffect } from "react";
import { sanitizeSEOContent } from "@/lib/security";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
}

export const SEO = ({ title, description, canonical }: SEOProps) => {
  useEffect(() => {
    if (title) {
      const sanitizedTitle = sanitizeSEOContent(title);
      document.title = sanitizedTitle;
    }

    if (description) {
      const sanitizedDescription = sanitizeSEOContent(description);
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', sanitizedDescription);
    }

    if (canonical) {
      // Validate canonical URL format
      try {
        new URL(canonical);
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('rel', 'canonical');
          document.head.appendChild(link);
        }
        link.setAttribute('href', canonical);
      } catch {
        // Invalid URL, skip setting canonical
      }
    }
  }, [title, description, canonical]);

  return null;
};
