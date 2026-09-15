"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../component/Navbar";
import ARCaptureModal from "@/components/ar/ARCaptureModal";
import { classifyGrievanceText } from "@/lib/aiClassifier";
import { CATEGORY_CONFIGS } from "@/lib/seedData";
import { civicApi } from "@/lib/civicApi";
import { ARAnchorData, GrievanceCategory } from "@/types/grievance";
import {
  Sparkles,
  Mic,
  MicOff,
  Camera,
  Upload,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Building,
  AlertCircle,
  HelpCircle,
  FileText,
  MapPin,
  Lock,
} from "lucide-react";

export default function UniversalSubmitPage() {
  const router = useRouter();

  // Form states
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<GrievanceCategory>("Sanitation & Waste");
  const [subcategory, setSubcategory] = useState<string>("Garbage Dump / Overflowing Bin");
  const [department, setDepartment] = useState<string>("Municipal Corporation");
  const [slaDays, setSlaDays] = useState<number>(2);
  const [address, setAddress] = useState<string>("MG Road, Ward 12, Bengaluru");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  // AR Capture state
  const [isARModalOpen, setIsARModalOpen] = useState<boolean>(false);
  const [spatialAnchor, setSpatialAnchor] = useState<ARAnchorData | null>(null);

  // Document evidence state for non-visual categories
  const [evidenceFileName, setEvidenceFileName] = useState<string | null>(null);

  // AI Suggestion state
  const [aiSuggestion, setAiSuggestion] = useState<ReturnType<typeof classifyGrievanceText> | null>(null);

  // Voice recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Determine if active category is a visual AR category (1-3 & 9)
  const activeConfig = CATEGORY_CONFIGS.find((c) => c.category === category);
  const isVisualCategory = activeConfig?.isVisualARCategory ?? true;

  // Real-time AI classification when description changes
  useEffect(() => {
    if (description.trim().length > 8) {
      const suggestion = classifyGrievanceText(description);
      setAiSuggestion(suggestion);
    } else {
      setAiSuggestion(null);
    }
  }, [description]);

  // Voice-to-Text handler using SpeechRecognition
  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser. Please type your description.");
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // Supports English with Indian accent; also adapts

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.warn("Speech API init error:", e);
      setSpeechError("Microphone access was denied or failed.");
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  // Apply AI Suggestion with 1-click
  const handleApplyAISuggestion = () => {
    if (!aiSuggestion) return;
    setCategory(aiSuggestion.category);
    setSubcategory(aiSuggestion.subcategory);
    setDepartment(aiSuggestion.department);
    setSlaDays(aiSuggestion.estimatedSlaDays);

    if (aiSuggestion.category === "Corruption & Accountability") {
      setIsAnonymous(true);
    }
  };

  // When category changes manually
  const handleCategoryChange = (newCat: GrievanceCategory) => {
    setCategory(newCat);
    const cfg = CATEGORY_CONFIGS.find((c) => c.category === newCat);
    if (cfg) {
      setSubcategory(cfg.subcategories[0]);
      setDepartment(cfg.department);
      setSlaDays(cfg.defaultSlaDays);

      if (newCat === "Corruption & Accountability") {
        setIsAnonymous(true);
      }
    }
  };

  // Handle AR capture callback
  const handleARCaptured = (anchor: ARAnchorData) => {
    setSpatialAnchor(anchor);
    setAddress(`Lat: ${anchor.lat}, Lng: ${anchor.lng} (Bearing ${anchor.headingDegrees}°), Ward 12`);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        citizenId: isAnonymous ? "anon-" + Date.now().toString(36) : "cit-101",
        citizenName: isAnonymous ? "Anonymous Whistleblower" : "Aarav Sharma",
        category,
        subcategory,
        department,
        description,
        isAnonymous,
        location: {
          lat: spatialAnchor?.lat || 12.9716,
          lng: spatialAnchor?.lng || 77.5946,
          headingDegrees: spatialAnchor?.headingDegrees || 0,
          pitch: spatialAnchor?.pitch || 0,
          roll: spatialAnchor?.roll || 0,
          accuracyMeters: spatialAnchor?.accuracy || 5,
          address,
        },
        capturePhotoUrl: spatialAnchor?.photoBase64 || (isVisualCategory ? "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80" : null),
        priority,
        slaDays,
        wardNumber: "Ward 12",
        zoneName: "Central Zone",
      };

      const res = await civicApi.submitGrievance(payload);
      if (!res.ok) {
        setSubmitError(res.error || "Submission failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/citizen/dashboard");
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error submitting grievance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              Universal Redressal Portal
            </span>
            {isAnonymous && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1">
                <Lock size={12} /> Anonymous Whistleblower Protected
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Report a Government Grievance
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Submit issues across all 10 departments with browser AR spatial proof and statutory SLA tracking.
          </p>
        </div>

        {/* AI Category Suggestion Banner if detected */}
        {aiSuggestion && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/70 dark:via-indigo-950/60 dark:to-purple-950/70 border border-blue-200 dark:border-blue-500/40 shadow-sm animate-fadeIn flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600 dark:text-cyan-400" />
                <span className="text-xs font-mono font-bold text-blue-700 dark:text-cyan-300 uppercase tracking-wider">
                  AI Category Suggestion ({Math.round(aiSuggestion.confidence * 100)}% Confidence)
                </span>
              </div>
              <div className="text-sm text-slate-900 dark:text-white font-semibold">
                {aiSuggestion.category} → <span className="text-blue-600 dark:text-blue-300">{aiSuggestion.subcategory}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Auto-routes to: <strong className="text-slate-900 dark:text-slate-200">{aiSuggestion.department}</strong> • Default SLA: {aiSuggestion.estimatedSlaDays} days
              </p>
            </div>

            <button
              type="button"
              onClick={handleApplyAISuggestion}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <CheckCircle2 size={14} /> Accept Suggestion
            </button>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-xl">
          {/* 1. Description & Voice-to-Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                Describe the Problem in Detail *
              </label>

              {/* Voice-to-Text Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700"
                }`}
                title="Speak to dictate your complaint"
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                <span>{isListening ? "Listening... Click to Stop" : "Voice-to-Text (बोलें)"}</span>
              </button>
            </div>

            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Broken water pipeline leaking millions of liters on 14th Cross road near government school..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />

            {speechError && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle size={13} /> {speechError}
              </p>
            )}
          </div>

          {/* 2. Category Taxonomy & Subcategory Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                1. Government Category (10 Taxonomies)
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as GrievanceCategory)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              >
                {CATEGORY_CONFIGS.map((cfg) => (
                  <option key={cfg.category} value={cfg.category}>
                    {cfg.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                2. Subcategory
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              >
                {activeConfig?.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto-Routed Department & SLA Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Building size={16} className="text-blue-600 dark:text-blue-400" />
              <div>
                <span className="text-slate-500 block text-[11px]">Auto-Routed Department</span>
                <span className="font-semibold text-slate-900 dark:text-white">{department}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={16} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-slate-500 block text-[11px]">Legal SLA Window</span>
                <span className="font-semibold text-slate-900 dark:text-white">{slaDays} Days (Automatic Escalation)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Shield size={16} className="text-purple-600 dark:text-purple-400" />
              <div>
                <span className="text-slate-500 block text-[11px]">Escalation Chain</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">Ward → Zonal → District → State</span>
              </div>
            </div>
          </div>

          {/* 3. Evidence Capture Flow */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {isVisualCategory ? (
                  <>
                    <Camera size={16} className="text-cyan-600 dark:text-cyan-400" />
                    AR Spatial Anchor Capture (Visual Category)
                  </>
                ) : (
                  <>
                    <Upload size={16} className="text-indigo-600 dark:text-indigo-400" />
                    Document &amp; Documentary Evidence Upload
                  </>
                )}
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isVisualCategory ? "Required for visual evidence" : "PDF, Images, or scanned docs"}
              </span>
            </div>

            {isVisualCategory ? (
              // VISUAL CATEGORIES 1-3 & 9: AR SPATIAL CAPTURE BUTTON
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {spatialAnchor ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 size={16} /> AR Spatial Anchor Locked
                      </span>
                    ) : (
                      "Browser AR Spatial Capture (WebXR / getUserMedia)"
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {spatialAnchor
                      ? `Lat: ${spatialAnchor.lat}°, Lng: ${spatialAnchor.lng}°, Heading: ${spatialAnchor.headingDegrees}°`
                      : "Captures GPS + Compass Heading + Leveling Reticle + Photo as a tamper-evident anchor."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsARModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center gap-2 transition whitespace-nowrap"
                >
                  <Camera size={16} />
                  {spatialAnchor ? "Re-open AR Viewport" : "Launch AR Camera"}
                </button>
              </div>
            ) : (
              // NON-VISUAL CATEGORIES 4-8 & 10: STRUCTURED DOCUMENT UPLOAD
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {evidenceFileName ? `Attached: ${evidenceFileName}` : "Upload Documentary Evidence"}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hospital discharge slip, school receipt, land patta application copy, audio/video file.
                  </p>
                </div>

                <label className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer flex items-center gap-2 transition">
                  <Upload size={16} />
                  <span>Choose File</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEvidenceFileName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* 4. Location Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin size={14} className="text-rose-500" />
              Incident Location / Landmark *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* 5. Anonymous Corruption Whistleblower Toggle (Feature 6) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Lock size={15} className="text-amber-500" />
                Anonymous Whistleblower Mode (Zero Profile Linkage)
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Encrypted submission with no ties to your citizen profile or phone number.
                Mandatory for &quot;Corruption &amp; Accountability&quot; complaints, routed exclusively to Anti-Corruption Bureau (ACB).
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
            </label>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Success */}
          {submitSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Grievance successfully submitted! Auto-routed to {department}. Redirecting...</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? "Submitting to Department Queue..." : "Submit Grievance to Official Queue"}
            </button>
          </div>
        </form>
      </main>

      {/* AR Capture Modal */}
      <ARCaptureModal
        isOpen={isARModalOpen}
        onClose={() => setIsARModalOpen(false)}
        onCapture={handleARCaptured}
        categoryName={category}
      />
    </div>
  );
}
