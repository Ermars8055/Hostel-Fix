import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { UserPlus, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { HOSTELS } from '../../config/constants';
import RegisterBackground from '../../components/testbg/RegisterBackground';

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'boys' | 'girls';
  hostelName: string;
  roomNumber: string;
};

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'boys' | 'girls'>('boys');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      role: 'boys',
    },
  });

  const password = watch('password');

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      toast.success('Registration successful');
      
      // Redirect based on role
      if (data.role === 'boys') {
        navigate('/boys/dashboard');
      } else {
        navigate('/girls/dashboard');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getHostelOptions = () => {
    return selectedRole === 'boys' ? HOSTELS.boys : HOSTELS.girls;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegisterBackground />
      
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building2 size={40} className="text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Hostel Fix</h1>
            <p className="text-neutral-600">Create your account</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                className="form-input bg-white/50 backdrop-blur-sm"
                placeholder="John Doe"
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
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="form-input bg-white/50 backdrop-blur-sm"
                placeholder="your@example.com"
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="form-input bg-white/50 backdrop-blur-sm"
                  placeholder="••••••••"
                />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  className="form-input bg-white/50 backdrop-blur-sm"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">You are a:</label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <label className={`
                  flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all duration-200
                  ${selectedRole === 'boys' 
                    ? 'border-primary-500 bg-primary-50/50 backdrop-blur-sm text-primary-700' 
                    : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50/50'}
                `}>
                  <input
                    type="radio"
                    value="boys"
                    {...register('role', { required: 'Please select your role' })}
                    className="sr-only"
                    onChange={() => setSelectedRole('boys')}
                  />
                  <span className="text-sm font-medium">Boys Hostel Student</span>
                </label>
                
                <label className={`
                  flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all duration-200
                  ${selectedRole === 'girls' 
                    ? 'border-primary-500 bg-primary-50/50 backdrop-blur-sm text-primary-700' 
                    : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50/50'}
                `}>
                  <input
                    type="radio"
                    value="girls"
                    {...register('role', { required: 'Please select your role' })}
                    className="sr-only"
                    onChange={() => setSelectedRole('girls')}
                  />
                  <span className="text-sm font-medium">Girls Hostel Student</span>
                </label>
              </div>
              {errors.role && <p className="form-error">{errors.role.message}</p>}
            </div>

            <div>
              <label htmlFor="hostelName" className="form-label">
                Hostel
              </label>
              <select
                id="hostelName"
                {...register('hostelName', { required: 'Hostel is required' })}
                className="form-input bg-white/50 backdrop-blur-sm"
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
                className="form-input bg-white/50 backdrop-blur-sm"
                placeholder="E.g., 101, A-204"
              />
              {errors.roomNumber && <p className="form-error">{errors.roomNumber.message}</p>}
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex justify-center items-center mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus size={18} className="mr-2" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;