import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/common/Header';
import StatsChart from '../../components/dashboard/StatsChart';
import { API_URL } from '../../config/constants';
import toast from 'react-hot-toast';

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
  resolutionTimes: {
    _id: string;
    avgResolutionTime: number;
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

const AdminStats: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [ticketStats, setTicketStats] = useState<TicketStats>({
    total: 0,
    byStatus: {},
    byHostel: [],
    byCategory: [],
    monthlyTrends: [],
    resolutionTimes: []
  });
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalTickets: 0,
    activeTickets: 0,
    resolvedTickets: 0,
    usersByRole: {}
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [ticketStatsRes, systemStatsRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/tickets/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setTicketStats(ticketStatsRes.data);
        setSystemStats(systemStatsRes.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Prepare data for charts
  const hostelData = {
    labels: ticketStats.byHostel.map(h => h._id),
    datasets: [
      {
        label: 'Pending',
        data: ticketStats.byHostel.map(h => 
          ticketStats.byStatus.pending || 0
        ),
        backgroundColor: 'rgba(245, 158, 11, 0.7)', // warning-500
      },
      {
        label: 'In Progress',
        data: ticketStats.byHostel.map(h => 
          ticketStats.byStatus['in-progress'] || 0
        ),
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // primary-500
      },
      {
        label: 'Resolved',
        data: ticketStats.byHostel.map(h => 
          ticketStats.byStatus.resolved || 0
        ),
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // accent-500
      },
    ],
  };

  const categoryData = {
    labels: ticketStats.byCategory.map(c => c._id),
    datasets: [
      {
        label: 'Number of Tickets',
        data: ticketStats.byCategory.map(c => c.count),
        backgroundColor: 'rgba(124, 58, 237, 0.7)', // purple
      },
    ],
  };

  // Process monthly trends data
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Tickets Submitted',
        data: Array(12).fill(0).map((_, i) => {
          const monthData = ticketStats.monthlyTrends.find(
            trend => trend._id.month === i + 1
          );
          return monthData ? monthData.submitted : 0;
        }),
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // primary-500
      },
      {
        label: 'Tickets Resolved',
        data: Array(12).fill(0).map((_, i) => {
          const monthData = ticketStats.monthlyTrends.find(
            trend => trend._id.month === i + 1
          );
          return monthData ? monthData.resolved : 0;
        }),
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // accent-500
      },
    ],
  };

  const resolutionTimeData = {
    labels: ticketStats.resolutionTimes.map(r => r._id),
    datasets: [
      {
        label: 'Average Resolution Time (Days)',
        data: ticketStats.resolutionTimes.map(r => 
          Math.round(r.avgResolutionTime * 10) / 10
        ),
        backgroundColor: 'rgba(239, 68, 68, 0.7)', // error-500
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header title="Statistics" />
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
      <Header title="Statistics" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Overview Statistics</h2>
          <p className="text-neutral-600 mb-2">
            This dashboard provides a comprehensive view of all ticket statistics across hostels.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StatsChart 
            title="Tickets by Hostel" 
            data={hostelData} 
          />
          <StatsChart 
            title="Tickets by Category" 
            data={categoryData} 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatsChart 
            title="Monthly Ticket Trends" 
            data={monthlyData} 
          />
          <StatsChart 
            title="Average Resolution Time" 
            data={resolutionTimeData} 
          />
        </div>
        
        <div className="card mt-8">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-neutral-800 mb-2">Most Common Issues</h4>
              <ol className="list-decimal pl-5 space-y-1">
                {ticketStats.byCategory
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 4)
                  .map((category) => (
                    <li key={category._id} className="text-neutral-700">
                      {category._id} ({category.count} tickets)
                    </li>
                  ))}
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-neutral-800 mb-2">User Distribution</h4>
              <ol className="list-decimal pl-5 space-y-1">
                {Object.entries(systemStats.usersByRole)
                  .filter(([role]) => role !== 'admin')
                  .map(([role, count]) => (
                    <li key={role} className="text-neutral-700">
                      {role.charAt(0).toUpperCase() + role.slice(1)}: {count} users
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;