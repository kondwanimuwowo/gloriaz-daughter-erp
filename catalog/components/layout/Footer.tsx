import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const address = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS;
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE;
  const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL;
  const instagram = process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM;
  const facebook = process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK;
  const twitter = process.env.NEXT_PUBLIC_SOCIAL_TWITTER;

  const hasSocials = instagram || facebook || twitter;
  const hasContact = address || phone || email;

  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-bold text-primary">Gloria&apos;s Daughter</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Bespoke fashion and premium tailoring, crafted to perfection for the modern individual.
          </p>
          {hasSocials && (
            <div className="flex gap-4 pt-2">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {twitter && (
                <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">Quick Links</h4>
          <nav className="flex flex-col gap-2">
            <Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">Home</Link>
            <Link href="/catalog" className="text-sm text-muted-foreground hover:text-white transition-colors">Collection</Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-white transition-colors">Our Story</Link>
            <Link href="/catalog?filter=ready-to-wear" className="text-sm text-muted-foreground hover:text-white transition-colors">Ready to Wear</Link>
          </nav>
        </div>

        {hasContact && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</h4>
            <div className="flex flex-col gap-3">
              {address && (
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <span>{address}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <span>{phone}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <span>{email}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="container mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-white/10 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Gloria&apos;s Daughter. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
