"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";

const initialState = {
  error: "",
};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Own the Digital
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">Admin Login</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sign in to manage your website content and blog posts.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          {state?.error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700"
            >
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter email address"
              required
              className="mt-1 block w-full rounded-md border border-zinc-200 px-3 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter password"
              required
              className="mt-1 block w-full rounded-md border border-zinc-200 px-3 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:bg-zinc-400"
          >
            {isPending ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
