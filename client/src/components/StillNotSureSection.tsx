
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight } from 'lucide-react';

const StillNotSureSection = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-pink-50/20 to-purple-50/20 relative overflow-hidden">
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Still Not Sure What to Say?
            </span>
          </h2>
        </div>

        <div className="bg-gradient-to-r from-pink-50/50 to-purple-50/50 p-8 rounded-3xl border border-pink-200/30 mb-8">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          
          <p className="text-xl leading-relaxed text-muted-foreground mb-6">
            You don't need to have the perfect words — just the feeling.
          </p>
          
          <p className="text-lg text-foreground times-new-roman-italic">
            We'll listen, feel with you, and turn your emotions into the message you've always wanted to say.
          </p>
        </div>

        <Button 
          onClick={scrollToContact}
          size="lg" 
          className="bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 text-lg group hover:scale-105 hover:shadow-2xl transition-all duration-300"
        >
          Let's Start Your Message
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
};

export default StillNotSureSection;
