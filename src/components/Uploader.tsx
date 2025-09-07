// components/Uploader.tsx
"use client";
import { useState } from "react";

export default function Uploader({
  onUploaded,
}: {
  onUploaded: (file: { url: string; mime: string; name: string }) => void;
}) {
  const [loading, setLoading] = useState(false);
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true);
    const sig = await fetch("/api/files/sign").then((r) => r.json());
    const form = new FormData();
    form.append("file", f);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", sig.timestamp);
    form.append("signature", sig.signature);
    form.append("upload_preset", "unsigned"); // or manage preset in Cloudinary
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
      { method: "POST", body: form }
    );
    const json = await res.json();
    onUploaded({ url: json.secure_url, mime: f.type, name: f.name });
    setLoading(false);
  }
  return (
    <label className="text-sm bg-[#f9f9f9]/5 px-2 py-1 rounded cursor-pointer">
      {loading ? "Uploading…" : "Attach"}
      <input type="file" className="hidden" onChange={onChange} />
    </label>
  );
}
