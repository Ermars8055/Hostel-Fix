import React, { useEffect, useState } from 'react';
import { Save, Bell, Mail, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Header from '../../components/common/Header';
import toast from 'react-hot-toast';
import { API_URL } from '../../config/constants';

interface SystemSettings {
  emailNotifications: {
    enabled: boolean;
    adminEmail: string;
  };
  highPriorityAlerts: {
    enabled: boolean;
    threshold: number;
  };
  dailyDigest: {
    enabled: boolean;
    time: string;
  };
  autoResolve: {
    enabled: boolean;
    days: number;
  };
  maintenanceMode: {
    enabled: boolean;
    message: string;
  };
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    emailNotifications: {
      enabled: true,
      adminEmail: 'admin@campus.edu'
    },
    highPriorityAlerts: {
      enabled: true,
      threshold: 5
    },
    dailyDigest: {
      enabled: false,
      time: '18:00'
    },
    autoResolve: {
      enabled: false,
      days: 7
    },
    maintenanceMode: {
      enabled: false,
      message: 'System is under maintenance'
    }
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/admin/settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header title="Settings" />
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
      <Header title="Settings" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
              
              <div className="space-y-5">
                <div className="flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="emailNotifications"
                      name="emailNotifications"
                      type="checkbox"
                      checked={settings.emailNotifications.enabled}
                      onChange={() => setSettings({
                        ...settings,
                        emailNotifications: {
                          ...settings.emailNotifications,
                          enabled: !settings.emailNotifications.enabled
                        }
                      })}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="emailNotifications" className="font-medium text-neutral-800">
                      Email Notifications
                    </label>
                    <p className="text-sm text-neutral-600">
                      Receive email notifications for new ticket submissions
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="highPriorityAlerts"
                      name="highPriorityAlerts"
                      type="checkbox"
                      checked={settings.highPriorityAlerts.enabled}
                      onChange={() => setSettings({
                        ...settings,
                        highPriorityAlerts: {
                          ...settings.highPriorityAlerts,
                          enabled: !settings.highPriorityAlerts.enabled
                        }
                      })}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="highPriorityAlerts" className="font-medium text-neutral-800">
                      High Priority Alerts
                    </label>
                    <p className="text-sm text-neutral-600">
                      Get immediate notifications for urgent issues
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="dailyDigest"
                      name="dailyDigest"
                      type="checkbox"
                      checked={settings.dailyDigest.enabled}
                      onChange={() => setSettings({
                        ...settings,
                        dailyDigest: {
                          ...settings.dailyDigest,
                          enabled: !settings.dailyDigest.enabled
                        }
                      })}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="dailyDigest" className="font-medium text-neutral-800">
                      Daily Digest
                    </label>
                    <p className="text-sm text-neutral-600">
                      Receive a daily summary of all ticket activity
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 border-t border-neutral-200 pt-6">
                <button
                  onClick={handleSaveSettings}
                  className="btn-primary flex items-center"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">System Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="adminEmail" className="form-label">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    id="adminEmail"
                    className="form-input"
                    value={settings.emailNotifications.adminEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailNotifications: {
                        ...settings.emailNotifications,
                        adminEmail: e.target.value
                      }
                    })}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    This email will receive all system notifications
                  </p>
                </div>
                
                <div>
                  <label htmlFor="autoResolveTime" className="form-label">
                    Auto-resolve Time (days)
                  </label>
                  <input
                    type="number"
                    id="autoResolveTime"
                    className="form-input"
                    min="0"
                    max="30"
                    value={settings.autoResolve.days}
                    onChange={(e) => setSettings({
                      ...settings,
                      autoResolve: {
                        ...settings.autoResolve,
                        days: parseInt(e.target.value)
                      }
                    })}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Number of days after which resolved tickets are automatically archived
                  </p>
                </div>
                
                <div>
                  <label htmlFor="maintenanceMessage" className="form-label">
                    Maintenance Mode Message
                  </label>
                  <input
                    type="text"
                    id="maintenanceMessage"
                    className="form-input"
                    value={settings.maintenanceMode.message}
                    onChange={(e) => setSettings({
                      ...settings,
                      maintenanceMode: {
                        ...settings.maintenanceMode,
                        message: e.target.value
                      }
                    })}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Message to display when maintenance mode is enabled
                  </p>
                </div>
              </div>
              
              <div className="mt-8 border-t border-neutral-200 pt-6">
                <button
                  onClick={handleSaveSettings}
                  className="btn-primary flex items-center"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="card mb-6">
              <h3 className="font-semibold mb-4">Quick Tips</h3>
              <ul className="space-y-3">
                <li className="flex">
                  <Bell size={18} className="text-primary-600 flex-shrink-0 mr-2" />
                  <span className="text-sm">
                    Enable email notifications to stay updated with new tickets
                  </span>
                </li>
                <li className="flex">
                  <Mail size={18} className="text-primary-600 flex-shrink-0 mr-2" />
                  <span className="text-sm">
                    The daily digest provides a summary of all day's activities
                  </span>
                </li>
                <li className="flex">
                  <AlertCircle size={18} className="text-primary-600 flex-shrink-0 mr-2" />
                  <span className="text-sm">
                    High priority alerts are sent immediately regardless of other settings
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <h3 className="font-medium text-warning-800 mb-2 flex items-center">
                <AlertCircle size={18} className="mr-2" />
                Important Note
              </h3>
              <p className="text-sm text-warning-700">
                Changes to notification settings take effect immediately. System settings may require a system restart to take effect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;