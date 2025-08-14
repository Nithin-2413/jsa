import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { LogIn, MapPin, Sparkles } from 'lucide-react';
import logoImage from '@assets/Untitled design (2)_1755165830517.png';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Request location permission when component mounts
    const requestLocation = async () => {
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
          });

          const locationInfo: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // Try to get city and country from reverse geocoding
          try {
            const geocodingResponse = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const geocodingData = await geocodingResponse.json();
            locationInfo.city = geocodingData.city || geocodingData.locality;
            locationInfo.country = geocodingData.countryName;
          } catch (geocodingError) {
            console.warn('Failed to get location details:', geocodingError);
          }

          setLocationData(locationInfo);
          setLocationPermissionGranted(true);
        } catch (error) {
          console.error('Location access denied:', error);
          toast({
            title: "Location Required",
            description: "Please enable location access to login to the admin panel.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Location Not Supported",
          description: "Your browser doesn't support location services.",
          variant: "destructive",
        });
      }
    };

    requestLocation();
  }, [toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationPermissionGranted || !locationData) {
      toast({
        title: "Location Required",
        description: "Please enable location access to proceed with login.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/adminLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password,
          location: locationData
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store login state in localStorage
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        
        toast({
          title: "Welcome back!",
          description: "Login successful. Redirecting to orders...",
        });

        setTimeout(() => {
          setLocation('/admin/dashboard');
        }, 1000);
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize the finisher header animation
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/finisher-header@1.7.6/dist/finisher-header.es5.min.js';
    script.onload = () => {
      if (window.FinisherHeader) {
        new window.FinisherHeader({
          "count": 100,
          "size": {
            "min": 2,
            "max": 4,
            "pulse": 0.1
          },
          "speed": {
            "x": {
              "min": 0,
              "max": 0.4
            },
            "y": {
              "min": 0,
              "max": 0.7
            }
          },
          "colors": {
            "background": "#ffffff",
            "particles": [
              "#d041c5",
              "#42c0f2",
              "#d27e35",
              "#6a13a1"
            ]
          },
          "blending": "overlay",
          "opacity": {
            "center": 1,
            "edge": 0
          },
          "skew": 0,
          "shapes": [
            "t",
            "s"
          ]
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden premium-scroll relative">
      {/* Animated Background Header */}
      <div className="finisher-header absolute inset-0 w-full h-full" style={{ zIndex: 0 }}></div>
      
      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute top-32 left-16 animate-float opacity-10">
          <span className="text-2xl">💝</span>
        </div>
        <div className="absolute top-96 right-20 animate-float delay-1000 opacity-15">
          <span className="text-lg">⭐</span>
        </div>
        <div className="absolute top-[400px] left-1/4 animate-float delay-2000 opacity-20">
          <Sparkles className="w-5 h-5 text-purple-200" />
        </div>
        <div className="absolute top-[600px] right-1/3 animate-float delay-3000 opacity-15">
          <span className="text-xl">🎁</span>
        </div>
        <div className="absolute top-[200px] right-1/4 animate-float delay-4000 opacity-10">
          <span className="text-lg">💖</span>
        </div>
        <div className="absolute top-[500px] left-1/3 animate-float delay-5000 opacity-15">
          <span className="text-sm">✨</span>
        </div>
      </div>

      <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="border-rose-200/30 shadow-2xl backdrop-blur-md bg-white/95 dark:bg-gray-900/95">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16">
                <img src={logoImage} alt="The Written Hug" className="h-16 w-16 rounded-full object-cover shadow-lg transform scale-130" />
              </div>
              <CardTitle className="text-3xl great-vibes-font bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Admin Portal
              </CardTitle>
              <p className="text-muted-foreground">
                The Written Hug - Admin Access
              </p>
              {/* Location verification happens silently in background */}
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 border-rose-200/50 focus:border-rose-400 focus:ring-rose-400/20 backdrop-blur-sm"
                    placeholder="Enter your username"
                    required
                    data-testid="input-username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-rose-200/50 focus:border-rose-400 focus:ring-rose-400/20 backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                    data-testid="input-password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !locationPermissionGranted}
                  className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  data-testid="button-login"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : !locationPermissionGranted ? (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Waiting for location...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};



export default AdminLogin;