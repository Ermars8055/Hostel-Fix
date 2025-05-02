import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, UserX } from 'lucide-react';
import Header from '../../components/common/Header';
import TicketCard from '../../components/tickets/TicketCard';
import { API_URL, TICKET_STATUS, ISSUE_CATEGORIES } from '../../config/constants';
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
}

const BoysTickets: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || '';
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: initialStatus,
    category: '',
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/tickets/my-tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTickets(response.data);
        setFilteredTickets(response.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...tickets];
    
    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        ticket => 
          ticket.title.toLowerCase().includes(search) ||
          ticket.description.toLowerCase().includes(search) ||
          ticket.category.toLowerCase().includes(search)
      );
    }
    
    // Apply filters
    if (filters.status) {
      result = result.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.category) {
      result = result.filter(ticket => ticket.category === filters.category);
    }
    
    setFilteredTickets(result);
  }, [searchTerm, filters, tickets]);

  const resetFilters = () => {
    setFilters({
      status: '',
      category: '',
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header title="My Tickets" />
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
      <Header title="My Tickets" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="card mb-6 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search tickets..."
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
            <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
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
            Showing <span className="font-semibold">{filteredTickets.length}</span> tickets
          </p>
        </div>
        
        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="card text-center py-12">
            <div className="flex justify-center mb-4">
              <UserX size={48} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-700 mb-2">No tickets found</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              {tickets.length === 0 
                ? "You haven't submitted any tickets yet."
                : "No tickets match your current filters. Try adjusting your search or filters."}
            </p>
            
            {tickets.length > 0 && (
              <button
                onClick={resetFilters}
                className="btn-primary mt-4"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <TicketCard 
                key={ticket._id} 
                ticket={ticket}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoysTickets;