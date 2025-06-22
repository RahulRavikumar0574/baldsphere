import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-3 lg:top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95vw] lg:w-[90vw] max-w-6xl bg-white/10 rounded-xl lg:rounded-2xl shadow-lg px-4 lg:px-12 py-3 lg:py-4 flex items-center justify-between lg:gap-8 backdrop-blur border border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src="/logo.svg" alt="Logo" width={32}
            height={32}
            className="lg:w-8 lg:h-8 w-6 h-6 rounded-full"
          />
        </Link>
        <span className="text-lg lg:text-2xl font-bold text-yellow-500">BaldSphere</span>
      </div>

      {/* Links */}
      <div className="flex gap-3 lg:gap-6">
        <Link href="/" className="text-gray-800 hover:text-yellow-500 transition text-sm lg:text-base">Home</Link>
        <Link href="/chat" className="text-gray-800 hover:text-yellow-500 transition text-sm lg:text-base">Chat</Link>
        <Link href="/how-it-works" className="text-gray-800 hover:text-yellow-500 transition text-sm lg:text-base hidden sm:block">How It Works</Link>
        <Link href="/history" className="text-gray-800 hover:text-yellow-500 transition text-sm lg:text-base hidden md:block">History</Link>
        <Link href="/contact" className="text-gray-800 hover:text-yellow-500 transition text-sm lg:text-base hidden md:block">Contact</Link>
      </div>
    </nav>
  );
}