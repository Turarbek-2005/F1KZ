"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { UserPlus } from "lucide-react";
import { useAppDispatch } from "@/shared/lib/hooks";
import { registerUser } from "@/entities/auth/model/authSlice";


export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function validate() {
    if (!username.trim() || !email.trim() || !password) {
      return "Please fill in all fields.";
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return "Invalid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(
        registerUser({ username: username.trim(), email: email.trim(), password })
      ).unwrap();

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 900);
    } catch (e: any) {
      setError(e || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="hidden md:flex bg-gradient-to-tr from-indigo-600 to-blue-700 w-100 relative">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src="/register-image.jpeg"
              alt="Formula 1 car"
              fill
              className="object-cover opacity-85"
            />
          </motion.div>
        </div>

        <form
          onSubmit={handleRegister}
          className="w-90 sm:w-110 md:w-96 p-8 flex flex-col m-auto gap-4"
          aria-labelledby="register-heading"
        >
          <h2
            id="register-heading"
            className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2"
          >
            <UserPlus className="w-6 h-6 text-blue-600" /> Create Account
          </h2>

          <label className="text-sm text-gray-600 dark:text-gray-300" htmlFor="username">
            Username
          </label>
          <Input
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            className="focus:ring-2 focus:ring-blue-500"
            autoComplete="username"
            required
          />

          <label className="text-sm text-gray-600 dark:text-gray-300" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            className="focus:ring-2 focus:ring-blue-500"
            autoComplete="email"
            required
          />

          <label className="text-sm text-gray-600 dark:text-gray-300" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            type="password"
            className="focus:ring-2 focus:ring-blue-500"
            autoComplete="new-password"
            minLength={6}
            required
          />

          <label className="text-sm text-gray-600 dark:text-gray-300" htmlFor="confirm">
            Confirm Password
          </label>
          <Input
            id="confirm"
            name="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            type="password"
            className="focus:ring-2 focus:ring-blue-500"
            autoComplete="new-password"
            minLength={6}
            required
          />

          {error && (
            <div role="alert" className="text-sm text-red-600 mt-1">
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="text-sm text-green-600 mt-1">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            aria-disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {loading ? "Loading..." : "Register"}
          </Button>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
