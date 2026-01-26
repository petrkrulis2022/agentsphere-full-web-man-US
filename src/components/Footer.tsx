import { Github, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer
      style={{ backgroundColor: "rgb(15, 23, 42)" }}
      className="text-white"
    >
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo and Name */}
          <div className="flex items-center">
            <img
              src="/AR_VIEWER_INTEGRATION_PACKAGE/cubepay_simple_cube.gif"
              alt="CubePay"
              className="h-8 w-auto mr-2"
            />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
              CubePay
            </span>
          </div>

          {/* Description */}
          <p className="text-center text-sm text-gray-400">
            powered by blockchain
          </p>

          {/* Social Icons */}
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright and Links */}
          <div className="flex flex-col items-center space-y-3 pt-4 border-t border-gray-700 w-full">
            <p className="text-gray-400 text-xs">
              &copy; {new Date().getFullYear()} CubePay. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-xs"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-xs"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-xs"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
