import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Clock, UserX, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Header from '../../components/common/Header';
import StatusCard from '../../components/dashboard/StatusCard';
import StatsChart from '../../components/dashboard/StatsChart';
import TicketCard from '../../components/tickets/TicketCard';
import { API_URL, TICKET_STATUS } from '../../config/constants';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  hostelName: string;
  roomNumber: string;
  studentName: string;
  createdAt: string;
  imageUrl?: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    role: string;
    hostelName: string;
    roomNumber: string;
  };
}

interface TicketStats {
  total: number;
  byStatus: {
    [key: string]: number;
  };
  byHostel: {
    _id: string;
    count: number;
  }[];
  byCategory: {
    _id: string;
    count: number;
  }[];
  monthlyTrends: {
    _id: {
      year: number;
      month: number;
    };
    submitted: number;
    resolved: number;
  }[];
}

interface SystemStats {
  totalUsers: number;
  totalTickets: number;
  activeTickets: number;
  resolvedTickets: number;
  usersByRole: {
    [key: string]: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    byStatus: {},
    byHostel: [],
    byCategory: [],
    monthlyTrends: []
  });
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalTickets: 0,
    activeTickets: 0,
    resolvedTickets: 0,
    usersByRole: {}
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [ticketsRes, statsRes, systemStatsRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/tickets?limit=5&status=open,in-progress`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/admin/tickets/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setTickets(ticketsRes.data.tickets);
        setStats(statsRes.data);
        setSystemStats(systemStatsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const ticket = tickets.find(t => t._id === id);
      if (!ticket) return;

      await axios.put(
        `${API_URL}/api/admin/tickets/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update ticket in state
      setTickets(tickets.map(t => 
        t._id === id ? { ...t, status } : t
      ));
      
      // Update stats
      setStats(prevStats => {
        const newStats = { ...prevStats };
        if (ticket.status === 'pending') newStats.byStatus.pending--;
        if (ticket.status === 'in-progress') newStats.byStatus['in-progress']--;
        if (ticket.status === 'viewed') newStats.byStatus.viewed--;
        if (ticket.status === 'resolved') newStats.byStatus.resolved--;
        
        if (status === 'pending') newStats.byStatus.pending++;
        if (status === 'in-progress') newStats.byStatus['in-progress']++;
        if (status === 'viewed') newStats.byStatus.viewed++;
        if (status === 'resolved') newStats.byStatus.resolved++;
        
        return newStats;
      });
      
      toast.success('Ticket status updated');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  // Calculate change percentages
  const calculateChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Get previous month's data for comparison
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const currentMonth = new Date();

  const previousMonthData = stats.monthlyTrends.find(
    trend => trend._id.year === previousMonth.getFullYear() && 
    trend._id.month === previousMonth.getMonth() + 1
  );

  const currentMonthData = stats.monthlyTrends.find(
    trend => trend._id.year === currentMonth.getFullYear() && 
    trend._id.month === currentMonth.getMonth() + 1
  );

  const totalChange = calculateChangePercentage(
    currentMonthData?.submitted || 0,
    previousMonthData?.submitted || 0
  );

  const pendingChange = calculateChangePercentage(
    stats.byStatus.pending || 0,
    previousMonthData?.submitted || 0
  );

  const inProgressChange = calculateChangePercentage(
    stats.byStatus['in-progress'] || 0,
    previousMonthData?.submitted || 0
  );

  // Prepare data for charts
  const hostelData = {
    labels: stats.byHostel.map(h => h._id),
    datasets: [
      {
        label: 'Pending',
        data: stats.byHostel.map(h => {
          const hostelTickets = tickets.filter(t => t.hostelName === h._id);
          return hostelTickets.filter(t => t.status === 'pending').length;
        }),
        backgroundColor: 'rgba(245, 158, 11, 0.7)', // warning-500
      },
      {
        label: 'In Progress',
        data: stats.byHostel.map(h => {
          const hostelTickets = tickets.filter(t => t.hostelName === h._id);
          return hostelTickets.filter(t => t.status === 'in-progress').length;
        }),
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // primary-500
      }
    ],
  };

  const categoryData = {
    labels: stats.byCategory.map(c => c._id),
    datasets: [
      {
        label: 'Number of Tickets',
        data: stats.byCategory.map(c => c.count),
        backgroundColor: 'rgba(245, 158, 11, 0.7)', // warning-500
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header title="Admin Dashboard" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="Admin Dashboard" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatusCard 
            title="Total Tickets" 
            count={stats.total} 
            type="total" 
            changePercentage={totalChange}
          />
          <StatusCard 
            title="Pending" 
            count={stats.byStatus.pending || 0} 
            type="pending" 
            changePercentage={pendingChange}
          />
          <StatusCard 
            title="In Progress" 
            count={stats.byStatus['in-progress'] || 0} 
            type="progress" 
            changePercentage={inProgressChange}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <StatsChart 
            title="Active Tickets by Hostel" 
            data={hostelData} 
          />
          <StatsChart 
            title="Tickets by Category" 
            data={categoryData} 
          />
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Active Tickets</h2>
            <button 
              onClick={() => navigate('/admin/tickets')}
              className="btn-secondary flex items-center text-sm"
            >
              View All
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          {tickets.length === 0 ? (
            <div className="card text-center py-12">
              <div className="flex justify-center mb-4">
                <UserX size={48} className="text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-2">No active tickets</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                There are no active tickets in the system. They will appear here when students submit them.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <TicketCard 
                  key={ticket._id} 
                  ticket={ticket} 
                  isAdmin={true}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;