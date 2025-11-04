import { NextRequest } from "next/server";
import { AnalysisResponse } from "@/types/agri";

export async function GET() {
  return new Response(
    JSON.stringify({ message: "POST an image (multipart/form-data) or JSON to analyze." }),
    { headers: { "content-type": "application/json" } }
  );
}

export async function POST(req: NextRequest) {
  let language = "en";
  let crop: string | undefined = undefined;

  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      language = (formData.get("language") as string) || "en";
      crop = (formData.get("crop") as string) || undefined;
      // const image = formData.get("image") as File | null; // In a real model, analyze this
    } else {
      let body: unknown = {};
      try {
        body = await req.json();
      } catch {
        body = {};
      }
      if (typeof body === "object" && body !== null) {
        const rec = body as Record<string, unknown>;
        const maybeLang = rec["language"];
        const maybeCrop = rec["crop"];
        if (typeof maybeLang === "string") language = maybeLang;
        if (typeof maybeCrop === "string") crop = maybeCrop;
      }
    }
  } catch {
    // noop: fall back to defaults
  }

  const response: AnalysisResponse = {
    language,
    crop,
    plant_part: "leaf",
    findings: [
      {
        label: "Early fungal leaf spot",
        scientific_name: "Cercospora spp.",
        category: "disease",
        likelihood: 0.85,
        stage: "early",
        evidence: [
          "Small round brown spots",
          "Yellow halos",
          "Clustered mid-leaf",
        ],
        regions: [
          { type: "bbox", coordinates: [0.2, 0.3, 0.5, 0.6], caption: "Spots" },
        ],
        recommended_actions: {
          immediate: [
            "Remove heavily spotted leaves",
            "Avoid wetting leaves",
            "Monitor spread in 3–5 days",
          ],
          organic_options: [
            {
              active: "Neem oil",
              notes: "Apply in cool evening; repeat in 7 days",
            },
            { active: "Copper soap", notes: "Avoid hot sunny hours" },
          ],
          chemical_options: [
            {
              active: "Azoxystrobin",
              class: "Strobilurin",
              label_notes:
                "Follow local label rates, PHI, REI, PPE.",
              resistance_management: "Rotate MOA; avoid repeats.",
            },
          ],
          prevention: [
            "Improve spacing",
            "Prune for airflow",
            "Sanitize tools",
          ],
        },
      },
    ],
    urgency: "medium",
    escalation_advice:
      "If spots double in 3–5 days or spread to fruit, consult a local agronomist.",
    confidence_explanation:
      "85% based on spot shape, halo, and distribution; humid weather increases risk.",
    privacy_notice:
      "No personal data stored; images may be used anonymously to improve models.",
    audio_script:
      language.startsWith("en")
        ? "This looks like early fungal leaf spot, about eighty-five percent likely. Remove worst leaves, avoid wetting leaves, and apply neem oil this evening. If it spreads quickly, please consult a local expert. Stay safe and follow label instructions."
        : undefined,
  };

  return new Response(JSON.stringify(response), {
    headers: { "content-type": "application/json" },
  });
}

