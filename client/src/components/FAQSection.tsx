
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const FAQSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "Who writes the messages?",
      answer: "A team led by Onaamika Sadguru — our Chief Emotions Officer — carefully crafts every message with love and authenticity."
    },
    {
      question: "Can I review the message before it's sent?",
      answer: "Absolutely. You'll receive a draft to review, and we'll make changes until it feels just right."
    },
    {
      question: "Can I stay anonymous?",
      answer: "Yes. If you wish, we can deliver the message without revealing your name."
    },
    {
      question: "How long does it take to receive the message?",
      answer: "Standard delivery is within 10–15 days. We take time to get every word just right."
    },
    {
      question: "Can I send messages for any occasion?",
      answer: "Yes! Whether it's love, apology, celebration, or just because — we help you say it from the heart."
    },
    {
      question: "Is this service available outside India?",
      answer: "Currently, we serve all corners of India. International delivery coming soon!"
    }
  ];

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              You Might Be Wondering…
            </span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="border-0 bg-gradient-to-br from-background to-muted/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-muted/20 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                  {openItems.includes(index) ? (
                    <Minus className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>
                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
