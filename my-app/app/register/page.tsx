"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"citizen" | "government">("citizen");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    governmentId: "",
    password: "",
    confirmPassword: "",
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setErrors({});
      alert("Registration successful!");
      router.push("/login");
    } catch (validationErrors: any) {
      const formattedErrors: Record<string, string> = {};
      validationErrors.inner?.forEach((err: any) => {
        formattedErrors[err.path] = err.message;
      });
      setErrors(formattedErrors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Register for CivicTrack
        </h2>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-6 text-sm">
          <button
            type="button"
            onClick={() => setRole("citizen")}
            className={`flex-1 py-2 rounded-full ${
              role === "citizen"
                ? "bg-blue-600 text-white"
                : "text-gray-600"
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
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          {role === "citizen" ? (
            <>
              <input
                name="email"
                placeholder="Email"
                className="w-full p-3 border rounded-lg"
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </>
          ) : (
            <>
              <input
                name="governmentId"
                placeholder="Government ID"
                className="w-full p-3 border rounded-lg"
                onChange={handleChange}
              />
              {errors.governmentId && (
                <p className="text-red-500 text-sm">
                  {errors.governmentId}
                </p>
              )}
            </>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
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
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Register
          </button>

        </form>
      </div>
    </div>
  );
}