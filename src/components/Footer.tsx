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
          <p className="text-sm text-muted-foreground">
            Theme: <span className="font-medium">AstroNext</span> by Komari Dev
            Team
          </p>
        </div>
      </div>
    </footer>
  );
}
