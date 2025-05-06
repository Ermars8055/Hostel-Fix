import React from 'react';
import { format } from 'date-fns';
import { Eye, MessageSquare, Clock, CheckCircle, AlertCircle, Image as ImageIcon, Maximize2, User } from 'lucide-react';
import { TICKET_STATUS } from '../../config/constants';
import { API_URL } from '../../config/constants';

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

type TicketCardProps = {
  ticket: Ticket;
  isAdmin?: boolean;
  onStatusChange?: (id: string, status: string) => void;
};

const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  isAdmin = false,
  onStatusChange
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case TICKET_STATUS.PENDING:
        return <Clock size={16} className="mr-1 text-warning-500" />;
      case TICKET_STATUS.IN_PROGRESS:
        return <AlertCircle size={16} className="mr-1 text-primary-500" />;
      case TICKET_STATUS.VIEWED:
        return <Eye size={16} className="mr-1 text-neutral-500" />;
      case TICKET_STATUS.RESOLVED:
        return <CheckCircle size={16} className="mr-1 text-accent-500" />;
      default:
        return <Clock size={16} className="mr-1 text-warning-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case TICKET_STATUS.PENDING:
        return 'status-pending';
      case TICKET_STATUS.IN_PROGRESS:
        return 'status-in-progress';
      case TICKET_STATUS.VIEWED:
        return 'status-viewed';
      case TICKET_STATUS.RESOLVED:
        return 'status-resolved';
      default:
        return 'status-pending';
    }
  };

  // Get the full image URL
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <div className="card hover:shadow-md transition-shadow mb-4 animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">{ticket.title}</h3>
          <p className="text-sm text-neutral-500 mt-1">
            {format(new Date(ticket.createdAt), 'MMM dd, yyyy • h:mm a')}
          </p>
        </div>
        <div className={getStatusClass(ticket.status)}>
          {getStatusIcon(ticket.status)}
          <span>
            {ticket.status === TICKET_STATUS.IN_PROGRESS
              ? 'In Progress'
              : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </span>
        </div>
      </div>

      <p className="text-neutral-700 mb-4">{ticket.description}</p>

      {ticket.imageUrl && (
        <div className="mb-4">
          <div className="flex items-center text-sm text-neutral-500 mb-2">
            <ImageIcon size={16} className="mr-1" />
            <span>Attached Image</span>
          </div>
          <div className="relative group">
            <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden bg-neutral-100">
              <img 
                src={getImageUrl(ticket.imageUrl)} 
                alt="Ticket issue" 
                className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Not+Available';
                  e.currentTarget.classList.add('opacity-50');
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
              <button
                onClick={() => window.open(getImageUrl(ticket.imageUrl), '_blank')}
                className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 text-neutral-800 px-3 py-1 rounded-md text-sm font-medium transition-opacity duration-200 flex items-center"
              >
                <Maximize2 size={14} className="mr-1" />
                View Full Image
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-neutral-50 p-3 rounded-md">
          <p className="text-xs text-neutral-500 mb-1">Category</p>
          <p className="text-sm font-medium">{ticket.category}</p>
        </div>
        <div className="bg-neutral-50 p-3 rounded-md">
          <p className="text-xs text-neutral-500 mb-1">Location</p>
          <p className="text-sm font-medium">{`${ticket.hostelName}, Room ${ticket.roomNumber}`}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <User className="w-4 h-4" />
        <span>Raised by: {ticket.user?.name || 'Unknown'}</span>
      </div>

      {isAdmin && (
        <div className="border-t border-neutral-100 pt-4 mt-2">
          <p className="text-sm font-medium mb-2">Update Status:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onStatusChange?.(ticket._id, TICKET_STATUS.VIEWED)}
              className={`btn-secondary text-xs py-1.5 ${
                ticket.status === TICKET_STATUS.VIEWED ? 'bg-neutral-300' : ''
              }`}
              disabled={ticket.status === TICKET_STATUS.RESOLVED}
            >
              <Eye size={14} className="mr-1" />
              Mark as Viewed
            </button>
            <button
              onClick={() => onStatusChange?.(ticket._id, TICKET_STATUS.IN_PROGRESS)}
              className={`btn-primary text-xs py-1.5 ${
                ticket.status === TICKET_STATUS.IN_PROGRESS ? 'bg-primary-700' : ''
              }`}
              disabled={ticket.status === TICKET_STATUS.RESOLVED}
            >
              <AlertCircle size={14} className="mr-1" />
              In Progress
            </button>
            <button
              onClick={() => onStatusChange?.(ticket._id, TICKET_STATUS.RESOLVED)}
              className={`btn-accent text-xs py-1.5 ${
                ticket.status === TICKET_STATUS.RESOLVED ? 'bg-accent-700' : ''
              }`}
            >
              <CheckCircle size={14} className="mr-1" />
              Mark as Resolved
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketCard;