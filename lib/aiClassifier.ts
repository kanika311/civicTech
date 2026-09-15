import { AICategorySuggestion, GrievanceCategory } from "@/types/grievance";
import { CATEGORY_CONFIGS } from "./seedData";

interface KeywordRule {
  category: GrievanceCategory;
  subcategory: string;
  department: string;
  keywords: string[];
  isVisual: boolean;
}

const TAXONOMY_RULES: KeywordRule[] = [
  {
    category: "Sanitation & Waste",
    subcategory: "Garbage Dump / Overflowing Bin",
    department: "Municipal Corporation",
    keywords: ["garbage", "trash", "waste", "bin", "dump", "litter", "kachra", "stench", "rot", "sweeper", "dustbin"],
    isVisual: true,
  },
  {
    category: "Sanitation & Waste",
    subcategory: "Blocked Open Drain / Sewer",
    department: "Municipal Corporation",
    keywords: ["drain", "sewer", "gutter", "drainage", "blocked", "overflowing sewer", "manhole overflow"],
    isVisual: true,
  },
  {
    category: "Roads & Infrastructure",
    subcategory: "Pothole / Road Surface Crater",
    department: "Public Works Department",
    keywords: ["pothole", "crater", "road", "tar", "asphalt", "flyover", "broken road", "surface", "speedbreaker", "accident"],
    isVisual: true,
  },
  {
    category: "Roads & Infrastructure",
    subcategory: "Broken Footpath / Paver Blocks",
    department: "Public Works Department",
    keywords: ["footpath", "sidewalk", "paver", "pedestrian", "walkway", "curb"],
    isVisual: true,
  },
  {
    category: "Roads & Infrastructure",
    subcategory: "Malfunctioning Streetlight",
    department: "Public Works Department",
    keywords: ["streetlight", "lamp", "street light", "dark", "lighting", "bulb"],
    isVisual: true,
  },
  {
    category: "Water & Electricity",
    subcategory: "Main Pipeline Burst / Massive Leak",
    department: "Water Board / Electricity Board",
    keywords: ["pipeline", "water pipe", "leak", "pipe burst", "drinking water", "supply", "gushing", "tap water", "jal"],
    isVisual: true,
  },
  {
    category: "Water & Electricity",
    subcategory: "Overhead Wire Hanging / Transformer Spark",
    department: "Water Board / Electricity Board",
    keywords: ["wire", "electricity", "transformer", "spark", "current", "power cut", "shock", "hanging cable", "bijli"],
    isVisual: true,
  },
  {
    category: "Health Services",
    subcategory: "Shortage of Essential Medicines in PHC",
    department: "Health Department",
    keywords: ["medicine", "doctor", "hospital", "phc", "clinic", "dispensary", "vaccine", "paracetamol", "ambulance", "patient"],
    isVisual: false,
  },
  {
    category: "Education",
    subcategory: "Dilapidated School Building / Ceiling Leak",
    department: "Education Department",
    keywords: ["school", "classroom", "teacher", "students", "mid day meal", "principal", "desk", "blackboard", "books"],
    isVisual: false,
  },
  {
    category: "Law & Order / Safety",
    subcategory: "Public Harassment / Dark Unlit Stretches",
    department: "Police / Traffic Department",
    keywords: ["police", "harassment", "eve teasing", "unsafe", "crime", "illegal parking", "traffic", "fight", "loudspeaker", "noise"],
    isVisual: false,
  },
  {
    category: "Land, Revenue & Certificates",
    subcategory: "Delay in Caste / Income / Domicile Certificate",
    department: "Revenue Department",
    keywords: ["certificate", "caste", "income", "domicile", "patwari", "tahsildar", "land record", "mutation", "khata", "registry"],
    isVisual: false,
  },
  {
    category: "Welfare & Social Security",
    subcategory: "Old Age / Widow Pension Delay (2+ Months)",
    department: "Social Welfare Department",
    keywords: ["pension", "ration", "pds", "widow", "disability", "elderly", "schemes", "allowance", "anganwadi", "subsidy"],
    isVisual: false,
  },
  {
    category: "Environment & Disaster",
    subcategory: "Toxic Industrial Effluent into Waterbody",
    department: "Pollution Control Board / Disaster Management",
    keywords: ["pollution", "chemical", "effluent", "smoke", "factory", "lake", "stubble", "waterlogging", "flood", "tree cut"],
    isVisual: true,
  },
  {
    category: "Corruption & Accountability",
    subcategory: "Bribe Demanded for Service Delivery / Certificate",
    department: "Anti-Corruption Bureau",
    keywords: ["bribe", "corruption", "cash", "kickback", "commission", "extortion", "acb", "officer demanding", "illegal money", "ghoos"],
    isVisual: false,
  },
];

export function classifyGrievanceText(text: string): AICategorySuggestion {
  if (!text || text.trim().length === 0) {
    return {
      category: "Sanitation & Waste",
      subcategory: "Garbage Dump / Overflowing Bin",
      department: "Municipal Corporation",
      confidence: 0.5,
      reasoning: ["Default suggestion for general civic complaints."],
      estimatedSlaDays: 2,
      isVisual: true,
    };
  }

  const lower = text.toLowerCase();
  let bestMatch: KeywordRule = TAXONOMY_RULES[0];
  let maxScore = 0;
  const matchedWords: string[] = [];

  for (const rule of TAXONOMY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += 2;
        if (!matchedWords.includes(kw)) matchedWords.push(kw);
      }
    }

    // Boost for subcategory words
    for (const subWord of rule.subcategory.toLowerCase().split(/[\s/]+/)) {
      if (subWord.length > 3 && lower.includes(subWord)) {
        score += 1.5;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = rule;
    }
  }

  // Calculate confidence between 0.65 and 0.98 based on match strength
  const confidence = Math.min(0.98, Math.max(0.68, 0.6 + maxScore * 0.08));

  const config = CATEGORY_CONFIGS.find((c) => c.category === bestMatch.category);

  return {
    category: bestMatch.category,
    subcategory: bestMatch.subcategory,
    department: bestMatch.department,
    confidence: Number(confidence.toFixed(2)),
    reasoning: matchedWords.length > 0
      ? [`Detected keywords: "${matchedWords.slice(0, 4).join('", "')}"`, `Auto-routed to ${bestMatch.department}`]
      : [`Text semantics aligned with ${bestMatch.category}`],
    estimatedSlaDays: config?.defaultSlaDays || 3,
    isVisual: bestMatch.isVisual,
  };
}
