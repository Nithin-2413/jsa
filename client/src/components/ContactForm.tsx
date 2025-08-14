import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, Send } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  recipientName: string;
  serviceType: string;
  deliveryType: string;
  feelings: string;
  story: string;
  specificDetails: string;
}

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    recipientName: '',
    serviceType: '',
    deliveryType: '',
    feelings: '',
    story: '',
    specificDetails: ''
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/submitHug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Message Sent! ❤️",
          description: "Thank you for sharing your story. We'll reach out within 24 hours."
        });

        // reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          recipientName: '',
          serviceType: '',
          deliveryType: '',
          feelings: '',
          story: '',
          specificDetails: ''
        });
      } else {
        toast({
          title: "Failed to Send",
          description: result.message || "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please check your connection.",
        variant: "destructive"
      });
    }
  };

  const serviceTypes = [
    'Love Letter', 'Gratitude Message', 'Apology Letter',
    'Birthday Message', 'Anniversary Letter', 'Thank You Note',
    'Friendship Letter', 'Family Message', 'Custom Request'
  ];

  return (
    <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          Share Your Heart
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          Tell us your story, and we'll help you express it beautifully
        </p>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* No action or method attributes here */}

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-primary">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Your Name *</Label>
                <Input name="name" required value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input name="email" type="email" required value={formData.email} onChange={handleInputChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-primary">Message Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Recipient's Name *</Label>
                <Input name="recipientName" required value={formData.recipientName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Type of Message *</Label>
                <select
                  name="serviceType"
                  required
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full h-12 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select type</option>
                  {serviceTypes.map(type => <option key={type}>{type}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Delivery Type *</Label>
              <select
                name="deliveryType"
                required
                value={formData.deliveryType}
                onChange={handleInputChange}
                className="w-full h-12 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select delivery type</option>
                <option value="Standard Delivery">Standard Delivery (10 days after dispatch)</option>
                <option value="Express Delivery">Express Delivery (2-3 days after dispatch) - ₹150 extra</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-primary">Your Story</h3>
            <div className="space-y-2">
              <Label>Feelings *</Label>
              <Textarea name="feelings" required value={formData.feelings} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Story *</Label>
              <Textarea name="story" required value={formData.story} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Specific Details</Label>
              <Textarea name="specificDetails" value={formData.specificDetails} onChange={handleInputChange} />
            </div>
          </div>

          <div className="p-6 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2 text-primary">Delivery Information</h4>
            <p className="text-sm text-muted-foreground">
              • Delivery all over India<br />
              • Timeline: 10-15 days<br />
              • Contact: onaamikasadguru@gmail.com
            </p>
          </div>

          <Button type="submit" className="w-full h-14 text-lg bg-gradient-to-r from-primary to-purple-600">
            <div className="flex items-center gap-3">
              <Send className="h-5 w-5" />
              Send My Story
            </div>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
