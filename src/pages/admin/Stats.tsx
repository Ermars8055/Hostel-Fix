import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/common/Header';
import StatsChart from '../../components/dashboard/StatsChart';
import { API_URL } from '../../config/constants';

const AdminStats: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.get(`${API_URL}/api/tickets/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Mock data for demonstration purposes
  const hostelData = {
    labels: ['Boys 1', 'Boys 2', 'Boys 3', 'Boys 4', 'Boys 5', 'Girls 1', 'Girls 2'],
    datasets: [
      {
        label: 'Pending',
        data: [5, 3, 7, 4, 2, 6, 3],
        backgroundColor: 'rgba(245, 158, 11, 0.7)', // warning-500
      },
      {
        label: 'In Progress',
        data: [3, 2, 4, 3, 1, 5, 2],
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // primary-500
      },
      {
        label: 'Resolved',
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
        backgroundColor: 'rgba(124, 58, 237, 0.7)', // purple
      },
    ],
  };

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Tickets Submitted',
        data: [12, 15, 18, 14, 22, 16, 17, 20, 24, 19, 14, 16],
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // primary-500
      },
      {
        label: 'Tickets Resolved',
        data: [10, 12, 15, 11, 18, 15, 15, 17, 20, 16, 12, 14],
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // accent-500
      },
    ],
  };

  const resolutionTimeData = {
    labels: ['Boys 1', 'Boys 2', 'Boys 3', 'Boys 4', 'Boys 5', 'Girls 1', 'Girls 2'],
    datasets: [
      {
        label: 'Average Resolution Time (Days)',
        data: [2.4, 3.1, 2.7, 3.5, 2.9, 2.2, 2.8],
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
                <li className="text-neutral-700">Internet connectivity (20 tickets)</li>
                <li className="text-neutral-700">Plumbing issues (18 tickets)</li>
                <li className="text-neutral-700">Electrical problems (15 tickets)</li>
                <li className="text-neutral-700">Cleanliness concerns (12 tickets)</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-neutral-800 mb-2">Fastest Resolution</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li className="text-neutral-700">Girls Hostel 1 (2.2 days average)</li>
                <li className="text-neutral-700">Boys Hostel 1 (2.4 days average)</li>
                <li className="text-neutral-700">Boys Hostel 3 (2.7 days average)</li>
                <li className="text-neutral-700">Girls Hostel 2 (2.8 days average)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;