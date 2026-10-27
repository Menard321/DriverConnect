"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  Car,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/account/dashboard";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in, navigate straight to the destination
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        window.location.href = redirectTarget;
      }
    });
  }, [redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Perform hard navigation so cookies are immediately attached to Next.js middleware
        window.location.href = redirectTarget;
        return;
      } else {
        // Sign Up with profile initialization
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (authData.user) {
          // Initialize profile record with 0 balance if table exists
          try {
            await supabase.from("profiles").upsert({
              id: authData.user.id,
              full_name: fullName,
              phone: phone,
              wallet_balance: 0.0,
              role: "customer",
            });
          } catch (profileErr) {
            console.warn("Public profiles table notice:", profileErr);
          }
        }

        // If email confirmation is required and no session created yet
        if (!authData.session) {
          setSuccessMessage(
            "Account created successfully! If email verification is active on your Supabase project, please check your inbox (menardjoseph774@gmail.com). You can also click 'Sign In' below to login."
          );
          setMode("signin");
          return;
        }

        router.push(redirectTarget);
        router.refresh();
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
        setErrorMessage(
          "Could not reach Supabase servers. Please check your network connection."
        );
      } else {
        setErrorMessage(msg || "Authentication request failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <Car className="w-7 h-7 text-slate-950" />
        </div>
        <h1 className="text-2xl font-black text-white">
          {mode === "signin" ? "Sign In to DriverConnect" : "Create Customer Account"}
        </h1>
        <p className="text-xs text-slate-400">
          {mode === "signin"
            ? "Access your rentals, workshop bookings, and digital TZS wallet."
            : "Join Tanzania's premier automotive hub."}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-medium space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>Authentication Alert</span>
          </div>
          <p className="text-[11px] leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Registration Successful</span>
          </div>
          <p className="text-[11px] leading-relaxed">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Joseph Mhema"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Phone Number (for M-Pesa / Tigo Pesa)
              </label>
              <input
                type="tel"
                required
                placeholder="+255 700 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="you@domain.co.tz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>{mode === "signin" ? "Sign In & Continue" : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
        {mode === "signin" ? (
          <p>
            Don&apos;t have an account yet?{" "}
            <button
              onClick={() => {
                setMode("signup");
                setErrorMessage(null);
              }}
              className="font-bold text-amber-400 hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        ) : (
          <p>
            Already registered?{" "}
            <button
              onClick={() => {
                setMode("signin");
                setErrorMessage(null);
              }}
              className="font-bold text-amber-400 hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
