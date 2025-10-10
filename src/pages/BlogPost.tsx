import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";

// This would normally come from a CMS or database
const blogPosts: { [key: string]: any } = {
  "getting-started-with-pair2pass": {
    title: "Getting Started with Pair2Pass: A Complete Guide",
    author: "Team Pair2Pass",
    date: "2025-01-15",
    readTime: "5 min read",
    category: "Tutorial",
    tags: ["Getting Started", "Web3", "Study Tips"],
    content: `
      <h2>Welcome to Pair2Pass!</h2>
      <p>Getting started with Pair2Pass is easy. This comprehensive guide will walk you through everything you need to know to begin your journey toward better study habits and academic success.</p>
      
      <h3>Step 1: Connect Your Wallet</h3>
      <p>Pair2Pass uses Web3 technology to verify your identity and secure your academic reputation. To get started, you'll need to connect a Web3 wallet like MetaMask or WalletConnect.</p>
      
      <h3>Step 2: Complete Your Profile</h3>
      <p>After connecting your wallet, complete your profile by adding your academic details, study preferences, and availability. This helps us match you with the perfect study partners.</p>
      
      <h3>Step 3: Find Study Partners</h3>
      <p>Use our intelligent matching system to find students who share your courses, study goals, and learning style. You can filter by subject, availability, and experience level.</p>
      
      <h3>Step 4: Start Studying and Earning</h3>
      <p>Join or create study sessions, collaborate with your partners, and earn XP and badges as you progress. The more you study, the higher you climb on the leaderboard!</p>
      
      <h2>Tips for Success</h2>
      <ul>
        <li>Be consistent with your study sessions</li>
        <li>Communicate clearly with your study partners</li>
        <li>Set specific goals for each session</li>
        <li>Take advantage of the gamification features</li>
      </ul>
      
      <p>Ready to transform your study experience? Connect your wallet and get started today!</p>
    `,
  },
  "maximizing-xp-rewards": {
    title: "Maximizing Your XP Rewards: Tips and Strategies",
    author: "Sarah Johnson",
    date: "2025-01-10",
    readTime: "7 min read",
    category: "Tips & Tricks",
    tags: ["XP", "Gamification", "Rewards"],
    content: `
      <h2>Understanding the XP System</h2>
      <p>Pair2Pass rewards your dedication to studying with Experience Points (XP) that help you level up and unlock exclusive badges.</p>
      
      <h3>How to Earn XP</h3>
      <ul>
        <li><strong>Complete Study Sessions:</strong> Earn 50-100 XP per session</li>
        <li><strong>Maintain Streaks:</strong> Get bonus XP for consecutive days</li>
        <li><strong>Help Others:</strong> Earn XP by being a reliable study partner</li>
        <li><strong>Achieve Milestones:</strong> Unlock special XP bonuses</li>
      </ul>
      
      <h3>Advanced Strategies</h3>
      <p>Here are some pro tips to maximize your XP earnings:</p>
      <ol>
        <li>Study during peak hours for bonus multipliers</li>
        <li>Complete weekly challenges for extra rewards</li>
        <li>Refer friends to earn referral bonuses</li>
        <li>Participate in community events</li>
      </ol>
      
      <h2>Climbing the Leaderboard</h2>
      <p>Use your XP wisely to climb the leaderboard and gain recognition in the Pair2Pass community. Top performers earn special badges and privileges!</p>
    `,
  },
  "effective-study-sessions": {
    title: "How to Run Effective Virtual Study Sessions",
    author: "Michael Chen",
    date: "2025-01-05",
    readTime: "6 min read",
    category: "Study Tips",
    tags: ["Productivity", "Study Techniques", "Collaboration"],
    content: `
      <h2>The Art of Virtual Studying</h2>
      <p>Virtual study sessions can be just as effective as in-person ones when done right. Here's how to make the most of your online study time.</p>
      
      <h3>Before the Session</h3>
      <ul>
        <li>Set clear objectives and goals</li>
        <li>Prepare materials and resources</li>
        <li>Test your technology setup</li>
        <li>Communicate expectations with your partner</li>
      </ul>
      
      <h3>During the Session</h3>
      <p>Maintain focus and engagement with these techniques:</p>
      <ol>
        <li><strong>Pomodoro Technique:</strong> Study for 25 minutes, break for 5</li>
        <li><strong>Active Participation:</strong> Both partners should contribute</li>
        <li><strong>Screen Sharing:</strong> Use it to collaborate on problems</li>
        <li><strong>Stay Accountable:</strong> Keep each other on track</li>
      </ol>
      
      <h3>After the Session</h3>
      <p>Wrap up effectively by reviewing what you learned, scheduling your next session, and providing feedback to your study partner.</p>
    `,
  },
};

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const post = id ? blogPosts[id] : null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <Link to="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Category Badge */}
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-4">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Share Button */}
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-border/20">
            <CardContent className="p-8 md:p-12">
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:text-foreground
                  prose-p:text-muted-foreground
                  prose-a:text-primary hover:prose-a:text-primary/80
                  prose-strong:text-foreground
                  prose-ul:text-muted-foreground
                  prose-ol:text-muted-foreground
                  prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts CTA */}
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <Link to="/blog">
              <Button size="lg">
                Read More Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}