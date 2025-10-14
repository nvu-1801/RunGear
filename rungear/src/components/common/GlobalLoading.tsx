"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function GlobalLoading() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const start = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setLoading(true);
    timeoutRef.current = window.setTimeout(() => setLoading(false), 3000);
  };

  const done = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setLoading(false);
  };

  useEffect(() => {
    // use a properly typed EventListener and shared options
    const listenerOpts: AddEventListenerOptions = { capture: true };

    const onDocClick = (e: Event) => {
      const me = e as MouseEvent;
      if (
        me.metaKey ||
        me.ctrlKey ||
        me.shiftKey ||
        me.altKey ||
        me.button === 1
      )
        return;

      const el = (e.target as Element) ?? null;
      const a = el?.closest?.("a");
      if (!a) return;

      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || href.startsWith("#") || target === "_blank") return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return; // external
      start();
    };

    document.addEventListener("click", onDocClick, listenerOpts);

    const origPush = router.push;
    router.push = ((...args: unknown[]) => {
      start();
      return origPush.apply(
        router,
        args as unknown as Parameters<typeof origPush>
      );
    }) as typeof router.push;

    const origReplace = router.replace;
    router.replace = ((...args: unknown[]) => {
      start();
      return origReplace.apply(
        router,
        args as unknown as Parameters<typeof origReplace>
      );
    }) as typeof router.replace;

    const onPopState = () => start();
    window.addEventListener("popstate", onPopState);

    const onVis = () => {
      if (document.visibilityState === "visible") done();
    };
    document.addEventListener("visibilitychange", onVis);

    done();

    return () => {
      document.removeEventListener("click", onDocClick, listenerOpts);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("visibilitychange", onVis);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) {
      const id = requestAnimationFrame(() => setLoading(false));
      return () => cancelAnimationFrame(id);
    }
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[9999]">
      <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-sky-400 rounded-full" />
    </div>
  );
}
