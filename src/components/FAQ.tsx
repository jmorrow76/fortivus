import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is Fortivus really designed for men over 40?",
    answer: "Absolutely. Every program and training recommendation is built with men in their 40s, 50s, and beyond in mind, with a focus on sustainable progress and recovery rather than the all-out approach of generic fitness programs."
  },
  {
    question: "How is the AI body analysis different from other tools?",
    answer: "Our AI analyzes your photos to give you a visual sense of how your physique is changing over time, so you can track progress alongside your training log."
  },
  {
    question: "Can I cancel my membership anytime?",
    answer: "Yes, you can cancel your membership at any time with no cancellation fees. If you cancel, you'll retain access until the end of your current billing period."
  },
  {
    question: "What equipment do I need for the workout programs?",
    answer: "Our programs range from bodyweight-only routines to full gym workouts. During onboarding, you'll indicate your available equipment, and we'll customize your program accordingly. Most members start with just dumbbells and resistance bands."
  },
  {
    question: "How quickly will I see results?",
    answer: "Most members report noticeable improvements in energy and strength within 2-3 weeks. Visible body composition changes typically appear around 6-8 weeks with consistent effort. Our progress tracking tools help you see improvements that might otherwise go unnoticed."
  },
  {
    question: "What if the program doesn't work for me?",
    answer: "We offer a 30-day satisfaction guarantee. If you follow the program and don't see results, contact our support team for a full refund. We're confident in our approach because it's built on proven science."
  },
  {
    question: "Is there a community or support system?",
    answer: "Yes, Elite members get access to our private community of like-minded men, plus direct support from our coaches. Even Foundation members can access our knowledge base and email support."
  }
];

const FAQ = () => {
  return (
    <section id="faq" className="section-padding bg-background">
      <div className="container mx-auto px-4">
        <div className="section-header">
          <span className="section-label">FAQ</span>
          <h2 className="section-title">
            Common Questions
          </h2>
          <p className="section-description">
            Everything you need to know about Fortivus membership and programs.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left text-base font-medium hover:text-accent hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
