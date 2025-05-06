import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Save, User } from 'lucide-react';
import Header from '../../components/common/Header';
import { useAuth } from '../../contexts/AuthContext';
import { HOSTELS } from '../../config/constants';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import toast from 'react-hot-toast';

type ProfileFormValues = {
  name: string;
  email: string;
  hostelName: string;
  roomNumber: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const GirlsProfile: React.FC = () => {
  const { user, updateUserData } = useAuth();
  const [saving, setSaving] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      hostelName: user?.hostelName || '',
      roomNumber: user?.roomNumber || '',
    },
  });
  
  const newPassword = watch('newPassword');
  
  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Determine what's being updated (profile or password)
      if (editingPassword && data.currentPassword && data.newPassword) {
        await axios.put(
          `${API_URL}/api/users/update-password`,
          {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toast.success('Password updated successfully');
        setEditingPassword(false);
        reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const response = await axios.put(
          `${API_URL}/api/users/profile`,
          {
            name: data.name,
            hostelName: data.hostelName,
            roomNumber: data.roomNumber,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        updateUserData(response.data);
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="My Profile" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                    })}
                    className="form-input"
                  />
                  {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    disabled
                    className="form-input bg-neutral-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Email address cannot be changed
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hostelName" className="form-label">
                      Hostel
                    </label>
                    <select
                      id="hostelName"
                      {...register('hostelName', { required: 'Hostel is required' })}
                      className="form-input"
                    >
                      <option value="">Select your hostel</option>
                      {HOSTELS.girls.map((hostel) => (
                        <option key={hostel} value={hostel}>
                          {hostel}
                        </option>
                      ))}
                    </select>
                    {errors.hostelName && <p className="form-error">{errors.hostelName.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="roomNumber" className="form-label">
                      Room Number
                    </label>
                    <input
                      id="roomNumber"
                      type="text"
                      {...register('roomNumber', { 
                        required: 'Room number is required',
                        pattern: { 
                          value: /^[A-Za-z0-9-]+$/,
                          message: 'Enter a valid room number'
                        }
                      })}
                      className="form-input"
                    />
                    {errors.roomNumber && <p className="form-error">{errors.roomNumber.message}</p>}
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={saving || editingPassword}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
              
              <div className="mt-10 pt-6 border-t border-neutral-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Change Password</h3>
                  {!editingPassword && (
                    <button
                      onClick={() => setEditingPassword(true)}
                      className="btn-secondary text-sm py-1.5"
                    >
                      Change Password
                    </button>
                  )}
                </div>
                
                {editingPassword && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="form-label">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        {...register('currentPassword', {
                          required: 'Current password is required',
                        })}
                        className="form-input"
                      />
                      {errors.currentPassword && (
                        <p className="form-error">{errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="form-label">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        {...register('newPassword', {
                          required: 'New password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                          },
                        })}
                        className="form-input"
                      />
                      {errors.newPassword && (
                        <p className="form-error">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword', {
                          validate: (value) =>
                            value === newPassword || 'Passwords do not match',
                        })}
                        className="form-input"
                      />
                      {errors.confirmPassword && (
                        <p className="form-error">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="btn-primary flex items-center"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPassword(false);
                          reset({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="card p-6 text-center">
              <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={40} />
              </div>
              <h3 className="text-xl font-semibold">{user?.name}</h3>
              <p className="text-neutral-500 mb-4">{user?.email}</p>
              
              <div className="bg-neutral-50 rounded-md p-4 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Hostel:</span>
                    <span className="font-medium">{user?.hostelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Room:</span>
                    <span className="font-medium">{user?.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Role:</span>
                    <span className="font-medium capitalize">{user?.role || 'Student'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-neutral-500">
                <p>Member since {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-warning-800 mb-2">Important Note</h4>
              <p className="text-sm text-warning-700">
                Keep your hostel and room information up to date to ensure hostel staff can address your issues correctly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GirlsProfile;