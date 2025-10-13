import { Icon } from "@iconify/react";

interface OSIconProps {
  os: string;
  className?: string;
}

// 使用 Iconify 图标库映射常见系统/发行版
export function OSIcon({ os, className = "h-4 w-4" }: OSIconProps) {
  const osLower = os.toLowerCase();

  // Linux 发行版
  if (osLower.includes("ubuntu"))
    return (
      <Icon icon="simple-icons:ubuntu" className={className} color="#E95420" />
    );
  if (osLower.includes("debian"))
    return (
      <Icon icon="simple-icons:debian" className={className} color="#A80030" />
    );
  if (osLower.includes("arch"))
    return (
      <Icon
        icon="simple-icons:archlinux"
        className={className}
        color="#1793D1"
      />
    );
  if (osLower.includes("alpine"))
    return (
      <Icon
        icon="simple-icons:alpinelinux"
        className={className}
        color="#0D597F"
      />
    );
  if (osLower.includes("gentoo"))
    return (
      <Icon icon="simple-icons:gentoo" className={className} color="#54487A" />
    );
  if (osLower.includes("suse") || osLower.includes("opensuse"))
    return (
      <Icon
        icon="simple-icons:opensuse"
        className={className}
        color="#73BA25"
      />
    );
  if (osLower.includes("fedora"))
    return (
      <Icon icon="simple-icons:fedora" className={className} color="#294172" />
    );
  if (osLower.includes("centos"))
    return (
      <Icon icon="simple-icons:centos" className={className} color="#262577" />
    );
  if (
    osLower.includes("rhel") ||
    osLower.includes("redhat") ||
    osLower.includes("red hat")
  )
    return (
      <Icon icon="simple-icons:redhat" className={className} color="#EE0000" />
    );
  if (osLower.includes("rocky"))
    return (
      <Icon
        icon="simple-icons:rockylinux"
        className={className}
        color="#10B981"
      />
    );
  if (osLower.includes("alma"))
    return (
      <Icon
        icon="simple-icons:almalinux"
        className={className}
        color="#2C6BFF"
      />
    );

  // BSD / 通用 Linux
  if (osLower.includes("freebsd"))
    return (
      <Icon icon="simple-icons:freebsd" className={className} color="#AB2B28" />
    );
  if (osLower.includes("linux"))
    return (
      <Icon icon="simple-icons:linux" className={className} color="#FCC624" />
    );
  if (osLower.includes("bsd"))
    return (
      <Icon icon="simple-icons:freebsd" className={className} color="#AB2B28" />
    );

  // 桌面系统
  if (osLower.includes("windows") || osLower.includes("win"))
    return (
      <Icon
        icon="simple-icons:windows11"
        className={className}
        color="#0078D4"
      />
    );
  if (
    osLower.includes("darwin") ||
    osLower.includes("macos") ||
    osLower.includes("mac")
  )
    return <Icon icon="simple-icons:apple" className={className} />;

  // 默认服务器/未知系统
  return <Icon icon="mdi:server" className={className} />;
}
