export type RegionType = "bbox" | "polygon" | "mask";

export interface Region {
  type: RegionType;
  coordinates: unknown;
  caption?: string;
}

export type CategoryType = "disease" | "pest" | "nutrient" | "abiotic";

export type StageType = "early" | "intermediate" | "advanced" | "unknown";

export interface OrganicOption {
  active: string;
  notes?: string;
}

export interface ChemicalOption {
  active: string;
  class?: string;
  label_notes?: string;
  resistance_management?: string;
}

export interface RecommendedActions {
  immediate: string[];
  organic_options: OrganicOption[];
  chemical_options: ChemicalOption[];
  prevention: string[];
}

export interface Finding {
  label: string;
  scientific_name?: string;
  category: CategoryType;
  likelihood: number;
  stage: StageType;
  evidence: string[];
  regions: Region[];
  recommended_actions: RecommendedActions;
}

export type Urgency = "low" | "medium" | "high";

export interface AnalysisResponse {
  language: string;
  crop?: string;
  plant_part?: "leaf" | "stem" | "fruit" | "root" | "whole";
  findings: Finding[];
  urgency: Urgency;
  escalation_advice: string;
  confidence_explanation: string;
  privacy_notice: string;
  audio_script?: string;
}

