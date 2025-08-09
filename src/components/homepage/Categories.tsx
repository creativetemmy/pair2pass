import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Programming", emoji: "💻", count: 342 },
  { name: "Mathematics", emoji: "📊", count: 198 },
  { name: "Sciences", emoji: "🔬", count: 156 },
  { name: "Languages", emoji: "🌍", count: 89 },
  { name: "Business", emoji: "💼", count: 134 },
  { name: "Design", emoji: "🎨", count: 78 },
];

export function Categories() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-6 transition-colors duration-300">
        Popular Categories
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <Card
            key={index}
            className={cn(
              "cursor-pointer hover-lift border-border/20 hover:border-border/40 transition-all duration-300",
              selectedCategory === category.name && "ring-2 ring-primary border-primary/50"
            )}
            onClick={() => setSelectedCategory(
              selectedCategory === category.name ? null : category.name
            )}
          >
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-3">{category.emoji}</div>
              <h3 className="text-sm font-semibold text-foreground mb-1 transition-colors duration-300">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground transition-colors duration-300">
                {category.count} sessions
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}