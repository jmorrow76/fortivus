import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import testimonialMichael from "@/assets/testimonial-michael.jpg";
import testimonialDavid from "@/assets/testimonial-david.jpg";
import testimonialJames from "@/assets/testimonial-james.jpg";
import testimonialRobert from "@/assets/testimonial-robert.jpg";
import testimonialSteven from "@/assets/testimonial-steven.jpg";

interface Testimonial {
  id: number;
  name: string;
  age: number;
  location: string;
  quote: string;
  achievement: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Michael R.",
    age: 47,
    location: "Austin, TX",
    quote: "At 47, I thought my best years were behind me. Fortivus proved me wrong. The AI body analysis gave me the roadmap I needed, and the personalized training plans fit perfectly into my busy schedule.",
    achievement: "Lost 35 lbs in 6 months",
    avatar: testimonialMichael,
  },
  {
    id: 2,
    name: "David K.",
    age: 52,
    location: "Chicago, IL",
    quote: "The progress photo tracking kept me accountable when motivation was low. Seeing my transformation week by week was incredibly powerful. This program understands what men over 40 actually need.",
    achievement: "Gained 12 lbs muscle, dropped 8% body fat",
    avatar: testimonialDavid,
  },
  {
    id: 3,
    name: "James T.",
    age: 44,
    location: "Denver, CO",
    quote: "I tried countless programs before Fortivus. The difference is the science-backed approach and the community of like-minded men. The supplement recommendations alone saved me hundreds in wasted products.",
    achievement: "Bench press increased 85 lbs",
    avatar: testimonialJames,
  },
  {
    id: 4,
    name: "Robert M.",
    age: 49,
    location: "Seattle, WA",
    quote: "The Elite membership was the best investment in myself. The AI analysis showed me exactly where I was holding excess fat and the build plan targeted those areas specifically. Incredible results.",
    achievement: "Went from 28% to 15% body fat",
    avatar: testimonialRobert,
  },
  {
    id: 5,
    name: "Steven L.",
    age: 55,
    location: "Miami, FL",
    quote: "At 55, I have more energy than I did at 35. The workout programs are designed for real life - efficient, effective, and actually sustainable. My doctor was amazed at my recent bloodwork.",
    achievement: "Reversed pre-diabetic markers",
    avatar: testimonialSteven,
  },
];

const TestimonialCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="section-padding bg-secondary/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">
            Real Men, Real <span className="text-accent">Results</span>
          </h2>
          <p className="section-description">
            Join thousands of men over 40 who have transformed their bodies and lives with Fortivus.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] min-w-0 px-4"
                >
                  <Card className="bg-background border-border/50">
                    <CardContent className="p-8 md:p-10">
                      <div className="flex flex-col items-center text-center">
                        <Quote className="h-10 w-10 text-accent/30 mb-6" />
                        <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
                          "{testimonial.quote}"
                        </p>
                        <div className="flex flex-col items-center">
                          <Avatar className="h-16 w-16 mb-4 ring-2 ring-accent/20">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback className="bg-secondary text-foreground font-semibold">
                              {testimonial.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-heading font-semibold text-foreground">
                            {testimonial.name}, {testimonial.age}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {testimonial.location}
                          </p>
                          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                            {testimonial.achievement}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex bg-background"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex bg-background"
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "bg-accent w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
