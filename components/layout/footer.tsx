import Link from "next/link";
import { Shield } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-gray-900">Syspec Drop</span>
            </div>
            <p className="text-sm text-gray-600">
              Anonymous whistleblower platform with quantum-secure encryption.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
            <Link
              href="/docs"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="https://github.com/yourusername/syspec-drop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="/faq"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              FAQ
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <Link
              href="/privacy"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </Link>
            <p className="text-xs text-gray-600">NIST/ISO Compliant</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © {currentYear} Syspec Drop. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
};
