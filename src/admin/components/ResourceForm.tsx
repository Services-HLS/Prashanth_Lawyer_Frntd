import type { FieldDef } from "../resources";
import { fieldsBySection, SECTION_LABELS } from "../resource-sections";
import { FieldInput } from "./FieldInput";

type Props = {
  fields: FieldDef[];
  form: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
};

export function ResourceForm({ fields, form, onChange }: Props) {
  const groups = fieldsBySection(fields);

  return (
    <div className="space-y-6">
      {(["main", "media", "more"] as const).map((section) => {
        const sectionFields = groups[section];
        if (!sectionFields.length) return null;
        return (
          <div key={section} className="admin-form-section">
            <h3 className="admin-form-section-title">{SECTION_LABELS[section]}</h3>
            <div className="grid gap-4">
              {sectionFields.map((field) => (
                <FieldInput
                  key={field.name}
                  field={field}
                  value={form[field.name]}
                  onChange={(v) => onChange(field.name, v)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
