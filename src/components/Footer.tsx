import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white-50 border-t border-gray-200 mt-auto z-0">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Logo and Description */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={28}
                height={28}
                className="w-6 h-6 rounded-full"
              />
            </Link>
            <span className="text-base font-bold text-yellow-500">BaldSphere</span>
          </div>

          {/* Support (aligned to right on desktop) */}
          <div className="text-right">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-1">
              Support
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-yellow-500 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 lg:mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">© 2025 BaldSphere</p>
          <div className="mt-2 sm:mt-0 flex items-center gap-4">
            <span className="text-xs text-gray-400">
              Powered by Next.js & Three.js
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
