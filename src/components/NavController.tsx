import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  links: { href: string; label: string }[];
  siteName: string;
}

export default function NavController({ links, siteName }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navState, setNavState] = useState<"transparent" | "solid">("transparent");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstDrawerLinkRef = useRef<HTMLAnchorElement>(null);

  // IntersectionObserver 1: hero → nav state (D-12)
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      setNavState("solid"); // no hero in DOM => solid by default
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setNavState(entry && entry.intersectionRatio > 0.1 ? "transparent" : "solid");
      },
      { threshold: [0, 0.1, 0.5, 1] },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // IntersectionObserver 2: active section highlight (D-14)
  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((s): s is HTMLElement => s !== null);
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { threshold: 0.4, rootMargin: "-80px 0px 0px 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [links]);

  // Sync navState + activeSection to DOM attributes for CSS-driven styling
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('nav[data-nav-root]');
    nav?.setAttribute("data-nav-state", navState);
  }, [navState]);

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('nav[data-nav-root]');
    if (!nav) return;
    nav.querySelectorAll<HTMLElement>("[data-section-link]").forEach((el) => {
      const id = el.getAttribute("data-section-link");
      if (id === activeSection) {
        el.setAttribute("data-active", "true");
        el.setAttribute("aria-current", "location");
      } else {
        el.removeAttribute("data-active");
        el.removeAttribute("aria-current");
      }
    });
  }, [activeSection]);

  // Body scroll-lock when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      firstDrawerLinkRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Escape closes drawer + focus trap
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        hamburgerRef.current?.focus();
        return;
      }
      if (e.key === "Tab") {
        const drawer = document.getElementById("mobile-drawer");
        if (!drawer) return;
        const focusable = drawer.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <>
      <button
        ref={hamburgerRef}
        type="button"
        aria-expanded={drawerOpen}
        aria-controls="mobile-drawer"
        aria-label={drawerOpen ? "Close menu" : "Open menu"}
        onClick={() => setDrawerOpen((v) => !v)}
        className={cn(
          "lg:hidden flex items-center justify-center rounded-sm",
          "min-h-[44px] min-w-[44px]",
          "nav-text-color focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4",
        )}
      >
        {drawerOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 transition-opacity duration-250 motion-reduce:transition-none lg:hidden",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Drawer */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm bg-surface text-ink",
          "flex flex-col px-5 py-6",
          "transition-transform duration-250 ease-out motion-reduce:transition-none lg:hidden",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-display-md text-ink">{siteName}</span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-sm focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
          >
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <ul className="mt-8 flex flex-col">
          {links.map((l, i) => (
            <li key={l.href} className="border-b border-ink/10">
              <a
                ref={i === 0 ? firstDrawerLinkRef : null}
                href={l.href}
                onClick={() => setDrawerOpen(false)}
                className="block py-4 text-body-lg font-semibold uppercase tracking-[0.08em] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 rounded-sm"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        {/* Mobile drawer quote CTA — dispatches wizard:open (Plan 03 Task 2b, CONTEXT D-01). */}
        <button
          type="button"
          data-wizard-entry="nav"
          onClick={() => {
            setDrawerOpen(false);
            window.dispatchEvent(
              new CustomEvent("wizard:open", { detail: { entry: "nav" } }),
            );
          }}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-primary text-white text-body-md font-semibold py-3 w-full min-h-[44px] transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
        >
          Get a Quote
        </button>
      </div>
    </>
  );
}
