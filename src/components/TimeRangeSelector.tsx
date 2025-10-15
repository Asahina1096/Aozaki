import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeRangeSelectorProps {
  value: number;
  onChange: (_value: number) => void;
}

const timeRanges = [
  { label: "1 小时", value: 1 },
  { label: "6 小时", value: 6 },
  { label: "12 小时", value: 12 },
  { label: "24 小时", value: 24 },
  { label: "7 天", value: 24 * 7 },
  { label: "30 天", value: 24 * 30 },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">时间范围：</label>
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(Number(val))}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {timeRanges.map((range) => (
            <SelectItem key={range.value} value={range.value.toString()}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
