import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Vibefy
            </span>
          </div>
          <Link to="/board">
            <Button>
              Go to Board
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span>Modern Project Management Reimagined</span>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Ship faster with{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Vibefy
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            The modern project management tool for teams that move fast. 
            Plan, track, and collaborate on your projects with an interface 
            that feels like magic.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/board">
              <Button size="lg" className="text-base">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: CheckCircle2,
              title: "Kanban Boards",
              description: "Visualize your workflow with intuitive drag-and-drop boards"
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Built for speed with instant updates and smooth animations"
            },
            {
              icon: Sparkles,
              title: "Beautiful UI",
              description: "A delightful interface that makes project management enjoyable"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group rounded-xl border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <feature.icon className="mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© 2024 Vibefy. Built with passion for product teams.</p>
      </footer>
    </div>
  );
};

export default Landing;
