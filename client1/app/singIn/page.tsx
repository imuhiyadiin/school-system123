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
      const data = await authLogIn({ email, password }).unwrap();
      toast.success(data.message);
      route.replace("/dashboud");
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
    <div className="mt-8 flex min-h-screen items-center justify-center bg-black px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900 p-5 shadow-2xl sm:p-8">

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-zinc-400 text-center mb-8">
          Sign in to your account
        </p>

        <form className="space-y-5" onSubmit={handeLogin}>

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-zinc-400" size={20} />

            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-black border border-white/20 text-white 
              rounded-xl py-3 pl-12 pr-4 outline-none
              focus:border-white transition"
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
              className="w-full bg-black border border-white/20 text-white 
              rounded-xl py-3 pl-12 pr-4 outline-none
              focus:border-white transition"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>


          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="text-zinc-400 flex gap-2">
              <input type="checkbox" />
              Remember me
            </label>

            <a className="text-white hover:underline cursor-pointer">
              Forgot password?
            </a>
          </div>


          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl
            hover:bg-zinc-200 transition duration-300"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

        </form>


        <p className="text-zinc-400 text-center mt-6">
          Don&apos;t have an account?
          <Link href="/singup">
            <span className="text-white ml-2 cursor-pointer">
            Sign Up
          </span>
          </Link>
          
        </p>

      </div>
    </div>
  );
}
