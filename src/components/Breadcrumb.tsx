import { ChevronLeft } from "lucide-react";

interface BreadcrumbProps {
  nodeName?: string;
}

export function Breadcrumb({ nodeName }: BreadcrumbProps) {
  return (
    <div className="mb-6 flex items-center gap-2 text-sm">
      <a
        href="/"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        返回首页
      </a>
      <span className="text-muted-foreground">/</span>
      <span className="text-foreground font-medium">
        {nodeName || "节点详情"}
      </span>
    </div>
  );
}
