import { Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  Platform: [
    { label: "Member Dashboard", href: "/dashboard" },
    { label: "Knowledge Hub", href: "/knowledge" },
    { label: "Forum", href: "/forum" },
    { label: "Community", href: "/community" },
  ],
  "Elite Features": [
    { label: "AI Coach", href: "/coaching" },
    { label: "Workouts", href: "/workouts" },
    { label: "Run Tracker", href: "/running" },
    { label: "Calorie Tracker", href: "/calories" },
    { label: "Body Analysis", href: "/body-analysis" },
    { label: "Progress Photos", href: "/progress" },
  ],
  "More Features": [
    { label: "Hormonal Optimization", href: "/hormonal" },
    { label: "Joint Health Analytics", href: "/joint-health" },
    { label: "Sleep-Adaptive Workouts", href: "/sleep-adaptive" },
    { label: "Comeback Protocol", href: "/comeback" },
    { label: "Executive Performance", href: "/executive-mode" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Pricing", href: "/pricing" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/Fortivus.Fitness", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/Fortivus.Fitness", label: "Facebook" },
];

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-8">
              <span className="text-lg font-heading font-semibold tracking-wide">
                Fortivus
              </span>
            </Link>
            <p className="text-background/60 text-sm mb-4 max-w-xs leading-relaxed">
              Faith-driven fitness for Christian men over 40. Steward your body as a temple,
              optimize your health, and serve God with strength.
            </p>
            <p className="text-background/40 text-xs italic mb-8 max-w-xs">
              "Do you not know that your bodies are temples of the Holy Spirit?" — 1 Cor 6:19
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
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-background/50 hover:text-background transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tithing Notice */}
        <div className="py-6 mb-8 border-y border-background/10 text-center">
          <p className="text-sm text-background/70 font-medium">
            ✝ 10% of all proceeds go to support local churches and Christian ministries
          </p>
          <p className="text-xs text-background/40 mt-1 italic">
            "Honor the LORD with your wealth and with the firstfruits of all your produce" — Proverbs 3:9
          </p>
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