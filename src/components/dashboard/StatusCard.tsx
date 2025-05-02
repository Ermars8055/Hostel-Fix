import React from 'react';
import { 
  Clock, CheckCircle, AlertCircle, Eye, Ticket, 
  ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

type StatusCardProps = {
  title: string;
  count: number;
  type: 'pending' | 'progress' | 'resolved' | 'viewed' | 'total';
  changePercentage?: number;
};

const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  count, 
  type,
  changePercentage
}) => {
  const getIcon = () => {
    switch (type) {
      case 'pending':
        return <Clock size={20} className="text-warning-500" />;
      case 'progress':
        return <AlertCircle size={20} className="text-primary-500" />;
      case 'resolved':
        return <CheckCircle size={20} className="text-accent-500" />;
      case 'viewed':
        return <Eye size={20} className="text-neutral-500" />;
      case 'total':
        return <Ticket size={20} className="text-primary-600" />;
      default:
        return <Ticket size={20} className="text-primary-600" />;
    }
  };

  const getCardStyle = () => {
    switch (type) {
      case 'pending':
        return 'border-l-4 border-warning-500 bg-warning-50';
      case 'progress':
        return 'border-l-4 border-primary-500 bg-primary-50';
      case 'resolved':
        return 'border-l-4 border-accent-500 bg-accent-50';
      case 'viewed':
        return 'border-l-4 border-neutral-500 bg-neutral-50';
      case 'total':
        return 'border-l-4 border-primary-600 bg-primary-50';
      default:
        return 'border-l-4 border-primary-500 bg-primary-50';
    }
  };

  return (
    <div className={`card ${getCardStyle()}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-neutral-600">{title}</span>
        <div className="p-2 rounded-full bg-white shadow-sm">
          {getIcon()}
        </div>
      </div>
      
      <div className="flex items-end space-x-1">
        <p className="text-2xl font-bold">{count}</p>
        
        {changePercentage !== undefined && (
          <div className={`flex items-center text-xs font-medium mb-1 ${
            changePercentage >= 0 ? 'text-accent-600' : 'text-error-600'
          }`}>
            {changePercentage >= 0 ? (
              <ArrowUpRight size={14} className="mr-0.5" />
            ) : (
              <ArrowDownRight size={14} className="mr-0.5" />
            )}
            <span>{Math.abs(changePercentage)}%</span>
          </div>
        )}
      </div>
      
      {changePercentage !== undefined && (
        <p className="text-xs text-neutral-500 mt-1">
          vs previous week
        </p>
      )}
    </div>
  );
};

export default StatusCard;