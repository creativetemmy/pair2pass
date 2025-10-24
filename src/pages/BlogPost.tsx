import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";

// This would normally come from a CMS or database
const blogPosts: { [key: string]: any } = {
  "getting-started-with-pair2pass": {
    title: "Getting Started with Pair2Pass: A Complete Guide",
    author: "Pair2Pass Team",
    date: "2025-01-15",
    readTime: "5 min read",
    category: "Tutorial",
    tags: ["Getting Started", "Web3", "Study Tips"],
    headerImage: "/pair2pass_logo(n).png",
    content: `
      <h2><strong>Welcome to Pair2Pass!</strong></h2>
      <p>Getting started with Pair2Pass is easy. This comprehensive guide will walk you through everything you need to know to begin your journey toward better study habits and academic success.</p>
      <br/><p>Each successfully completed study session earns you Experience Points (XP) that contribute to your overall level and unlock exclusive badges. The more you study, the higher you climb on the leaderboard!</p><br/>
      
      <h3><b>Step 1: Connect Your Wallet</b></h3>
      <p>Pair2Pass uses Web3 technology to verify your identity and secure your academic reputation. To get started, you'll need to connect a Web3 wallet like MetaMask or WalletConnect.</p><br/>
      <img src="/connect_wallet.png" alt="Connect your wallet" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;" />
      
      <h3><b>Step 2: Complete Your Profile</b></h3>
      <p>After connecting your wallet, complete your profile by adding your academic details, study preferences, and availability. Also verify your email. This helps us match you with the perfect study partners.</p><br/>
      <img src="/profile.png" alt="Complete your profile" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;" />

      <h3><b>Step 3: Mint your Profile NFT</b></h3>
      <p>After completing your profile details, mint your profile NFT on Base Network (Sepolia Testnet). Your NFT is non-transfarable and it is a proof of registration on the platform. You can check your NFt details on Base scan.</p><br/>
      <img src="/profile_completion.png" alt="Profile NFT" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;" />
      
      <h3><b>Step 4: Find Study Partners</b></h3>
      <p>Use our intelligent matching system to find students who share your courses, study goals, and learning style. You can filter by subject, availability, and experience level.</p><br/>
      <img src="/pair2pass_find_partner.png" alt="Profile NFT" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;" />
      
      <h3><b>Step 5: Start Studying and Earning</b></h3>
      <p>Join or create study sessions instantly, collaborate with your partners, and earn XP and badges as you progress. The more you study, the higher you climb on the leaderboard!</p><br/>
      <img src="/pair2pass_join_session.png" alt="Profile NFT" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;" />
      
      <br/>
      <h2><b>Tips for Success</b></h2>
      <ul>
        <li>Join your study sessions early.</li>
        <li>Be consistent with your study sessions.</li>
        <li>Communicate clearly with your study partners.</li>
        <li>Set specific goals for each session.</li>
        <li>Maximize the gamification features.</li>
      </ul>
      
      <p>Ready to transform your study experience? <br/>
      
      <br/>Connect your wallet and get started today!</p>
    `,
  },
  "maximizing-xp-rewards": {
    title: "Maximizing Your Pass Points Rewards: Tips and Strategies",
    author: "Sarah Johnson",
    date: "2025-01-10",
    readTime: "7 min read",
    category: "Tips & Tricks",
    tags: ["XP", "Gamification", "Rewards"],
    content: `
      <h2>Understanding the Pass Points System</h2><br/>
      <p>Pair2Pass rewards your dedication to studying with Pass Points that help you level up and unlock exclusive badges.</p><br/>
      
      <h3><b>How to Earn Pass Points</b></h3><br/>
      <ul>
        <li><strong>Complete Study Sessions:</strong> Earn 50-100 Pass Points per session</li>
        <li><strong>Maintain Streaks:</strong> Get bonus Pass Points for consecutive days</li>
        <li><strong>Help Others:</strong> Earn Pass Points by being a reliable study partner</li>
        <li><strong>Achieve Milestones:</strong> Unlock special Pass Points bonuses</li>
      </ul>
      
      <!--
      // <h3>Advanced Strategies</h3>
      // <p>Here are some pro tips to maximize your XP earnings:</p>
       <ol>
        <li>Study during peak hours for bonus multipliers</li>
         <li>Complete weekly challenges for extra rewards</li>
         <li>Refer friends to earn referral bonuses</li>
         <li>Participate in community events</li>
      </ol>
      
      <h2>Climbing the Leaderboard</h2>
       <p>Use your XP wisely to climb the leaderboard and gain recognition in the Pair2Pass community. Top performers earn special badges and privileges!</p>
      -->
      
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
      <h2><b>The Art of Virtual Studying</b></h2><br/>
      <p>Virtual study sessions can be just as effective as in-person ones when done right. Here's how to make the most of your online study time.</p><br/>
      
      <h3><b>Before the Session:</b></h3>
      </>
      <ul>
        <li>Set clear objectives and goals</li>
        <li>Prepare materials and resources</li>
        <li>Test your technology setup</li>
        <li>Communicate effeciently with your study partner</li>
      </ul>
      <br/>
      
      <h3><b>During the Session:</b></h3>
      <p>Maintain focus and engagement with these techniques:</p>
      <ol>
        <li><strong>Pomodoro Technique:</strong> Study and take breaks where necessary</li>
        <li><strong>Active Participation:</strong> Both partners should contribute</li>
        <li><strong>Screen Sharing:</strong> Use it to collaborate on problems</li>
        <li><strong>Stay Accountable:</strong> Keep each other on track</li>
      </ol>
      <br/>
      
      <h3><b>After the Session:</b></h3>
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

            {/* Author with Logo */}
            <div className="flex items-center gap-2 mb-6">
              <img 
                src="/pair2pass.png" 
                alt="Pair2Pass Logo" 
                className="h-8 w-8 rounded-full object-contain"
              />
              <span className="text-lg font-medium text-foreground">Pair2Pass Team</span>
            </div>

            {/* Share Button */}
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
          </div>
        </div>
      </section>

      {/* Header Image */}
      {post.headerImage && (
        <section className="py-0">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <img 
                src={post.headerImage} 
                alt={post.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>
      )}

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
                  prose-li:text-muted-foreground
                  prose-img:rounded-lg prose-img:shadow-md"
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