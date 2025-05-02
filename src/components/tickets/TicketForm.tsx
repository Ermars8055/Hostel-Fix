import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Camera, Upload, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ISSUE_CATEGORIES, HOSTELS } from '../../config/constants';

type TicketFormProps = {
  onSubmit: (data: TicketFormValues) => Promise<void>;
  loading: boolean;
};

export type TicketFormValues = {
  title: string;
  description: string;
  category: string;
  hostelName: string;
  roomNumber: string;
  image?: File | null;
};

const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, loading }) => {
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<TicketFormValues>({
    defaultValues: {
      hostelName: user?.hostelName || '',
      roomNumber: user?.roomNumber || '',
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setValue('image', null);
    setImagePreview(null);
  };

  const submitHandler: SubmitHandler<TicketFormValues> = async (data) => {
    await onSubmit(data);
    reset();
    setImagePreview(null);
  };

  // Get the hostels based on user role
  const getHostelOptions = () => {
    if (user?.role === 'boys') {
      return HOSTELS.boys;
    } else if (user?.role === 'girls') {
      return HOSTELS.girls;
    }
    return [];
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <div>
        <label htmlFor="title" className="form-label">
          Issue Title
        </label>
        <input
          id="title"
          type="text"
          {...register('title', { 
            required: 'Title is required',
            minLength: { value: 5, message: 'Title must be at least 5 characters' } 
          })}
          className="form-input"
          placeholder="Brief description of the issue"
        />
        {errors.title && <p className="form-error">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="category" className="form-label">
          Issue Category
        </label>
        <select
          id="category"
          {...register('category', { required: 'Category is required' })}
          className="form-input"
        >
          <option value="">Select an issue category</option>
          {ISSUE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p className="form-error">{errors.category.message}</p>}
      </div>

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
          {getHostelOptions().map((hostel) => (
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
          placeholder="E.g., 101, A-204"
        />
        {errors.roomNumber && <p className="form-error">{errors.roomNumber.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="form-label">
          Detailed Description
        </label>
        <textarea
          id="description"
          {...register('description', { 
            required: 'Description is required',
            minLength: { value: 20, message: 'Description must be at least 20 characters' } 
          })}
          className="form-input min-h-32"
          placeholder="Provide a detailed description of the issue"
          rows={6}
        />
        {errors.description && <p className="form-error">{errors.description.message}</p>}
      </div>

      <div>
        <label className="form-label">Image (Optional)</label>
        <div className="border-2 border-dashed border-neutral-300 rounded-md p-4 text-center">
          {!imagePreview ? (
            <>
              <Camera size={36} className="mx-auto text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-500 mb-2">Upload an image of the issue</p>
              <label className="btn-secondary inline-flex items-center cursor-pointer">
                <Upload size={16} className="mr-2" />
                Select Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-md"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-error-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="btn-primary w-full flex justify-center items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
              Submitting...
            </>
          ) : (
            'Submit Ticket'
          )}
        </button>
      </div>
    </form>
  );
};

export default TicketForm;