import { lazy, Suspense, useEffect, useState } from "react";
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import type { Plugin } from "yet-another-react-lightbox";
import { cn } from "@/lib/utils";

// Dynamic imports — lightbox + plugins ship only when user opens one (GAL-06 + PATTERNS anti-pattern #15).
// Lightbox component loads via React.lazy(); plugins are void-returning functions (not React
// components) so they're loaded imperatively inside a useEffect once the user triggers the lightbox.
const Lightbox = lazy(() => import("yet-another-react-lightbox"));

const INITIAL = 10;

type AspectRatio = "1:1" | "4:3" | "3:2" | "16:9" | "3:4" | "2:3" | "9:16";

interface GalleryPhoto {
  image: string;
  alt: string;
  caption?: string;
  aspectRatio: AspectRatio;
  order: number;
}

interface Props {
  photos: GalleryPhoto[];
}

const ratioToDimensions = (r: AspectRatio): { width: number; height: number } => {
  const [w, h] = r.split(":").map(Number) as [number, number];
  const base = 1200;
  return { width: base, height: Math.round((base * h) / w) };
};

export default function GalleryGrid({ photos }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [plugins, setPlugins] = useState<Plugin[] | null>(null);

  // Load Captions + Counter plugins only when the lightbox is first opened (GAL-06).
  useEffect(() => {
    if (lightboxIndex !== null && plugins === null) {
      Promise.all([
        import("yet-another-react-lightbox/plugins/captions"),
        import("yet-another-react-lightbox/plugins/counter"),
      ]).then(([captions, counter]) => {
        setPlugins([captions.default, counter.default]);
      });
    }
  }, [lightboxIndex, plugins]);

  const albumPhotos = photos.map((p) => {
    const { width, height } = ratioToDimensions(p.aspectRatio);
    return {
      src: p.image,
      width,
      height,
      alt: p.alt,
      ...(p.caption ? { title: p.caption } : {}),
    };
  });

  const visible = showAll ? albumPhotos : albumPhotos.slice(0, INITIAL);

  const lightboxSlides = photos.map((p) => ({
    src: p.image,
    alt: p.alt,
    ...(p.caption ? { description: p.caption } : {}),
  }));

  return (
    <>
      <MasonryPhotoAlbum
        photos={visible}
        columns={(containerWidth) => (containerWidth < 640 ? 2 : containerWidth < 1024 ? 3 : 4)}
        spacing={16}
        onClick={({ index }) => setLightboxIndex(index)}
      />

      {albumPhotos.length > INITIAL && (
        <div className="flex justify-center mt-12">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className={cn(
              "inline-flex items-center justify-center rounded-full border border-ink/20 text-ink",
              "px-6 py-3 text-body-md font-semibold",
              "hover:bg-ink hover:text-surface transition-colors duration-200 motion-reduce:transition-none",
              "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4",
            )}
          >
            {showAll ? "Show less" : `View the full gallery (${albumPhotos.length})`}
          </button>
        </div>
      )}

      {lightboxIndex !== null && (
        <Suspense fallback={null}>
          <Lightbox
            open={lightboxIndex !== null}
            close={() => setLightboxIndex(null)}
            slides={lightboxSlides}
            index={lightboxIndex}
            plugins={plugins ?? []}
            animation={{ fade: 0 }}
            controller={{ closeOnBackdropClick: true }}
          />
        </Suspense>
      )}
    </>
  );
}
