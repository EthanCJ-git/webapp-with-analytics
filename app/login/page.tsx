import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Login</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Owner sign-in for the analytics dashboard isn&apos;t wired up yet.
      </p>
    </div>
  );
}
