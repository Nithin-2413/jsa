import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, Search, Filter, Calendar, User, Mail, Phone } from 'lucide-react';
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

const AdminOrders = () => {
  const [hugs, setHugs] = useState<Hug[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchHugs();
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-500';
      case 'replied': return 'bg-green-500';
      case 'in progress': return 'bg-yellow-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredHugs = hugs.filter(hug => {
    const matchesSearch = hug.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hug['Email Address']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hug['Recipient\'s Name']?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || hug.Status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesType = typeFilter === 'all' || hug['Type of Message']?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const messageTypes = [...new Set(hugs.map(hug => hug['Type of Message']).filter(Boolean))];
  const statuses = [...new Set(hugs.map(hug => hug.Status).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            <p className="mt-4 text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage and respond to customer submissions ({filteredHugs.length} of {hugs.length} orders)
            </p>
          </div>

          <Button 
            onClick={fetchHugs}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or recipient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status.toLowerCase()}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Message Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {messageTypes.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Grid */}
        {filteredHugs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {hugs.length === 0 ? "No customer submissions yet." : "Try adjusting your search filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHugs.map((hug) => (
              <Card key={hug.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold group-hover:text-rose-600 transition-colors">
                      {hug.Name || 'Unknown'}
                    </CardTitle>
                    <Badge className={`${getStatusColor(hug.Status)} text-white text-xs`}>
                      {hug.Status || 'Unknown'}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>To: {hug['Recipient\'s Name'] || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{hug['Email Address'] || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{hug['Phone Number'] || 'No phone'}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-sm text-rose-600">
                        {hug['Type of Message'] || 'Unknown Type'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {hug['Delivery Type'] || 'Standard Delivery'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm line-clamp-2 text-muted-foreground">
                        {hug.Feelings || hug['Message Details'] || 'No message preview'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {hug.Date ? new Date(hug.Date).toLocaleDateString() : 'Unknown date'}
                      </div>

                      <Button 
                        onClick={() => setLocation(`/admin/${hug.id}`)}
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 group-hover:bg-rose-50 group-hover:border-rose-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;