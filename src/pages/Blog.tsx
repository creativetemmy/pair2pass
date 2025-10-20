import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image?: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "getting-started-with-pair2pass",
    title: "Getting Started with Pair2Pass: A Complete Guide",
    excerpt: "Learn how to set up your account, connect your wallet, and find your first study partner on Pair2Pass.",
    content: "Full blog post content here...",
    author: "Team Pair2Pass",
    date: "2025-01-15",
    readTime: "5 min read",
    category: "Tutorial",
    tags: ["Getting Started", "Web3", "Study Tips"],
  },
  {
    id: "maximizing-xp-rewards",
    title: "Maximizing Your XP Rewards: Tips and Strategies",
    excerpt: "Discover the best practices for earning XP, unlocking badges, and climbing the leaderboard.",
    content: "Full blog post content here...",
    author: "Sarah Johnson",
    date: "2025-01-10",
    readTime: "7 min read",
    category: "Tips & Tricks",
    tags: ["XP", "Gamification", "Rewards"],
  },
  {
    id: "effective-study-sessions",
    title: "How to Run Effective Virtual Study Sessions",
    excerpt: "Best practices for productive online study sessions with your study partners.",
    content: "Full blog post content here...",
    author: "Michael Chen",
    date: "2025-01-05",
    readTime: "6 min read",
    category: "Study Tips",
    tags: ["Productivity", "Study Techniques", "Collaboration"],
  },
  {
    id: "web3-for-students",
    title: "Understanding Web3: A Student's Guide",
    excerpt: "Demystifying Web3 technology and how it benefits your academic journey on Pair2Pass.",
    content: "Full blog post content here...",
    author: "Emma Rodriguez",
    date: "2024-12-28",
    readTime: "8 min read",
    category: "Education",
    tags: ["Web3", "Blockchain", "Technology"],
  },
  {
    id: "building-study-habits",
    title: "Building Consistent Study Habits with Accountability Partners",
    excerpt: "Learn how having a study partner can help you build and maintain consistent study habits.",
    content: "Full blog post content here...",
    author: "David Park",
    date: "2024-12-20",
    readTime: "5 min read",
    category: "Study Tips",
    tags: ["Habits", "Accountability", "Success"],
  },
  {
    id: "nft-badges-explained",
    title: "NFT Badges on Pair2Pass: What They Mean and How to Earn Them",
    excerpt: "A comprehensive guide to understanding and collecting NFT badges on our platform.",
    content: "Full blog post content here...",
    author: "Team Pair2Pass",
    date: "2024-12-15",
    readTime: "6 min read",
    category: "Tutorial",
    tags: ["NFT", "Badges", "Rewards"],
  },
];

const categories = ["All", "Tutorial", "Tips & Tricks", "Study Tips", "Education"];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-secondary dark:from-primary/80 dark:via-primary/70 dark:to-secondary/80">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Pair2Pass Blog
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Tutorials, tips, and insights to help you succeed on your academic journey
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white dark:bg-card"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-border bg-muted/30 dark:bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="transition-all duration-300"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                No articles found matching your search.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="group hover:shadow-xl transition-all duration-300 border-border/20 dark:border-border/10 flex flex-col"
                >
                  <CardContent className="p-6 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-muted-foreground mb-4 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Author with Logo */}
                    <div className="flex items-center gap-2 mb-4">
                      <img 
                        src="/pair2pass.png" 
                        alt="Pair2Pass Logo" 
                        className="h-6 w-6 rounded-full object-contain"
                      />
                      <span className="text-sm font-medium text-foreground">Pair2Pass Team</span>
                    </div>

                    {/* Read More Link */}
                    <Link
                      to={`/blog/${post.id}`}
                      className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-muted/30 dark:bg-muted/10">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-border/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Stay Updated
              </h2>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter to get the latest tutorials, tips, and platform updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1"
                />
                <Button className="sm:w-auto">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}