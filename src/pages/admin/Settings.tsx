import React, { useState } from 'react';
import { Save, Bell, Mail, AlertCircle } from 'lucide-react';
import Header from '../../components/common/Header';
import toast from 'react-hot-toast';

const AdminSettings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [highPriorityAlerts, setHighPriorityAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const handleSaveSettings = () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved successfully');
    }, 1000);
  };
  
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
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
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
                      checked={highPriorityAlerts}
                      onChange={() => setHighPriorityAlerts(!highPriorityAlerts)}
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
                      checked={dailyDigest}
                      onChange={() => setDailyDigest(!dailyDigest)}
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
                    placeholder="admin@example.com"
                    defaultValue="admin@campus.edu"
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
                    defaultValue="7"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Number of days after which resolved tickets are automatically archived
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