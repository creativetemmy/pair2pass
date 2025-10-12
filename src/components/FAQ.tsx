import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "What is Pair2Pass?",
    answer: "Pair2Pass is a Web3-powered platform that connects students with verified study partners. Students can build their academic reputation, earn Pass Points, and unlock NFT badges while learning together."
  },
  {
    question: "How do I find a study partner?",
    answer: "Simply complete your profile, select a subject and study goal, and click Find Study Partner. You'll be matched with 2–3 suitable partners based on subject overlap, study goals, and availability."
  },
  {
    question: "Do I need a crypto wallet to use Pair2Pass?",
    answer: "Yes, a wallet is required to sign up and receive your Student Passport NFT. Don't worry — we make it simple, even if you're new to Web3."
  },
  {
    question: "What are Pass Points?",
    answer: "Pass Points are the unified reward system in Pair2Pass. You earn Pass Points by completing study sessions, receiving good reviews, and achieving milestones. As you accumulate Pass Points, you advance through tiers (Beginner → Explorer → Scholar → Expert → Master) and unlock exclusive features, badges, and benefits."
  },
  {
    question: "How do NFT badges work?",
    answer: "NFT badges are digital collectibles that mark your milestones, such as completing your first study session 🎓, studying consistently for a week 📅, or receiving great partner reviews 🌟. They live in your wallet and become part of your verifiable academic journey."
  },
  {
    question: "Can I use video chat on Pair2Pass?",
    answer: "At the moment, Pair2Pass integrates with external tools like Google Meet or Zoom. You'll share the link in the Session Lobby before starting."
  },
  {
    question: "How are students verified?",
    answer: "We use email verification and optional academic institution checks. Reviews after each session also build your reputation over time."
  },
  {
    question: "What happens when I graduate?",
    answer: "Graduates keep their profile history, badges, and reputation. You'll still be able to mentor, share knowledge, or join as an alumni guide."
  },
  {
    question: "Is Pair2Pass free?",
    answer: "Yes"
  },
  {
    question: "How do I get started?",
    answer: "1. Connect your wallet. 2. Complete your profile. 3. Verify your email. 4. Claim your Student Passport NFT. 5. Start finding study partners 🚀"
  }
];

export default function FAQ() {
  return (
    <section className="py-20 bg-muted/20 dark:bg-muted/5 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 transition-colors duration-300">
            📖 Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto transition-colors duration-300">
            Everything you need to know about Pair2Pass
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border/20 dark:border-border/10 rounded-lg px-6 transition-colors duration-300"
              >
                <AccordionTrigger className="text-left text-foreground font-semibold hover:text-primary transition-colors duration-300">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed transition-colors duration-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}