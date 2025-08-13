
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  price: string;
  note?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, image, price, note }) => {
  return (
    <Card className="group overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20 card-hover-smooth hover:shadow-2xl transition-all duration-700">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
        <div className="absolute bottom-4 left-4 text-white font-semibold text-lg">
          {price}
        </div>
      </div>
      
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-semibold mb-4 transition-all duration-700 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-center mb-4">
          {description}
        </p>
        {note && (
          <p className="text-xs text-muted-foreground/80 italic">
            {note}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
