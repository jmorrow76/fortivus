import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Curated scriptures about discipline, perseverance, stewardship, and the body as temple
const scriptures = [
  {
    verse: "1 Corinthians 6:19-20",
    text: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own; you were bought at a price. Therefore honor God with your bodies.",
    theme: "stewardship"
  },
  {
    verse: "1 Corinthians 9:27",
    text: "No, I strike a blow to my body and make it my slave so that after I have preached to others, I myself will not be disqualified for the prize.",
    theme: "discipline"
  },
  {
    verse: "Hebrews 12:11",
    text: "No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness and peace for those who have been trained by it.",
    theme: "discipline"
  },
  {
    verse: "Philippians 4:13",
    text: "I can do all this through him who gives me strength.",
    theme: "perseverance"
  },
  {
    verse: "1 Timothy 4:8",
    text: "For physical training is of some value, but godliness has value for all things, holding promise for both the present life and the life to come.",
    theme: "balance"
  },
  {
    verse: "Proverbs 12:1",
    text: "Whoever loves discipline loves knowledge, but whoever hates correction is stupid.",
    theme: "discipline"
  },
  {
    verse: "Romans 12:1",
    text: "Therefore, I urge you, brothers and sisters, in view of God's mercy, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship.",
    theme: "stewardship"
  },
  {
    verse: "Galatians 6:9",
    text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
    theme: "perseverance"
  },
  {
    verse: "James 1:12",
    text: "Blessed is the one who perseveres under trial because, having stood the test, that person will receive the crown of life that the Lord has promised to those who love him.",
    theme: "perseverance"
  },
  {
    verse: "Proverbs 25:28",
    text: "Like a city whose walls are broken through is a person who lacks self-control.",
    theme: "discipline"
  },
  {
    verse: "2 Timothy 1:7",
    text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.",
    theme: "discipline"
  },
  {
    verse: "Isaiah 40:31",
    text: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    theme: "perseverance"
  },
  {
    verse: "1 Corinthians 9:24",
    text: "Do you not know that in a race all the runners run, but only one gets the prize? Run in such a way as to get the prize.",
    theme: "perseverance"
  },
  {
    verse: "Proverbs 3:9",
    text: "Honor the LORD with your wealth and with the firstfruits of all your produce.",
    theme: "stewardship"
  },
  {
    verse: "Colossians 3:23",
    text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
    theme: "excellence"
  },
  {
    verse: "Ecclesiastes 9:10",
    text: "Whatever your hand finds to do, do it with all your might.",
    theme: "excellence"
  },
  {
    verse: "Matthew 25:21",
    text: "His master replied, 'Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things. Come and share your master's happiness!'",
    theme: "stewardship"
  },
  {
    verse: "Hebrews 12:1",
    text: "Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us.",
    theme: "perseverance"
  },
  {
    verse: "Proverbs 21:5",
    text: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
    theme: "discipline"
  },
  {
    verse: "1 Peter 5:8",
    text: "Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour.",
    theme: "discipline"
  },
  {
    verse: "2 Peter 1:5-6",
    text: "For this very reason, make every effort to add to your faith goodness; and to goodness, knowledge; and to knowledge, self-control; and to self-control, perseverance.",
    theme: "discipline"
  },
  {
    verse: "Joshua 1:9",
    text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.",
    theme: "perseverance"
  },
  {
    verse: "Romans 5:3-4",
    text: "Not only so, but we also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope.",
    theme: "perseverance"
  },
  {
    verse: "Proverbs 13:4",
    text: "A sluggard's appetite is never filled, but the desires of the diligent are fully satisfied.",
    theme: "discipline"
  },
  {
    verse: "1 Corinthians 10:31",
    text: "So whether you eat or drink or whatever you do, do it all for the glory of God.",
    theme: "stewardship"
  },
  {
    verse: "Psalm 139:14",
    text: "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.",
    theme: "stewardship"
  },
  {
    verse: "3 John 1:2",
    text: "Dear friend, I pray that you may enjoy good health and that all may go well with you, even as your soul is getting along well.",
    theme: "health"
  },
  {
    verse: "Proverbs 4:23",
    text: "Above all else, guard your heart, for everything you do flows from it.",
    theme: "discipline"
  },
  {
    verse: "Deuteronomy 31:6",
    text: "Be strong and courageous. Do not be afraid or terrified because of them, for the LORD your God goes with you; he will never leave you nor forsake you.",
    theme: "perseverance"
  },
  {
    verse: "James 1:2-4",
    text: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.",
    theme: "perseverance"
  }
];

function getScriptureOfDay() {
  // Use date to pick a consistent scripture for the day
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % scriptures.length;
  return scriptures[index];
}

export default function ScriptureOfDay() {
  const scripture = getScriptureOfDay();

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 border-amber-500/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-amber-500/20 shrink-0">
            <BookOpen className="h-5 w-5 text-amber-600" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-amber-600">
                Scripture of the Day
              </h3>
            </div>
            <blockquote className="text-foreground/90 italic leading-relaxed">
              "{scripture.text}"
            </blockquote>
            <p className="text-sm font-medium text-muted-foreground">
              — {scripture.verse}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}