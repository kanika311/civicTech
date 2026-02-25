"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"citizen" | "government">("citizen");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    governmentId: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  const registerSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    email:
      role === "citizen"
        ? Yup.string().email("Invalid email").required("Email is required")
        : Yup.string().notRequired(),
    governmentId:
      role === "government"
        ? Yup.string().required("Government ID is required")
        : Yup.string().notRequired(),
    phone:
      role === "citizen"
        ? Yup.string()
            .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
            .required("Phone is required")
        : Yup.string().notRequired(),
    address:
      role === "citizen"
        ? Yup.string().required("Address is required")
        : Yup.string().notRequired(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    try {
      await registerSchema.validate(formData, { abortEarly: false });
    } catch (validationErrors: unknown) {
      const formattedErrors: Record<string, string> = {};
      if (
        validationErrors &&
        typeof validationErrors === "object" &&
        "inner" in validationErrors &&
        Array.isArray(
          (validationErrors as { inner: { path?: string; message?: string }[] })
            .inner
        )
      ) {
        (
          validationErrors as {
            inner: { path?: string; message?: string }[];
          }
        ).inner.forEach((err: { path?: string; message?: string }) => {
          if (err.path && err.message) formattedErrors[err.path] = err.message;
        });
      }
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);

    if (role === "government") {
      const result = await authApi.registerGovernment({
        governmentId: formData.governmentId.trim(),
        name: formData.name,
        password: formData.password,
        phone: formData.phone?.trim() || undefined,
        address: formData.address?.trim() || undefined,
      });
      setLoading(false);
      if (!result.ok) {
        setErrors({ submit: result.error });
        return;
      }
      router.push("/login");
      return;
    }

    const result = await authApi.register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
    });
    setLoading(false);

    if (!result.ok) {
      setErrors({ submit: result.error });
      return;
    }

    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Register for CivicTrack
        </h2>

        <div className="flex bg-gray-100 rounded-full p-1 mb-6 text-sm">
          <button
            type="button"
            onClick={() => setRole("citizen")}
            className={`flex-1 py-2 rounded-full ${
              role === "citizen" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => setRole("government")}
            className={`flex-1 py-2 rounded-full ${
              role === "government"
                ? "bg-blue-600 text-white"
                : "text-gray-600"
            }`}
          >
            Government
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg"
            value={formData.name ?? ""}
            onChange={handleChange}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name}</p>
          )}

          {role === "citizen" ? (
            <>
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded-lg"
                value={formData.email ?? ""}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
              <input
                name="phone"
                placeholder="Phone (10 digits)"
                maxLength={10}
                className="w-full p-3 border rounded-lg"
                value={formData.phone ?? ""}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
              <input
                name="address"
                placeholder="Address"
                className="w-full p-3 border rounded-lg"
                value={formData.address ?? ""}
                onChange={handleChange}
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address}</p>
              )}
            </>
          ) : (
            <>
              <input
                name="governmentId"
                placeholder="Government ID (you’ll use this to log in)"
                className="w-full p-3 border rounded-lg"
                onChange={handleChange}
                value={formData.governmentId ?? ""}
              />
              {errors.governmentId && (
                <p className="text-red-500 text-sm">
                  {errors.governmentId}
                </p>
              )}
              <p className="text-gray-500 text-xs">
                You’ll use this ID and your password to log in on the Login page (Government tab).
              </p>
            </>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            value={formData.password ?? ""}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full p-3 border rounded-lg"
            value={formData.confirmPassword ?? ""}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
          )}

          {errors.submit && (
            <p className="text-red-500 text-sm text-center">{errors.submit}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
