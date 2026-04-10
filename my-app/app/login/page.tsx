"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";
import { authApi } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, setLoading, setError } from "@/store/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [role, setRole] = useState<"citizen" | "government">("citizen");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoadingState] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    governmentId: "",
    password: "",
  });

  const loginSchema = Yup.object({
    password: Yup.string()
      .min(6, "Minimum 6 characters required")
      .required("Password is required"),
    email:
      role === "citizen"
        ? Yup.string()
            .email("Enter valid email")
            .required("Email is required")
        : Yup.string().notRequired(),
    governmentId:
      role === "government"
        ? Yup.string().required("Government ID is required")
        : Yup.string().notRequired(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingState(true);
    setErrors({});
    dispatch(setError(null));

    try {
      await loginSchema.validate(formData, { abortEarly: false });
      const email = role === "citizen" ? formData.email : formData.governmentId;

      const result = await authApi.login({
        email,
        password: formData.password,
      });

      if (!result.ok) {
        const isNetwork =
          result.error.includes("fetch") ||
          result.error.includes("Network") ||
          result.error.includes("Failed");
        setErrors({
          submit: isNetwork
            ? "Cannot connect to server. Is the backend running at " +
              (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
              "?"
            : result.error,
        });
        dispatch(setError(result.error));
        return;
      }

      const { token, role: userRole } = result.data;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("token", token);
      }
      dispatch(setCredentials({ token, role: userRole }));

      router.push(
        userRole === "government" ? "/govenmnet/dashboard" : "/citizen/dashboard"
      );
    } catch (validationErrors: unknown) {
      const formattedErrors: Record<string, string> = {};
      if (
        validationErrors &&
        typeof validationErrors === "object" &&
        "inner" in validationErrors &&
        Array.isArray(
          (
            validationErrors as {
              inner: { path?: string; message?: string }[];
            }
          ).inner
        )
      ) {
        (
          validationErrors as {
            inner: { path?: string; message?: string }[];
          }
        ).inner.forEach((err: { path?: string; message?: string }) => {
          if (err.path && err.message) formattedErrors[err.path] = err.message;
        });
      } else {
        formattedErrors.submit = "Something went wrong. Please try again.";
      }
      setErrors(formattedErrors);
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6">
      <div className="bg-white shadow-xl rounded-3xl w-full max-w-md p-10">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          CivicTrack Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex bg-gray-100 rounded-full p-1 text-sm">
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

          {role === "citizen" ? (
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>
          ) : (
            <div>
              <input
                name="governmentId"
                placeholder="Government ID (same as when you registered)"
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              />
              {errors.governmentId && (
                <p className="text-red-500 text-xs">
                  {errors.governmentId}
                </p>
              )}
            </div>
          )}

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 border rounded-xl"
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>

          {errors.submit && (
            <p className="text-red-500 text-sm text-center">{errors.submit}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full text-blue-600 mt-3"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
