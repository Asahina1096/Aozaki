interface TickProps {
  x?: number;
  y?: number;
  payload?: { value: string | number };
}

/**
 * X 轴自定义 Tick 组件
 * 使用 Tailwind className 确保暗色模式下文字颜色正确
 */
export function CustomXAxisTick({ x, y, payload }: TickProps) {
  if (!payload) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        className="fill-muted-foreground text-xs"
      >
        {payload.value}
      </text>
    </g>
  );
}

/**
 * Y 轴自定义 Tick 组件
 * 使用 Tailwind className 确保暗色模式下文字颜色正确
 */
export function CustomYAxisTick({ x, y, payload }: TickProps) {
  if (!payload) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dx={-8}
        textAnchor="end"
        className="fill-muted-foreground text-xs"
      >
        {payload.value}
      </text>
    </g>
  );
}

/**
 * 网络速度 Y 轴自定义 Tick 组件
 * 分离数值和单位，优化视觉层次
 */
export function CustomSpeedYAxisTick({ x, y, payload }: TickProps) {
  if (!payload) return null;

  // 导入 formatSpeed 需要在运行时动态导入，所以这里直接实现格式化逻辑
  const formatSpeedValue = (bytesPerSecond: number): string => {
    if (bytesPerSecond === 0) return "0 B/s";
    if (bytesPerSecond < 0) return "0 B/s";

    const k = 1024;
    const sizes = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];

    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    const value = bytesPerSecond / Math.pow(k, i);

    // 智能小数位：小于 10 用 1 位小数，大于等于 10 用整数
    const dm = value < 10 ? 1 : 0;
    const speed = parseFloat(value.toFixed(dm));

    return `${speed} ${sizes[i]}`;
  };

  const formatted = formatSpeedValue(Number(payload.value));
  const parts = formatted.split(" ");
  const value = parts[0] || "";
  const unit = parts[1] || "";

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dx={-8}
        textAnchor="end"
        className="fill-muted-foreground text-xs"
      >
        <tspan className="font-medium">{value}</tspan>
        {unit && <tspan className="opacity-70"> {unit}</tspan>}
      </text>
    </g>
  );
}
