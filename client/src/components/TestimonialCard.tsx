
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  location: string;
  message: string;
  rating: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, location, message, rating }) => {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-background to-muted/30 hover:-translate-y-1">
      <CardContent className="p-8">
        <div className="flex items-center mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        <blockquote className="text-lg mb-6 leading-relaxed text-muted-foreground italic">
          "{message}"
        </blockquote>
        
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {name.charAt(0)}
          </div>
          <div className="ml-4">
            <div className="font-semibold text-foreground">{name}</div>
            <div className="text-sm text-muted-foreground">{location}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
