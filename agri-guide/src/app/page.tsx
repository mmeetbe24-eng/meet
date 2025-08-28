"use client";
import { useMemo, useState } from "react";
import { speak } from "@/utils/tts";
import type { AnalysisResponse } from "@/types/agri";

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [crop, setCrop] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => !!imageFile && !loading, [imageFile, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const form = new FormData();
      if (imageFile) form.append("image", imageFile);
      form.append("language", language);
      if (crop) form.append("crop", crop);
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      if (!res.ok) throw new Error("Analysis failed");
      const data = (await res.json()) as AnalysisResponse;
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-sans min-h-screen p-6 sm:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">AgriGuide</h1>
        <p className="text-sm text-gray-600">
          Upload a clear photo of the crop part. We’ll analyze and suggest next steps.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Language</label>
              <select
                className="w-full border rounded px-2 py-2 text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Crop (optional)</label>
              <input
                type="text"
                placeholder="e.g., Tomato"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="bg-black text-white text-sm rounded px-4 py-2 disabled:opacity-50"
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>
            {result?.audio_script && (
              <button
                type="button"
                onClick={() => speak(result.audio_script!, result.language)}
                className="text-sm border rounded px-3 py-2"
              >
                Play audio
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {result && (
          <div className="border rounded p-4 space-y-3">
            <h2 className="text-lg font-medium">
              Title: Likely {result.findings[0]?.label} ({
                Math.round(result.findings[0]?.likelihood * 100)
              }% likelihood)
            </h2>
            <p className="text-sm">
              What we see: {result.findings[0]?.evidence.join(", ")}
            </p>
            <div>
              <p className="font-medium text-sm">Do this now:</p>
              <ol className="list-decimal ml-5 text-sm">
                {result.findings[0]?.recommended_actions.immediate.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
            <div>
              <p className="font-medium text-sm">Safer options:</p>
              <ul className="list-disc ml-5 text-sm">
                {result.findings[0]?.recommended_actions.organic_options.map((o, i) => (
                  <li key={i}>{o.active}{o.notes ? ` — ${o.notes}` : ""}</li>
                ))}
              </ul>
              <p className="font-medium text-sm mt-2">Chemical alternatives:</p>
              <ul className="list-disc ml-5 text-sm">
                {result.findings[0]?.recommended_actions.chemical_options.map((c, i) => (
                  <li key={i}>
                    {c.active}
                    {c.class ? ` (${c.class})` : ""}
                    {c.label_notes ? ` — ${c.label_notes}` : ""}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm">Prevention: {result.findings[0]?.recommended_actions.prevention.join(", ")}</p>
            <p className="text-sm">When to get help: {result.escalation_advice}</p>
            <p className="text-sm">Confidence: {result.confidence_explanation}</p>
            <p className="text-xs text-gray-500">Privacy: {result.privacy_notice}</p>
          </div>
        )}
      </div>
    </div>
  );
}
