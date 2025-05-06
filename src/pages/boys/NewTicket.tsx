import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import TicketForm, { TicketFormValues } from '../../components/tickets/TicketForm';
import { API_URL } from '../../config/constants';
import toast from 'react-hot-toast';
import { useAuth, api } from '../../contexts/AuthContext';

const BoysNewTicket: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (data: TicketFormValues) => {
    setLoading(true);
    
    try {
      // Create form data for multipart/form-data upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('hostelName', data.hostelName);
      formData.append('roomNumber', data.roomNumber);
      formData.append('priority', 'medium'); // Default priority
      
      // Append image if exists
      if (data.image) {
        formData.append('image', data.image);
      }
      
      await api.post('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Ticket submitted successfully');
      navigate('/boys/tickets');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="Submit New Ticket" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Report an Issue</h2>
              <TicketForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="card mb-6">
              <h2 className="text-lg font-semibold mb-4">Submission Guidelines</h2>
              <ul className="space-y-3 text-neutral-700">
                <li className="flex">
                  <span className="text-primary-600 font-medium mr-2">•</span>
                  <span>Provide a clear and concise title for your issue</span>
                </li>
                <li className="flex">
                  <span className="text-primary-600 font-medium mr-2">•</span>
                  <span>Select the appropriate category for faster processing</span>
                </li>
                <li className="flex">
                  <span className="text-primary-600 font-medium mr-2">•</span>
                  <span>Include detailed description of the problem</span>
                </li>
                <li className="flex">
                  <span className="text-primary-600 font-medium mr-2">•</span>
                  <span>Add an image if it helps illustrate the issue</span>
                </li>
                <li className="flex">
                  <span className="text-primary-600 font-medium mr-2">•</span>
                  <span>Double-check your hostel and room information</span>
                </li>
              </ul>
            </div>
            
            <div className="card bg-primary-50 border border-primary-100">
              <h3 className="text-lg font-semibold text-primary-800 mb-3">Your Information</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-primary-700 w-20">Name:</span>
                  <span className="font-medium text-primary-900">{user?.name}</span>
                </div>
                <div className="flex">
                  <span className="text-primary-700 w-20">Hostel:</span>
                  <span className="font-medium text-primary-900">{user?.hostelName}</span>
                </div>
                <div className="flex">
                  <span className="text-primary-700 w-20">Room:</span>
                  <span className="font-medium text-primary-900">{user?.roomNumber}</span>
                </div>
              </div>
              <p className="text-sm text-primary-700 mt-4">
                This information will be automatically included with your ticket
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoysNewTicket;