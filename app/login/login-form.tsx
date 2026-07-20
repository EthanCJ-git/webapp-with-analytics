"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-zinc-600 dark:text-zinc-400">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-950 dark:border-white/10 dark:focus:border-zinc-50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-zinc-600 dark:text-zinc-400">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-950 dark:border-white/10 dark:focus:border-zinc-50"
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
