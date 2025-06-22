'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-3 lg:top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95vw] lg:w-[90vw] max-w-6xl bg-white/10 rounded-xl lg:rounded-2xl shadow-lg px-4 lg:px-12 py-3 lg:py-4 flex items-center justify-between backdrop-blur border border-gray-200">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" onClick={closeMenu}>
            <Image src="/logo.svg" alt="Logo" width={32}
              height={32}
              className="lg:w-8 lg:h-8 w-6 h-6 rounded-full"
            />
          </Link>
          <span className="text-lg lg:text-2xl font-bold text-yellow-500">BaldSphere</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6">
          <Link href="/" className="text-gray-800 hover:text-yellow-500 transition text-base font-medium">Home</Link>
          <Link href="/chat" className="text-gray-800 hover:text-yellow-500 transition text-base font-medium">Chat</Link>
          <Link href="/how-it-works" className="text-gray-800 hover:text-yellow-500 transition text-base font-medium">How It Works</Link>
          <Link href="/history" className="text-gray-800 hover:text-yellow-500 transition text-base font-medium">History</Link>
          <Link href="/contact" className="text-gray-800 hover:text-yellow-500 transition text-base font-medium">Contact</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeMenu}
        >
          <div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-sm bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-800 hover:text-yellow-500 transition text-lg font-medium py-2 px-4 rounded-lg hover:bg-yellow-50"
                onClick={closeMenu}
              >
                🏠 Home
              </Link>
              <Link
                href="/chat"
                className="text-gray-800 hover:text-yellow-500 transition text-lg font-medium py-2 px-4 rounded-lg hover:bg-yellow-50"
                onClick={closeMenu}
              >
                💬 Chat
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-800 hover:text-yellow-500 transition text-lg font-medium py-2 px-4 rounded-lg hover:bg-yellow-50"
                onClick={closeMenu}
              >
                ❓ How It Works
              </Link>
              <Link
                href="/history"
                className="text-gray-800 hover:text-yellow-500 transition text-lg font-medium py-2 px-4 rounded-lg hover:bg-yellow-50"
                onClick={closeMenu}
              >
                📚 History
              </Link>
              <Link
                href="/contact"
                className="text-gray-800 hover:text-yellow-500 transition text-lg font-medium py-2 px-4 rounded-lg hover:bg-yellow-50"
                onClick={closeMenu}
              >
                📞 Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}