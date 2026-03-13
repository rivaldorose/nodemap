"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-800">NodeMap</h1>
          <p className="text-slate-500">
            Map your network. Visualize connections.
          </p>
        </div>
        <button
          onClick={() => signIn("google")}
          className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
