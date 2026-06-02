import type { FieldDef } from "../resources";
import { ImageField } from "./ImageField";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
};

/** Radix Select forbids empty string as item value — map blank option here. */
const SELECT_EMPTY = "__empty__";

export function FieldInput({ field, value, onChange }: Props) {
  const id = `field-${field.name}`;
  const textValue = String(value ?? "");
  const isBookPublicationField =
    field.type === "textarea" &&
    field.name === "description" &&
    /book publication content/i.test(field.label);

  const appendBookBlock = (block: string) => {
    const next = textValue.trim();
    onChange(next ? `${next}\n\n${block}` : block);
  };

  const ensureBookTemplate = () => {
    if (textValue.trim()) return;
    onChange(
      [
        "Table of Contents",
        "1. Chapter 1",
        "2. Chapter 2",
        "3. Chapter 3",
        "",
        "Part 1: Foundations",
        "Chapter 1: Overview",
        "Write 2–3 lines of prose here. Explain the chapter's goal and scope.",
        "- Key point one",
        "- Key point two",
      ].join("\n"),
    );
  };

  const addChapterBlock = () => {
    const matches = [...textValue.matchAll(/\bchapter\s+(\d+)\b/gi)];
    const last = matches.length ? Number(matches[matches.length - 1]?.[1] ?? "0") : 0;
    const nextNum = last > 0 ? last + 1 : 1;
    appendBookBlock(
      [
        `Chapter ${nextNum}: New chapter title`,
        "Write chapter summary in 2-4 lines.",
        "- Key point one",
        "- Key point two",
      ].join("\n"),
    );
  };

  const addPartBlock = () => {
    const matches = [...textValue.matchAll(/\bpart\s+(\d+)\b/gi)];
    const last = matches.length ? Number(matches[matches.length - 1]?.[1] ?? "0") : 0;
    const nextNum = last > 0 ? last + 1 : 1;
    appendBookBlock(`Part ${nextNum}: New part title`);
  };

  if (field.type === "image" || field.type === "gallery") {
    return <ImageField field={field} value={value} onChange={onChange} />;
  }

  if (field.type === "checkbox") {
    const checked = value === 1 || value === true || value === "1";
    return (
      <div className="flex items-center gap-2 py-1">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onChange(v ? 1 : 0)}
        />
        <Label htmlFor={id} className="cursor-pointer font-normal">
          {field.label}
        </Label>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-[#6B7385]">
        {field.label}
        {field.required ? " *" : ""}
      </Label>

      {field.type === "textarea" || field.type === "json" ? (
        <div className="space-y-2">
          {isBookPublicationField && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="admin-btn-ghost !h-8 !px-3 !text-xs"
                onClick={ensureBookTemplate}
              >
                Insert Structure
              </button>
              <button
                type="button"
                className="admin-btn-ghost !h-8 !px-3 !text-xs"
                onClick={addPartBlock}
              >
                + Add Part
              </button>
              <button
                type="button"
                className="admin-btn-ghost !h-8 !px-3 !text-xs"
                onClick={addChapterBlock}
              >
                + Add Chapter
              </button>
            </div>
          )}
          <Textarea
            id={id}
            className="admin-input min-h-[80px] resize-y"
            rows={field.rows ?? 4}
            placeholder={field.placeholder}
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : field.type === "select" ? (
        <Select
          value={
            value == null || value === ""
              ? SELECT_EMPTY
              : String(value)
          }
          onValueChange={(v) => onChange(v === SELECT_EMPTY ? "" : v)}
        >
          <SelectTrigger className="admin-input h-10">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => {
              const itemValue = opt.value === "" ? SELECT_EMPTY : opt.value;
              return (
                <SelectItem key={itemValue} value={itemValue}>
                  {opt.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          className="admin-input h-10"
          type={
            field.type === "number"
              ? "number"
              : field.type === "date"
                ? "date"
                : field.type === "datetime"
                  ? "datetime-local"
                  : "text"
          }
          placeholder={field.placeholder}
          value={
            value == null
              ? ""
              : field.type === "datetime" && typeof value === "string"
                ? value.slice(0, 16)
                : String(value)
          }
          onChange={(e) =>
            onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
          }
        />
      )}
    </div>
  );
}
