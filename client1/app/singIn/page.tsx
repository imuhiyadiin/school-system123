"use client";

import { useAuthLoginMutation } from "@/services/auth/authApi";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export default function SignIn() {

    const [authLogIn, { isLoading }] =
    useAuthLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const route = useRouter();
  const handeLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const data = await authLogIn({ email: email.trim().toLowerCase(), password }).unwrap();
      toast.success(data.message);
      route.replace(data.user.role === "TEACHER" ? "/dashboud/exams" : "/dashboud");
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "data" in error &&
        typeof error.data === "object" && error.data !== null && "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Unable to sign in. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="mt-8 flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 transition-colors dark:bg-black">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-zinc-900">

        <h1 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-white">
          Welcome Back
        </h1>

        <p className="mb-8 text-center text-slate-500 dark:text-zinc-400">
          Sign in to your account
        </p>

        <form className="space-y-5" onSubmit={handeLogin}>

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-zinc-400" size={20} />

            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-4 pl-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 dark:border-white/20 dark:bg-black dark:text-white dark:focus:border-white"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>


          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-zinc-400" size={20} />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-4 pl-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 dark:border-white/20 dark:bg-black dark:text-white dark:focus:border-white"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>


          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="flex gap-2 text-slate-500 dark:text-zinc-400">
              <input type="checkbox" />
              Remember me
            </label>

            <a className="cursor-pointer text-blue-700 hover:underline dark:text-white">
              Forgot password?
            </a>
          </div>


          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-700 py-3 font-semibold text-white transition duration-300 hover:bg-blue-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

        </form>


        <p className="mt-6 text-center text-slate-500 dark:text-zinc-400">
          Don&apos;t have an account?
          <Link href="/singup">
            <span className="ml-2 cursor-pointer text-blue-700 dark:text-white">
            Sign Up
          </span>
          </Link>
          
        </p>

      </div>
    </div>
  );
}
