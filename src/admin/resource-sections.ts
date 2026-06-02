import type { FieldDef } from "./resources";

export type FieldSection = "main" | "media" | "more";

export const SECTION_LABELS: Record<FieldSection, string> = {
  main: "Basic info",
  media: "Images",
  more: "Optional",
};

export function fieldsBySection(fields: FieldDef[]): Record<FieldSection, FieldDef[]> {
  const groups: Record<FieldSection, FieldDef[]> = {
    main: [],
    media: [],
    more: [],
  };
  for (const field of fields) {
    if (field.hidden) continue;
    const section = field.section ?? "main";
    groups[section].push(field);
  }
  return groups;
}

export function allFormFields(fields: FieldDef[]): FieldDef[] {
  return fields.filter((f) => !f.hidden);
}
