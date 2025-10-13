import React from "react";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a
              href="https://github.com/komari-monitor/komari"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary transition-colors"
            >
              Komari Monitor
            </a>
            .
          </p>
          {/* 主题信息行已按要求移除 */}
        </div>
      </div>
    </footer>
  );
}
