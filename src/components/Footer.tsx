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
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <a href="/" className="inline-block mb-8">
              <span className="text-lg font-medium tracking-[0.25em] uppercase">
                Fortivus
              </span>
            </a>
            <p className="text-background/60 text-sm mb-8 max-w-xs leading-relaxed">
              The premier fitness platform for men over 40. Transform your body,
              optimize your health, and live your best years.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 border border-background/20 flex items-center justify-center text-background/60 hover:text-background hover:border-background/40 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-medium tracking-[0.15em] uppercase mb-6">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-background/50 hover:text-background transition-colors"
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
          <p className="text-xs text-background/50 tracking-wide">
            © {new Date().getFullYear()} Fortivus. All rights reserved.
          </p>
          <p className="text-xs text-background/40">
            Affiliate Disclosure: We may earn commissions from qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
