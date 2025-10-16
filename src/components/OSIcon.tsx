import { useMemo } from "react";
import { Icon } from "@iconify/react";

interface OSIconProps {
  os: string;
  className?: string;
}

// OS 图标配置
const OS_ICON_CONFIG = {
  ubuntu: { icon: "simple-icons:ubuntu", color: "#E95420" },
  debian: { icon: "simple-icons:debian", color: "#A80030" },
  arch: { icon: "simple-icons:archlinux", color: "#1793D1" },
  alpine: { icon: "simple-icons:alpinelinux", color: "#0D597F" },
  gentoo: { icon: "simple-icons:gentoo", color: "#54487A" },
  suse: { icon: "simple-icons:opensuse", color: "#73BA25" },
  opensuse: { icon: "simple-icons:opensuse", color: "#73BA25" },
  fedora: { icon: "simple-icons:fedora", color: "#294172" },
  centos: { icon: "simple-icons:centos", color: "#262577" },
  rhel: { icon: "simple-icons:redhat", color: "#EE0000" },
  redhat: { icon: "simple-icons:redhat", color: "#EE0000" },
  "red hat": { icon: "simple-icons:redhat", color: "#EE0000" },
  rocky: { icon: "simple-icons:rockylinux", color: "#10B981" },
  alma: { icon: "simple-icons:almalinux", color: "#2C6BFF" },
  freebsd: { icon: "simple-icons:freebsd", color: "#AB2B28" },
  linux: { icon: "simple-icons:linux", color: "#FCC624" },
  bsd: { icon: "simple-icons:freebsd", color: "#AB2B28" },
  windows: { icon: "simple-icons:windows11", color: "#0078D4" },
  win: { icon: "simple-icons:windows11", color: "#0078D4" },
  darwin: { icon: "simple-icons:apple", color: "" },
  macos: { icon: "simple-icons:apple", color: "" },
  mac: { icon: "simple-icons:apple", color: "" },
} as const;

// 使用 Iconify 图标库映射常见系统/发行版
export function OSIcon({ os, className = "h-4 w-4" }: OSIconProps) {
  const iconConfig = useMemo(() => {
    const osLower = os.toLowerCase();

    // 查找匹配的配置
    for (const [key, config] of Object.entries(OS_ICON_CONFIG)) {
      if (osLower.includes(key)) {
        return config;
      }
    }

    // 默认服务器图标
    return { icon: "mdi:server", color: "" };
  }, [os]);

  return (
    <Icon
      icon={iconConfig.icon}
      className={className}
      {...(iconConfig.color && { color: iconConfig.color })}
    />
  );
}
