import { useEffect, useState, useMemo } from "react";
import { Moon, Sun } from "lucide-react";
import { getSharedClient } from "@/lib/rpc2";
import type { PublicInfo } from "@/lib/types/komari";
import { Skeleton } from "./ui/skeleton";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [publicInfo, setPublicInfo] = useState<PublicInfo | null>(null);

  useEffect(() => {
    setMounted(true);

    // 获取公开信息
    getSharedClient().getPublicInfo().then(setPublicInfo).catch(console.error);

    // 检测主题
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const titlePlaceholder = useMemo(() => {
    const fallback = "Komari Monitor";
    const displayName = publicInfo?.sitename ?? fallback;
    const estimatedLength = Math.max(fallback.length, displayName.length);
    const minWidth = Math.min(estimatedLength * 12, 320);
    return {
      displayName,
      style: { minWidth: `${minWidth}px` },
    };
  }, [publicInfo]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          {publicInfo ? (
            <h1
              className="text-2xl font-bold bg-linear-to-r from-primary via-primary/70 to-primary/30 bg-clip-text text-transparent"
              style={titlePlaceholder.style}
            >
              {titlePlaceholder.displayName}
            </h1>
          ) : (
            <Skeleton
              className="h-8 rounded-md"
              style={titlePlaceholder.style}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md p-2 w-10 h-10 hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="切换主题"
          >
            {mounted ? (
              isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
