import React, { useEffect, useState } from "react";
import { Moon, Sun, RefreshCw } from "lucide-react";
import { getSharedClient } from "@/lib/rpc2";
import type { PublicInfo } from "@/lib/types/komari";

export function Header() {
  const [isDark, setIsDark] = useState(true);
  const [publicInfo, setPublicInfo] = useState<PublicInfo | null>(null);

  useEffect(() => {
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

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {publicInfo?.sitename || "Komari Monitor"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="刷新"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="切换主题"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
