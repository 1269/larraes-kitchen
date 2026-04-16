import { useEffect } from "react";

export default function MenuTabs() {
  useEffect(() => {
    const tablist = document.querySelector<HTMLElement>("[data-menu-tablist]");
    if (!tablist) return;
    const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>("[data-menu-tab]"));
    const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-menu-panel]"));

    const activate = (key: string) => {
      tabs.forEach((t) => {
        const isActive = t.getAttribute("data-menu-tab") === key;
        t.setAttribute("aria-selected", isActive ? "true" : "false");
        if (isActive) {
          t.classList.remove("text-ink/50", "hover:text-ink/70");
          t.classList.add("text-ink", "border-b-2", "border-primary");
        } else {
          t.classList.remove("text-ink", "border-b-2", "border-primary");
          t.classList.add("text-ink/50", "hover:text-ink/70");
        }
      });
      panels.forEach((p) => {
        p.hidden = p.getAttribute("data-menu-panel") !== key;
      });
    };

    const onClick = (e: Event) => {
      const t = e.currentTarget as HTMLButtonElement;
      const key = t.getAttribute("data-menu-tab");
      if (key) activate(key);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const activeIndex = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      const nextIndex =
        e.key === "ArrowRight"
          ? (activeIndex + 1) % tabs.length
          : (activeIndex - 1 + tabs.length) % tabs.length;
      const nextTab = tabs[nextIndex];
      const nextKey = nextTab?.getAttribute("data-menu-tab");
      if (nextKey) {
        activate(nextKey);
        nextTab?.focus();
      }
    };

    tabs.forEach((t) => {
      t.addEventListener("click", onClick);
      t.addEventListener("keydown", onKey);
    });
    return () => {
      tabs.forEach((t) => {
        t.removeEventListener("click", onClick);
        t.removeEventListener("keydown", onKey);
      });
    };
  }, []);

  return null; // no rendered output; wires up the server-rendered tablist
}
