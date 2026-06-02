import { useRef, useState } from "react";
import { toast } from "sonner";

import { adminUploadImages, resolveUploadUrl } from "../api";
import type { FieldDef } from "../resources";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
};

function parseGalleryValue(value: unknown): string[] {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const str = String(value).trim();
  if (!str) return [];
  try {
    const parsed = JSON.parse(str) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    if (str.startsWith("http") || str.startsWith("/") || str.startsWith("data:")) {
      return [str];
    }
  }
  return [];
}

export function ImageField({ field, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const id = `field-${field.name}`;
  const isGallery = field.type === "gallery";

  const urls = isGallery ? parseGalleryValue(value) : value ? [String(value)] : [];
  const singleUrl = !isGallery ? String(value ?? "") : "";

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!files.length) {
      toast.error("Please choose image files only");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await adminUploadImages(files);
      if (isGallery) {
        const merged = [...urls, ...uploaded];
        onChange(JSON.stringify(merged, null, 2));
        toast.success(`${uploaded.length} image(s) uploaded`);
      } else {
        onChange(uploaded[0] ?? "");
        toast.success("Image uploaded");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeUrl(url: string) {
    if (isGallery) {
      onChange(JSON.stringify(urls.filter((u) => u !== url), null, 2));
    } else {
      onChange("");
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-[#6B7385]">
        {field.label}
        {field.required ? " *" : ""}
      </Label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="admin-btn-ghost text-sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : isGallery ? "Upload images" : "Upload image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={isGallery}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        {!isGallery && (
          <span className="self-center text-xs text-[#6B7385]">or paste URL below</span>
        )}
      </div>

      {urls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {urls.map((url) => (
            <div
              key={url}
              className="relative overflow-hidden rounded-lg border border-[rgba(10,15,30,0.1)] bg-white"
            >
              <img
                src={resolveUploadUrl(url)}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
              <button
                type="button"
                className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white"
                onClick={() => removeUrl(url)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {!isGallery && (
        <Input
          id={id}
          className="admin-input h-10"
          placeholder="https://… or /uploads/…"
          value={singleUrl}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {isGallery && (
        <p className="text-xs text-[#6B7385]">
          Upload multiple images — saved to server and stored in MySQL as URL list.
        </p>
      )}
    </div>
  );
}
