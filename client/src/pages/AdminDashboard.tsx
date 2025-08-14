import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, Search, Filter, Calendar, User, Mail, Phone, MessageSquare, BarChart3, Users, TrendingUp, Clock } from 'lucide-react';
import logoImage from '@assets/Untitled design (2)_1755165830517.png';
import { useLocation } from 'wouter';

interface Hug {
  id: string;
  Name: string;
  'Recipient\'s Name': string;
  'Email Address': string;
  'Phone Number': number;
  'Type of Message': string;
  'Message Details': string;
  Feelings: string;
  Story: string;
  'Specific Details': string;
  'Delivery Type': string;
  Status: string;
  Date: string;
}

const AdminDashboard = () => {
  const [hugs, setHugs] = useState<Hug[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchHugs();
    fetchUnreadCount();
    // Set up periodic refresh for unread count
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHugs = async () => {
    try {
      const response = await fetch('/api/getHugs');
      const result = await response.json();

      if (result.success) {
        setHugs(result.hugs || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch hugs",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching hugs:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/getUnreadCount');
      const result = await response.json();
      if (result.success) {
        setUnreadCount(result.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'replied': return 'bg-green-100 text-green-800 border-green-200';
      case 'client replied': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredHugs = hugs.filter(hug => {
    const matchesSearch = hug.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hug['Email Address'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      hug['Type of Message'].toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || hug.Status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || hug['Type of Message']?.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewConversation = (hugId: string) => {
    setLocation(`/admin/conversation/${hugId}`);
  };

  const getStats = () => {
    const total = hugs.length;
    const newCount = hugs.filter(h => h.Status?.toLowerCase() === 'new').length;
    const repliedCount = hugs.filter(h => h.Status?.toLowerCase() === 'replied').length;
    const clientRepliedCount = hugs.filter(h => h.Status?.toLowerCase() === 'client replied').length;
    const inProgressCount = hugs.filter(h => h.Status?.toLowerCase() === 'in progress').length;
    
    return { total, newCount, repliedCount, clientRepliedCount, inProgressCount, unreadCount };
  };

  const stats = getStats();

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    setLocation('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 relative overflow-hidden">
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 animate-float opacity-5">
          <span className="text-3xl">💝</span>
        </div>
        <div className="absolute top-80 right-16 animate-float delay-1000 opacity-8">
          <span className="text-2xl">⭐</span>
        </div>
        <div className="absolute top-40 right-1/3 animate-float delay-2000 opacity-10">
          <span className="text-xl">✨</span>
        </div>
        <div className="absolute top-96 left-1/4 animate-float delay-3000 opacity-6">
          <span className="text-2xl">🎁</span>
        </div>
        <div className="absolute top-60 left-2/3 animate-float delay-4000 opacity-7">
          <span className="text-lg">💖</span>
        </div>
        <div className="absolute top-[500px] right-20 animate-float delay-5000 opacity-9">
          <span className="text-xl">🌟</span>
        </div>
        <div className="absolute top-[300px] left-1/2 animate-float delay-6000 opacity-5">
          <span className="text-lg">💌</span>
        </div>
        <div className="absolute top-[700px] left-16 animate-float delay-7000 opacity-8">
          <span className="text-sm">✨</span>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-rose-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src={logoImage} alt="Logo" className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">The Written Hug Management</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Messages</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.newCount}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Replied</p>
                  <p className="text-3xl font-bold text-green-600">{stats.repliedCount}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.inProgressCount}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-white border border-rose-100 p-1 rounded-lg shadow-sm">
            <TabsTrigger 
              value="orders" 
              className="px-6 py-2 text-sm font-medium data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="communications" 
              className="px-6 py-2 text-sm font-medium data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Communications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="bg-white border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <CardTitle className="text-xl text-gray-900 flex items-center">
                  <img src={logoImage} alt="Logo" className="w-5 h-5 mr-2" />
                  Message Orders Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, or message type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-rose-300 focus:ring-rose-200"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-gray-200 focus:border-rose-300 focus:ring-rose-200">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="border-gray-200 focus:border-rose-300 focus:ring-rose-200">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="love letter">Love Letter</SelectItem>
                      <SelectItem value="gratitude note">Gratitude Note</SelectItem>
                      <SelectItem value="apology">Apology</SelectItem>
                      <SelectItem value="celebration">Celebration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {filteredHugs.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No messages found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search filters</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredHugs.map((hug) => (
                          <div key={hug.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                              <div className="lg:col-span-2">
                                <div className="flex items-center space-x-3">
                                  <User className="h-5 w-5 text-gray-400" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{hug.Name}</p>
                                    <p className="text-xs text-gray-500 truncate">To: {hug['Recipient\'s Name']}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600 truncate">{hug['Email Address']}</span>
                                </div>
                              </div>
                              
                              <div>
                                <Badge variant="outline" className="text-xs">
                                  {hug['Type of Message']}
                                </Badge>
                              </div>
                              
                              <div>
                                <Badge className={`text-xs border ${getStatusColor(hug.Status)}`}>
                                  {hug.Status || 'New'}
                                </Badge>
                              </div>
                              
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => handleViewConversation(hug.id)}
                                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2"
                                  data-testid={`button-view-${hug.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications">
            <Card className="bg-white border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <CardTitle className="text-xl text-gray-900 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-rose-500" />
                  Client Communications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredHugs.map((hug) => (
                    <div key={hug.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{hug.Name}</h3>
                          <p className="text-sm text-gray-500">{hug['Email Address']} • {new Date(hug.Date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs border ${getStatusColor(hug.Status)}`}>
                            {hug.Status || 'New'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewConversation(hug.id)}
                            data-testid={`button-view-conversation-${hug.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Open
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p className="mb-2"><strong>Service:</strong> {hug['Type of Message']} • {hug['Delivery Type']}</p>
                        <p className="mb-2"><strong>Message:</strong></p>
                        <div className="bg-gray-50 p-3 rounded border text-xs overflow-hidden">
                          <p className="line-clamp-2">{hug.Feelings}</p>
                          {hug.Story && (
                            <p className="mt-2 line-clamp-2 text-gray-500">{hug.Story}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;