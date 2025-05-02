import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'viewed', 'resolved'],
      default: 'pending'
    },
    category: {
      type: String,
      required: true
    },
    hostelName: {
      type: String,
      required: true
    },
    roomNumber: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Create index for faster queries
ticketSchema.index({ student: 1, status: 1 });
ticketSchema.index({ hostelName: 1 });
ticketSchema.index({ status: 1, createdAt: -1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;