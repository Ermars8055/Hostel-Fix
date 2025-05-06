import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  emailNotifications: {
    enabled: { type: Boolean, default: true },
    adminEmail: { type: String, default: 'admin@campus.edu' }
  },
  highPriorityAlerts: {
    enabled: { type: Boolean, default: true },
    threshold: { type: Number, default: 5 } // Number of high priority tickets before alert
  },
  dailyDigest: {
    enabled: { type: Boolean, default: false },
    time: { type: String, default: '18:00' } // 24-hour format
  },
  autoResolve: {
    enabled: { type: Boolean, default: false },
    days: { type: Number, default: 7 }
  },
  maintenanceMode: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: 'System is under maintenance' }
  }
}, {
  timestamps: true
});

export const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema); 