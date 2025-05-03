import React, { useEffect, useState } from 'react';
import { PlusCircle, Clock, CheckCircle, TicketIcon, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import StatusCard from '../../components/dashboard/StatusCard';
import TicketCard from '../../components/tickets/TicketCard';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../contexts/AuthContext';

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
  resolved: number;
}

const BoysDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ticketsRes, statsRes] = await Promise.all([
          api.get('/tickets/my-tickets'),
          api.get('/tickets/my-stats')
        ]);
        
        setTickets(ticketsRes.data.slice(0, 3));
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header title="Dashboard" />
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
      <Header title="Dashboard" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatusCard 
            title="Total Tickets" 
            count={stats.total} 
            type="total" 
          />
          <StatusCard 
            title="Pending" 
            count={stats.pending} 
            type="pending" 
          />
          <StatusCard 
            title="In Progress" 
            count={stats.inProgress} 
            type="progress" 
          />
          <StatusCard 
            title="Resolved" 
            count={stats.resolved} 
            type="resolved" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-8">
          <div className="md:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Tickets</h2>
              <Link to="/boys/tickets" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {tickets.length === 0 ? (
              <div className="card text-center py-8">
                <TicketIcon size={48} className="mx-auto text-neutral-300 mb-3" />
                <h3 className="text-lg font-medium text-neutral-700 mb-2">No tickets yet</h3>
                <p className="text-neutral-500 mb-4">You haven't submitted any tickets yet</p>
                <Link to="/boys/new-ticket" className="btn-primary inline-flex items-center">
                  <PlusCircle size={16} className="mr-2" />
                  Submit Your First Ticket
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <TicketCard 
                    key={ticket._id} 
                    ticket={ticket}
                  />
                ))}
                
                {tickets.length > 0 && (
                  <Link 
                    to="/boys/tickets" 
                    className="btn-secondary w-full text-center block mt-4"
                  >
                    View All Tickets
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link 
                  to="/boys/new-ticket" 
                  className="flex items-center p-3 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors"
                >
                  <PlusCircle size={20} className="mr-3" />
                  <div>
                    <p className="font-medium">Submit New Ticket</p>
                    <p className="text-xs text-primary-600">Report a new issue</p>
                  </div>
                </Link>
                
                <Link 
                  to="/boys/tickets" 
                  className="flex items-center p-3 bg-neutral-50 text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  <Clock size={20} className="mr-3" />
                  <div>
                    <p className="font-medium">Track Pending Tickets</p>
                    <p className="text-xs text-neutral-600">Follow up on your submissions</p>
                  </div>
                </Link>
                
                <Link 
                  to="/boys/tickets?status=resolved" 
                  className="flex items-center p-3 bg-accent-50 text-accent-700 rounded-md hover:bg-accent-100 transition-colors"
                >
                  <CheckCircle size={20} className="mr-3" />
                  <div>
                    <p className="font-medium">View Resolved Issues</p>
                    <p className="text-xs text-accent-600">See your resolved tickets</p>
                  </div>
                </Link>
              </div>
            </div>
            
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-3">Your Information</h2>
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-neutral-500 w-24">Name:</span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <div className="flex">
                  <span className="text-neutral-500 w-24">Hostel:</span>
                  <span className="font-medium">{user?.hostelName}</span>
                </div>
                <div className="flex">
                  <span className="text-neutral-500 w-24">Room:</span>
                  <span className="font-medium">{user?.roomNumber}</span>
                </div>
                <div className="flex">
                  <span className="text-neutral-500 w-24">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-neutral-100">
                <Link to="/boys/profile" className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center">
                  <FileText size={16} className="mr-1" />
                  Update Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoysDashboard;