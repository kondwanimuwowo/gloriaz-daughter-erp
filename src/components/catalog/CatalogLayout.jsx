import { Outlet, Link } from "react-router-dom";
import { ShoppingBag, Phone, Mail, Instagram, Facebook } from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";

export default function CatalogLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFEF7]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/catalog" className="flex items-center gap-2 group">
              <ShoppingBag className="h-8 w-8 text-[#8B4513] group-hover:text-[#A0522D] transition-colors" />
              <span className="text-2xl font-['Playfair_Display'] font-bold text-[#2C2C2C]">
                Gloria's Daughter
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/catalog"
                className="text-[#2C2C2C] hover:text-[#8B4513] font-medium transition-colors"
              >
                All Products
              </Link>
              <a
                href="#categories"
                className="text-[#2C2C2C] hover:text-[#8B4513] font-medium transition-colors"
              >
                Categories
              </a>
              <a
                href="#about"
                className="text-[#2C2C2C] hover:text-[#8B4513] font-medium transition-colors"
              >
                About Us
              </a>
              <a
                href="tel:+260976999510"
                className="flex items-center gap-2 text-[#2C2C2C] hover:text-[#8B4513] font-medium transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden lg:inline">Contact</span>
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-[#2C2C2C] hover:text-[#8B4513]">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#2C2C2C] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-xl font-['Playfair_Display'] font-bold mb-4 text-[#D4AF37]">
                Gloria's Daughter
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Celebrating Zambian heritage through contemporary fashion. 
                Each piece is crafted with love, honoring tradition while embracing modern style.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#D4AF37]">Contact Us</h3>
              <div className="space-y-3 text-sm">
                <a
                  href="tel:+260976999510"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +260 976 999 510
                </a>
                <a
                  href="mailto:info@gloriazsdaughter.com"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  info@gloriazsdaughter.com
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#D4AF37]">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Gloria's Daughter. Made with ❤️ in Zambia.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </div>
  );
}
