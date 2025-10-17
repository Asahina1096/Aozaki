// 统一的图表渐变色定义
export function CpuGradient() {
  return (
    <defs>
      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
      </linearGradient>
    </defs>
  );
}

export function MemoryGradient() {
  return (
    <defs>
      <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
      </linearGradient>
    </defs>
  );
}

export function DiskGradient() {
  return (
    <defs>
      <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
      </linearGradient>
    </defs>
  );
}

export function GpuGradient() {
  return (
    <defs>
      <linearGradient id="colorGpu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
      </linearGradient>
    </defs>
  );
}

export function SwapGradient() {
  return (
    <defs>
      <linearGradient id="colorSwap" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
      </linearGradient>
    </defs>
  );
}

export function NetworkGradient() {
  return (
    <defs>
      <linearGradient id="colorNetwork" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
      </linearGradient>
    </defs>
  );
}
