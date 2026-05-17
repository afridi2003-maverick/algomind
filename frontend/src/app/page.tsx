import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 mb-8 text-center">
          AlgoMind AI
        </h1>
        <p className="text-xl text-center mb-12 text-gray-300">
          Interactive Algorithm Simulation Lab. Master graph algorithms through visual execution and AI guidance.
        </p>
        <div className="flex justify-center gap-6">
          <Link
            href="/simulator"
            className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-full transition-all transform hover:scale-105"
          >
            Enter Simulator
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-transparent border-2 border-teal-500 hover:bg-teal-500 hover:text-black font-bold rounded-full transition-all transform hover:scale-105"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
