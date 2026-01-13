"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { LogIn } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { loginUser } from "@/entities/auth/model/authSlice";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const { user } = auth;

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const loading = auth.status === "loading";

  useEffect(() => {
    console.log("Auth user:", user); 
    if (user) {
      router.push("/");
    }
  }, [user, router]); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!usernameOrEmail.trim() || !password) {
      setLocalError("Please enter username/email and password.");
      return;
    }

    const res = await dispatch(
      loginUser({ usernameOrEmail: usernameOrEmail.trim(), password })
    );

    if (loginUser.fulfilled.match(res)) {
      console.log(res);
      router.push("/");
    } else {
      const msg = (res.payload as string) || res.error?.message || "Login failed";
      setLocalError(String(msg));
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-linear-to-tr from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col md:flex-row min-h-80 md:min-h-100 bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="hidden md:flex bg-linear-to-tr from-indigo-500 to-blue-600 w-80 relative">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src="/login-image.jpeg"
              alt="F1 car"
              fill
              className="object-cover opacity-80"
            />
          </motion.div>
        </div>

        <form
          onSubmit={handleLogin}
          className="w-full md:w-96 p-8 flex flex-col gap-4 justify-center m-auto"
          aria-labelledby="login-heading"
        >
          <h3
            id="login-heading"
            className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2"
          >
            <LogIn className="w-6 h-6 text-blue-600" /> Login
          </h3>

          <Input
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            type="text"
            placeholder="Username or Email"
            className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
            autoComplete="username"
            required
          />

          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
            autoComplete="current-password"
            required
          />

          {(localError || auth.error) && (
            <div role="alert" className="text-sm text-red-600">
              {localError ?? auth.error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            aria-disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </Button>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
