import { Icon } from "@iconify/react";
import {
  Clock4,
  Cpu,
  HardDrive,
  MapPin,
  MemoryStick,
  Network,
  Server,
} from "lucide-react";
import { css } from "../../styled-system/css";
import type { ServerStats } from "@/lib/types/serverstatus";
import {
  extractOS,
  formatBytes,
  formatPercent,
  formatSpeed,
  formatUptime,
} from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";

interface ServerCardProps {
  server: ServerStats;
}

const infoPillClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1",
  rounded: "full",
  border: "1px solid",
  borderColor: "border",
  borderOpacity: "0.4",
  bg: "muted",
  bgOpacity: "0.6",
  px: "1.5",
  py: "0.5",
  whiteSpace: "nowrap",
});

function getOSIcon(os: string | null) {
  const osMap: Record<string, string> = {
    debian: "logos:debian",
    ubuntu: "logos:ubuntu",
    centos: "logos:centos-icon",
    fedora: "logos:fedora",
    alpine: "logos:alpine",
    arch: "logos:archlinux",
    windows: "logos:microsoft-windows-icon",
    macos: "logos:apple",
    freebsd: "logos:freebsd",
    openbsd: "devicon:openbsd",
    redhat: "logos:redhat-icon",
    rocky: "simple-icons:rockylinux",
    alma: "simple-icons:almalinux",
  };
  return os && osMap[os] ? osMap[os] : "mdi:server";
}

export function ServerCard({ server }: ServerCardProps) {
  const os = extractOS(server.labels);
  const osIcon = getOSIcon(os);
  const isOnline = server.online4 || server.online6;
  const cpuUsage = server.cpu;
  const memUsage = server.memory_used;
  const memTotal = server.memory_total;
  const diskUsage = server.hdd_used;
  const diskTotal = server.hdd_total;

  const memPercent = formatPercent(memUsage, memTotal);
  const diskPercent = formatPercent(diskUsage, diskTotal);
  const cpuDisplay = Math.round(cpuUsage * 10) / 10;
  const load1 = Math.round(server.load_1 * 100) / 100;
  const load5 = Math.round(server.load_5 * 100) / 100;
  const load15 = Math.round(server.load_15 * 100) / 100;

  return (
    <Card
      className={css({
        minH: "420px",
        overflow: "hidden",
        transition: "all",
        cursor: "pointer",
        _hover: { boxShadow: "lg" },
      })}
    >
      <CardHeader className={css({ pb: "0", display: "flex", flexDirection: "column", gap: "1" })}>
        <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
          <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
            <Icon icon={osIcon} className={css({ h: "5", w: "5" })} />
            <CardTitle className={css({ fontSize: "lg" })}>
              {server.alias || server.name}
            </CardTitle>
          </div>
          <div
            className={css({
              h: "2.5",
              w: "2.5",
              rounded: "full",
              mr: "1",
              bg: isOnline ? "green.500" : "gray.400",
              color: isOnline ? "green.500" : "gray.400",
              animation: isOnline ? "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
            })}
          />
        </div>
        <CardDescription
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "1",
            fontSize: "xs",
            color: "muted.foreground",
          })}
        >
          {/* 第一行：运行时间 + IPV4 + IPV6 + 地区 */}
          <div className={css({ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2" })}>
            {server.uptime ? (
              <span className={infoPillClass}>
                <Clock4 className={css({ h: "3.5", w: "3.5" })} />
                <span className={css({ lineHeight: "none" })}>
                  {formatUptime(server.uptime)}
                </span>
              </span>
            ) : (
              <span className={infoPillClass}>
                <Clock4 className={css({ h: "3.5", w: "3.5" })} />
                <span className={css({ lineHeight: "none" })}>--</span>
              </span>
            )}
            <span className={infoPillClass}>
              <div
                className={css({
                  h: "2",
                  w: "2",
                  rounded: "full",
                  bg: server.online4 ? "green.500" : "gray.400",
                })}
              />
              <span
                className={css({
                  lineHeight: "none",
                  color: server.online4 ? "foreground" : "muted.foreground",
                })}
              >
                v4
              </span>
            </span>
            <span className={infoPillClass}>
              <div
                className={css({
                  h: "2",
                  w: "2",
                  rounded: "full",
                  bg: server.online6 ? "green.500" : "gray.400",
                })}
              />
              <span
                className={css({
                  lineHeight: "none",
                  color: server.online6 ? "foreground" : "muted.foreground",
                })}
              >
                v6
              </span>
            </span>
            {server.location && (
              <span className={infoPillClass}>
                <MapPin className={css({ h: "3.5", w: "3.5" })} />
                <span className={css({ lineHeight: "none" })}>{server.location}</span>
              </span>
            )}
          </div>
          {/* 第二行：类型 */}
          <div className={css({ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2" })}>
            {server.type && (
              <span className={infoPillClass}>
                <Server className={css({ h: "3.5", w: "3.5" })} />
                <span className={css({ lineHeight: "none" })}>{server.type}</span>
              </span>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className={css({ display: "flex", flexDirection: "column", gap: "3", pt: "1" })}>
        {/* CPU */}
        <div className={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
          <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "sm" })}>
            <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
              <Cpu className={css({ h: "4", w: "4" })} />
              <span>CPU</span>
            </div>
            <span>{cpuDisplay}%</span>
          </div>
          <Progress
            value={cpuUsage}
            max={100}
            variant={isOnline ? "auto" : "muted"}
          />
          <p className={css({ fontSize: "xs", color: "muted.foreground" })}>
            负载: {load1} / {load5} / {load15}
          </p>
        </div>

        <Separator className={css({ my: "2" })} />

        {/* 内存 */}
        <div className={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
          <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "sm" })}>
            <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
              <MemoryStick className={css({ h: "4", w: "4" })} />
              <span>内存</span>
            </div>
            <span>{memPercent}</span>
          </div>
          <Progress
            value={memUsage}
            max={memTotal}
            variant={isOnline ? "auto" : "muted"}
          />
          <p className={css({ fontSize: "xs", color: "muted.foreground" })}>
            {formatBytes(memUsage * 1024)} / {formatBytes(memTotal * 1024)}
          </p>
        </div>

        <Separator className={css({ my: "2" })} />

        {/* 磁盘 */}
        <div className={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
          <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "sm" })}>
            <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
              <HardDrive className={css({ h: "4", w: "4" })} />
              <span>磁盘</span>
            </div>
            <span>{diskPercent}</span>
          </div>
          <Progress
            value={diskUsage}
            max={diskTotal}
            variant={isOnline ? "auto" : "muted"}
          />
          <p className={css({ fontSize: "xs", color: "muted.foreground" })}>
            {formatBytes(diskUsage * 1024 * 1024)} /{" "}
            {formatBytes(diskTotal * 1024 * 1024)}
          </p>
        </div>

        <Separator className={css({ my: "2" })} />

        {/* 网络 */}
        <div className={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
          <div className={css({ display: "flex", alignItems: "center", gap: "2", fontSize: "sm" })}>
            <Network className={css({ h: "4", w: "4" })} />
            <span>网络</span>
          </div>
          <div className={css({ display: "grid", gridTemplateColumns: "2", gap: "2", fontSize: "xs" })}>
            <div className={css(infoPillClass, { justifyContent: "space-between" })}>
              <span className={css({ color: "muted.foreground" })}>↑ 上传</span>
              <span className={css({ fontWeight: "medium" })}>
                {formatSpeed(server.network_tx)}
              </span>
            </div>
            <div className={css(infoPillClass, { justifyContent: "space-between" })}>
              <span className={css({ color: "muted.foreground" })}>↓ 下载</span>
              <span className={css({ fontWeight: "medium" })}>
                {formatSpeed(server.network_rx)}
              </span>
            </div>
          </div>
          <div className={css({ display: "grid", gridTemplateColumns: "2", gap: "2", fontSize: "xs" })}>
            <div className={css(infoPillClass, { justifyContent: "space-between" })}>
              <span className={css({ color: "muted.foreground" })}>↑ 总上传</span>
              <span className={css({ fontWeight: "medium" })}>
                {formatBytes(server.network_out)}
              </span>
            </div>
            <div className={css(infoPillClass, { justifyContent: "space-between" })}>
              <span className={css({ color: "muted.foreground" })}>↓ 总下载</span>
              <span className={css({ fontWeight: "medium" })}>
                {formatBytes(server.network_in)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
