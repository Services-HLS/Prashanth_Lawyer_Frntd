import type { FieldDef } from "./resources";
import { slugify } from "./resources";

export function emptyForm(fields: FieldDef[]): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === "checkbox") row[f.name] = 0;
    else if (f.type === "number") row[f.name] = 0;
    else if (f.name === "status") row[f.name] = "draft";
    else if (f.name === "is_active") row[f.name] = 1;
    else if (f.name === "type" && f.hidden) {
      row[f.name] = f.options?.[0]?.value ?? "article";
    } else row[f.name] = "";
  }
  return row;
}

export function rowToForm(row: Record<string, unknown>, fields: FieldDef[]): Record<string, unknown> {
  const form: Record<string, unknown> = {};
  for (const f of fields) {
    let val = row[f.name];
    if ((f.type === "json" || f.type === "gallery") && val != null && typeof val === "object") {
      val = JSON.stringify(val, null, 2);
    }
    if (f.type === "checkbox") {
      val = val === true || val === 1 || val === "1" ? 1 : 0;
    }
    form[f.name] = val ?? "";
  }
  return form;
}

export function formToPayload(
  form: Record<string, unknown>,
  fields: FieldDef[],
  isCreate: boolean,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const f of fields) {
    let val = form[f.name];
    if (val === "" || val === undefined) {
      if (f.type !== "checkbox") continue;
    }

    if ((f.type === "json" || f.type === "gallery") && typeof val === "string" && val.trim()) {
      try {
        val = JSON.parse(val);
      } catch {
        throw new Error(`Invalid JSON in ${f.label}`);
      }
    }

    if (f.type === "gallery" && Array.isArray(val)) {
      val = JSON.stringify(val);
    }

    if (f.type === "number") {
      val = val === "" ? null : Number(val);
    }

    if (f.type === "checkbox") {
      val = val ? 1 : 0;
    }

    if (f.type === "datetime" && typeof val === "string" && val) {
      val = val.replace("T", " ") + ":00";
    }

    payload[f.name] = val;
  }

  if (isCreate && payload.title && !payload.slug) {
    payload.slug = slugify(String(payload.title));
  }
  if (isCreate && payload.name && !payload.slug && "slug" in form) {
    payload.slug = slugify(String(payload.name));
  }

  return payload;
}
