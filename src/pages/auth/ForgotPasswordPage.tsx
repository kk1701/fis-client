import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios";

const schema = z.object({
  email: z.string().email("Invalid email"),
});

type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      setServerError("");
      await api.post("/auth/forgot-password", { email: data.email });
      setSent(true);
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? "Something went wrong");
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Check your email
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a 6-digit OTP to <strong>{getValues("email")}</strong>. It
            expires in 10 minutes.
          </p>
          <button
            onClick={() =>
              navigate("/verify-otp", { state: { email: getValues("email") } })
            }
            className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Enter OTP →
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Didn't receive it?{" "}
            <button
              onClick={() => setSent(false)}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your registered email to receive an OTP
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="you@university.ac.in"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
