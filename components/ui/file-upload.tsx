"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, X, CheckCircle2, Loader2, ImageIcon } from "lucide-react";

interface FileUploadProps {
  value?:    string;           // current URL
  onChange?: (url: string) => void;
  accept?:   string;
  label?:    string;
  className?: string;
}

export function FileUpload({
  value, onChange, accept = "image/*", label = "Upload file", className,
}: FileUploadProps) {
  const inputRef             = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string>(value ?? "");
  const [status,  setStatus]  = React.useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error,   setError]   = React.useState("");
  const [drag,    setDrag]    = React.useState(false);

  async function upload(file: File) {
    setStatus("uploading"); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setPreview(data.url);
      setStatus("done");
      onChange?.(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  }

  function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    upload(file);
  }

  return (
    <div className={cn("flex flex-col items-start gap-3", className)}>
      {/* Preview */}
      {preview && (
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#27272a] bg-[#1a1a1d]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          {status === "uploading" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
          <button
            type="button"
            onClick={() => { setPreview(""); setStatus("idle"); onChange?.(""); }}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#EF4444] flex items-center justify-center hover:bg-[#DC2626]"
            aria-label="Remove"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files); }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all text-sm",
          drag
            ? "border-[#7A1F34] bg-[#7A1F34]/5"
            : "border-[#27272a] hover:border-[#3f3f46] bg-[#1a1a1d] hover:bg-[#141416]"
        )}
      >
        {status === "uploading" ? (
          <Loader2 className="w-4 h-4 text-[#71717A] animate-spin" />
        ) : status === "done" ? (
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
        ) : (
          <Upload className="w-4 h-4 text-[#71717A]" />
        )}
        <div>
          <p className="text-xs font-medium text-[#A1A1AA]">
            {status === "uploading" ? "Uploading…" : status === "done" ? "Uploaded" : label}
          </p>
          <p className="text-[11px] text-[#52525b]">PNG, JPG, WebP up to 5MB</p>
        </div>
      </div>

      {error && <p className="text-xs text-[#EF4444]">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
    </div>
  );
}
