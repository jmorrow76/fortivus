import { Link } from "react-router-dom";
import { BookOpen, Users, Home, Briefcase } from "lucide-react";

const pillars = [
  {
    icon: BookOpen,
    title: "Faith & Scripture",
    description:
      "Daily scripture, prayer journaling, and devotional rhythms that anchor the rest of your life.",
    verse: "Proverbs 3:5-6",
    link: "/dashboard",
  },
  {
    icon: Users,
    title: "Brotherhood",
    description:
      "Forums, accountability partners, and testimonies. Men who show up for each other, not just for workouts.",
    verse: "Proverbs 27:17",
    link: "/forum",
  },
  {
    icon: Home,
    title: "Family & Fatherhood",
    description:
      "Lead your marriage and your children well. Wisdom and community for the men at the head of a home.",
    verse: "Joshua 24:15",
    link: "/forum",
  },
  {
    icon: Briefcase,
    title: "Work & Strength",
    description:
      "Discipline in your calling and in your training—so your body can carry the weight of your purpose.",
    verse: "Colossians 3:23",
    link: "/knowledge-hub",
  },
];

const Pillars = () => {
  return (
    <section id="pillars" className="section-padding">
      <div className="container mx-auto px-4">
        <div className="section-header">
          <span className="section-label">The Four Pillars</span>
          <h2 className="section-title">
            A Whole Life, <span className="text-accent">Not Just a Workout</span>
          </h2>
          <p className="section-description">
            Fortivus is a Christian brotherhood and lifestyle platform. We build men across every
            arena God has entrusted to them.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              to={pillar.link}
              className="group bg-card p-8 hover:bg-secondary/60 transition-colors"
            >
              <pillar.icon className="w-6 h-6 text-accent mb-6" />
              <h3 className="text-xl font-semibold mb-3 tracking-tight">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {pillar.description}
              </p>
              <span className="text-xs uppercase tracking-[0.15em] text-accent/80">
                {pillar.verse}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pillars;
