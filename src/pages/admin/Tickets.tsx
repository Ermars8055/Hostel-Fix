import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter, UserX } from 'lucide-react';
import Header from '../../components/common/Header';
import TicketCard from '../../components/tickets/TicketCard';
import { API_URL, TICKET_STATUS, HOSTELS, ISSUE_CATEGORIES } from '../../config/constants';
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

interface Pagination {
  total: number;
  pages: number;
  currentPage: number;
}

const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    hostel: '',
    category: '',
  });
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 1,
    currentPage: 1
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTickets();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters, pagination.currentPage, searchTerm]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '10'
      });
      
      if (filters.status) params.append('status', filters.status);
      if (filters.hostel) params.append('hostel', filters.hostel);
      if (filters.category) params.append('category', filters.category);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axios.get(`${API_URL}/api/admin/tickets?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTickets(response.data.tickets);
      setPagination({
        total: response.data.total,
        pages: response.data.pages,
        currentPage: response.data.currentPage
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/admin/tickets/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update ticket in state
      setTickets(tickets.map(ticket => 
        ticket._id === id ? { ...ticket, status } : ticket
      ));
      
      toast.success('Ticket status updated');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      hostel: '',
      category: '',
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Get all hostel options
  const allHostels = [...HOSTELS.boys, ...HOSTELS.girls];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header title="All Tickets" />
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
      <Header title="All Tickets" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="card mb-6 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by title, description, raised by..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="btn-secondary flex items-center"
              >
                <Filter size={16} className="mr-2" />
                Filters {Object.values(filters).some(Boolean) && '(Active)'}
              </button>
              
              {Object.values(filters).some(Boolean) && (
                <button
                  onClick={resetFilters}
                  className="btn-secondary text-sm py-1.5"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          
          {/* Filter Options */}
          {filterOpen && (
            <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
              <div>
                <label className="form-label text-sm">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="form-input py-1.5 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value={TICKET_STATUS.PENDING}>Pending</option>
                  <option value={TICKET_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={TICKET_STATUS.VIEWED}>Viewed</option>
                  <option value={TICKET_STATUS.RESOLVED}>Resolved</option>
                </select>
              </div>
              
              <div>
                <label className="form-label text-sm">Hostel</label>
                <select
                  value={filters.hostel}
                  onChange={(e) => setFilters({...filters, hostel: e.target.value})}
                  className="form-input py-1.5 text-sm"
                >
                  <option value="">All Hostels</option>
                  {allHostels.map((hostel) => (
                    <option key={hostel} value={hostel}>{hostel}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label text-sm">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="form-input py-1.5 text-sm"
                >
                  <option value="">All Categories</option>
                  {ISSUE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Ticket Count */}
        <div className="mb-4">
          <p className="text-neutral-600 text-sm">
            Showing <span className="font-semibold">{tickets.length}</span> of <span className="font-semibold">{pagination.total}</span> tickets
          </p>
        </div>
        
        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="card text-center py-12">
            <div className="flex justify-center mb-4">
              <UserX size={48} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-700 mb-2">No tickets found</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              {pagination.total === 0 
                ? "There are no tickets in the system yet."
                : "No tickets match your current filters. Try adjusting your search or filters."}
            </p>
            
            {pagination.total > 0 && (
              <button
                onClick={resetFilters}
                className="btn-primary mt-4"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
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
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        page === pagination.currentPage
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminTickets;