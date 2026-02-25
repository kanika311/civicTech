"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@/lib/yupResolver";
import * as yup from "yup";
import { citizenApi } from "@/lib/api";
import Navbar from "../../component/Navbar";

const COMPLAINT_CATEGORIES = [
  "Road & Infrastructure",
  "Water Supply",
  "Electricity",
  "Sanitation",
  "Traffic",
  "Public Safety",
  "Environment",
  "Animal Control",
  "Government Services",
  "Other",
] as const;

type FormData = {
  title: string;
  category: string;
  description: string;
  location: string;
};

const schema = yup.object({
  title: yup.string().required("Complaint title is required"),
  category: yup.string().required("Select a category"),
  description: yup
    .string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  location: yup.string().required("Location is required"),
});

export default function SubmitComplaintPage() {
  const router = useRouter();
  const photosRef = useRef<HTMLInputElement>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("category", data.category);
    formData.append("description", data.description);
    formData.append("location", data.location);

    const files = photosRef.current?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append("photos", files[i]);
      }
    }

    const result = await citizenApi.submitComplaint(formData);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    reset();
    if (photosRef.current) photosRef.current.value = "";
    router.push("/citizen/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">
            Submit Complaint
          </h1>
          <p className="text-gray-600">
            Report an issue in your area for authorities to resolve.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Complaint Title</label>
              <input
                {...register("title")}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Broken road near school"
              />
              <p className="text-red-500 text-sm mt-1">{errors.title?.message}</p>
            </div>

            <div>
              <label className="block font-medium mb-1">Category</label>
              <select
                {...register("category")}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select category</option>
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <p className="text-red-500 text-sm mt-1">{errors.category?.message}</p>
            </div>

            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Explain the issue in detail..."
              />
              <p className="text-red-500 text-sm mt-1">
                {errors.description?.message}
              </p>
            </div>

            <div>
              <label className="block font-medium mb-1">Location</label>
              <input
                {...register("location")}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="City / Area / Address"
              />
              <p className="text-red-500 text-sm mt-1">
                {errors.location?.message}
              </p>
            </div>

            <div>
              <label className="block font-medium mb-1">Photos (optional)</label>
              <input
                ref={photosRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600"
              />
              <p className="text-gray-500 text-sm mt-1">
                JPEG, PNG, GIF or WebP. Up to 10 images, 5MB each.
              </p>
            </div>

            {submitError && (
              <p className="text-red-500 text-sm">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-7 py-3 rounded-xl transition disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
