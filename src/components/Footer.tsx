import { Dumbbell, Instagram, Youtube, Twitter, Facebook } from "lucide-react";

const footerLinks = {
  Programs: ["Foundation Builder", "Prime Strength", "Metabolic Reset", "Custom Plans"],
  Resources: ["Articles", "Supplement Guide", "Gear Reviews", "Free Downloads"],
  Company: ["About Us", "Affiliate Program", "Careers", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Disclaimer", "Cookie Policy"],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
];

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_0_20px_hsla(38,92%,50%,0.3)]">
                <Dumbbell className="w-5 h-5 text-background" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight">
                Prime<span className="text-primary">Fit</span>
              </span>
            </a>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              The premier fitness platform for men over 40. Transform your body,
              optimize your health, and live your best years.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PrimeFit. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Affiliate Disclosure: We may earn commissions from qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
