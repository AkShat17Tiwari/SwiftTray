import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a] relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[20%] left-[15%] w-96 h-96 rounded-full blur-3xl bg-indigo-500/10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full blur-3xl bg-purple-500/8 pointer-events-none" />

      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#0f1629]/80 backdrop-blur-xl border border-white/10 shadow-2xl",
          },
        }}
      />
    </div>
  );
}
