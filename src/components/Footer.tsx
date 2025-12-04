import { Instagram, Youtube, Twitter, Linkedin } from "lucide-react";

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
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
              <span className="font-heading text-xl font-bold tracking-tight">
                Prime<span className="text-accent">Forge</span>
              </span>
            </a>
            <p className="text-background/70 text-sm mb-6 max-w-xs leading-relaxed">
              The premier fitness platform for men over 40. Transform your body,
              optimize your health, and live your best years.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-md bg-background/10 flex items-center justify-center text-background/70 hover:text-background hover:bg-background/20 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4 text-sm">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-background/60 hover:text-background transition-colors"
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
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} Prime Forge. All rights reserved.
          </p>
          <p className="text-xs text-background/50">
            Affiliate Disclosure: We may earn commissions from qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
