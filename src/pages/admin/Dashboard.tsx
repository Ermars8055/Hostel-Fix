import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Clock, UserX, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Header from '../../components/common/Header';
import StatusCard from '../../components/dashboard/StatusCard';
import StatsChart from '../../components/dashboard/StatsChart';
import TicketCard from '../../components/tickets/TicketCard';
import { API_URL, TICKET_STATUS } from '../../config/constants';
import { useNavigate } from 'react-router-dom';

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
}

interface TicketStats {
  total: number;
  pending: number;
  inProgress: number;
  viewed: number;
  resolved: number;
}

const AdminDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    viewed: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [ticketsRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/api/tickets/recent`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/tickets/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setTickets(ticketsRes.data.slice(0, 5));
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/tickets/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update ticket in state
      setTickets(tickets.map(ticket => 
        ticket._id === id ? { ...ticket, status } : ticket
      ));
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  // Mock data for charts (replace with real data)
  const hostelData = {
    labels: ['Boys 1', 'Boys 2', 'Boys 3', 'Boys 4', 'Boys 5', 'Girls 1', 'Girls 2'],
    datasets: [
      {
        label: 'Active Tickets',
        data: [12, 8, 15, 10, 6, 14, 9],
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // primary-500
      },
      {
        label: 'Resolved Tickets',
        data: [8, 5, 10, 7, 4, 9, 6],
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // accent-500
      },
    ],
  };

  const categoryData = {
    labels: ['Plumbing', 'Electrical', 'Furniture', 'Cleanliness', 'Pests', 'Internet', 'Security'],
    datasets: [
      {
        label: 'Number of Tickets',
        data: [18, 15, 10, 12, 8, 20, 5],
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatusCard 
            title="Total Tickets" 
            count={stats.total} 
            type="total" 
            changePercentage={8}
          />
          <StatusCard 
            title="Pending" 
            count={stats.pending} 
            type="pending" 
            changePercentage={-5}
          />
          <StatusCard 
            title="In Progress" 
            count={stats.inProgress} 
            type="progress" 
            changePercentage={12}
          />
          <StatusCard 
            title="Resolved" 
            count={stats.resolved} 
            type="resolved" 
            changePercentage={3}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <StatsChart 
            title="Tickets by Hostel" 
            data={hostelData} 
          />
          <StatsChart 
            title="Tickets by Category" 
            data={categoryData} 
          />
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Tickets</h2>
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
              <h3 className="text-lg font-medium text-neutral-700 mb-2">No tickets found</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                There are no tickets in the system yet. They will appear here when students submit them.
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