"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("citizen");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const loginSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters required")
      .required("Password is required"),
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginSchema.validate(formData, { abortEarly: false });
      setErrors({});

      setTimeout(() => {
        if (role === "citizen") {
          router.push("/citizen/dashboard");
        } else {
          router.push("/govenmnet/dashboard");
        }
      }, 1000);

    } catch (validationErrors) {
      const formattedErrors = {};
      validationErrors.inner.forEach((err) => {
        formattedErrors[err.path] = err.message;
      });
      setErrors(formattedErrors);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6">

      {/* Card */}
      <div className="bg-white shadow-xl rounded-3xl w-full max-w-md p-10">

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700 tracking-tight">
            CivicTrack
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Smart Civic Issue Management Platform
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="example@email.com"
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Role Toggle */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex bg-gray-100 rounded-full p-1 text-sm">
              <button
                type="button"
                onClick={() => setRole("citizen")}
                className={`px-4 py-1 rounded-full transition ${
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
                className={`px-4 py-1 rounded-full transition ${
                  role === "government"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                Government
              </button>
            </div>

            <button
              type="button"
              className="text-xs text-blue-600 hover:underline"
                onClick={() => router.push("/forgot-password")}
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-md disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Register */}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full border border-blue-600 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50 transition"
          >
            Create an Account
          </button>

        </form>
      </div>
    </div>
  );
}