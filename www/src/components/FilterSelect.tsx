import { Label, ListBox, Select } from "@heroui/react";
import type { Key } from "react";

type FilterSelectProps = {
  label: string;
  placeholder: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  isDisabled?: boolean;
};

export function FilterSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  isDisabled = false,
}: FilterSelectProps) {
  return (
    <Select
      className="w-full"
      fullWidth
      variant="secondary"
      placeholder={placeholder}
      isDisabled={isDisabled || options.length === 0}
      value={value}
      onChange={(key: Key | Key[] | null) => {
        if (key == null || Array.isArray(key)) {
          onChange(null);
          return;
        }
        onChange(String(key));
      }}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="max-h-80 overflow-auto">
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option} id={option} textValue={option}>
              {option}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
