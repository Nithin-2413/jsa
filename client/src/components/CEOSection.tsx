
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Star, Sparkles } from 'lucide-react';

const CEOSection = () => {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-background to-pink-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-10 left-10 animate-float">
        <Sparkles className="w-8 h-8 text-yellow-300 opacity-20" />
      </div>
      <div className="absolute top-20 right-20 animate-float delay-1000">
        <Star className="w-6 h-6 text-pink-300 opacity-30 fill-current" />
      </div>
      <div className="absolute bottom-20 left-1/4 animate-float delay-2000">
        <Heart className="w-8 h-8 text-purple-300 opacity-20 fill-current" />
      </div>
      <div className="absolute bottom-32 right-16 animate-pulse">
        <div className="w-12 h-12 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full opacity-10"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Meet Our CEO:
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Chief Emotions Officer
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The heart and soul behind every beautifully crafted message
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative flex justify-center lg:justify-end">
            <div className="ceo-image-container image-3d-hover">
              <img
                src="/lovable-uploads/a880aac8-c4eb-4120-8183-ea6411dd5725.png"
                alt="Onaamika Sadguru"
                className="ceo-image image-3d-content"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="relative">
              <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Onaamika Sadguru
              </h3>
            </div>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                A wordsmith with a heart that feels deeply and a pen that bleeds emotion. 
                Onaamika doesn't just write letters—she weaves souls into sentences and 
                transforms silent hearts into singing words.
              </p>
              
              <p className="text-lg">
                With an uncanny ability to capture the essence of human connection, she has 
                dedicated her life to giving voice to the voiceless emotions that live in the 
                space between heartbeats.
              </p>
              
              <p className="text-lg font-medium text-primary times-new-roman-italic">
                "Every emotion deserves to be heard, every feeling deserves to find its way 
                to the heart it's meant for."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-pink-50/30 to-purple-50/30 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white fill-current" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Endless</h4>
                  <p className="text-sm text-muted-foreground">Love & Passion</p>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50/30 to-orange-50/30 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Pure</h4>
                  <p className="text-sm text-muted-foreground">Magic & Wonder</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CEOSection;
