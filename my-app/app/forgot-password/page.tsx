"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Yup Schema
  const schema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email address")
      .required("Email is required"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await schema.validate({ email });
      setError("");

      // Simulated API delay
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6">

      <div className="bg-white shadow-xl rounded-3xl w-full max-w-md p-10">

        {!success ? (
          <>
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-blue-700">
                Reset Password
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Enter your registered email and we'll send reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full text-sm text-blue-600 hover:underline mt-2"
              >
                Back to Login
              </button>

            </form>
          </>
        ) : (
          // ✅ Success State
          <div className="text-center space-y-4">
            <div className="text-green-600 text-4xl">✓</div>
            <h2 className="text-xl font-semibold text-gray-800">
              Check Your Email
            </h2>
            <p className="text-gray-500 text-sm">
              If an account exists with this email, a password reset link
              has been sent.
            </p>

            <button
              onClick={() => router.push("/login")}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Return to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}