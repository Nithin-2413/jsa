
import React from 'react';
import { Heart, Link, Sparkles } from 'lucide-react';

const WhyWeExistSection = () => {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-muted/20 to-pink-50/20 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <div className="mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Why We Exist
            </span>
          </h2>
        </div>

        <div className="space-y-8 text-lg leading-relaxed">
          <div className="flex items-center justify-center mb-8">
            <Heart className="w-12 h-12 text-primary" />
          </div>
          
          <p className="text-xl font-medium text-foreground times-new-roman-italic">
            We believe emotions deserve to be felt fully, not filtered.
          </p>
          
          <p className="text-muted-foreground">
            In a world filled with instant replies and short texts, we're here to bring back the power 
            of slow, soulful, handwritten expression.
          </p>
          
          <div className="flex items-center justify-center my-12">
            <Link className="w-8 h-8 text-purple-500" />
          </div>
          
          <p className="text-xl font-medium text-primary times-new-roman-italic">
            Every message we craft is a bridge — between hearts, across distances, and beyond words.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyWeExistSection;
