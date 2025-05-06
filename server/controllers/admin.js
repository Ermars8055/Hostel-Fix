import { Ticket } from '../models/Ticket.js';
import { User } from '../models/User.js';
import { SystemSettings } from '../models/SystemSettings.js';

// @desc    Get all tickets with filtering and pagination
// @route   GET /api/admin/tickets
// @access  Private/Admin
export const getTickets = async (req, res) => {
  try {
    const { status, category, hostel, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (hostel) query.hostelName = hostel;
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { hostelName: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const tickets = await Ticket.find(query)
      .populate('user', 'name email role hostelName roomNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Ticket.countDocuments(query);
    
    res.json({
      tickets,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get ticket statistics
// @route   GET /api/admin/tickets/stats
// @access  Private/Admin
export const getTicketStats = async (req, res) => {
  try {
    // Get status counts
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Ticket.countDocuments();
    
    // Get hostel-wise counts
    const byHostel = await Ticket.aggregate([
      {
        $group: {
          _id: '$hostelName',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get category-wise counts
    const byCategory = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get monthly trends
    const monthlyTrends = await Ticket.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          submitted: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get resolution times
    const resolutionTimes = await Ticket.aggregate([
      {
        $match: {
          status: 'resolved',
          createdAt: { $exists: true },
          updatedAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$hostelName',
          avgResolutionTime: {
            $avg: {
              $divide: [
                { $subtract: ['$updatedAt', '$createdAt'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        }
      }
    ]);
    
    res.json({
      total,
      byStatus: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byHostel,
      byCategory,
      monthlyTrends,
      resolutionTimes
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update ticket status
// @route   PUT /api/admin/tickets/:id/status
// @access  Private/Admin
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name email role hostelName roomNumber')
     .populate('assignedTo', 'name email');
     
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign ticket to staff
// @route   PUT /api/admin/tickets/:id/assign
// @access  Private/Admin
export const assignTicket = async (req, res) => {
  try {
    const { staffId } = req.body;
    
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff') {
      return res.status(400).json({ message: 'Invalid staff member' });
    }
    
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: staffId, updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name email role hostelName roomNumber')
     .populate('assignedTo', 'name email');
     
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role) query.role = role;
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, hostelName, roomNumber } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, hostelName, roomNumber },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTickets,
      activeTickets,
      resolvedTickets,
      usersByRole
    ] = await Promise.all([
      User.countDocuments(),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
      Ticket.countDocuments({ status: 'resolved' }),
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    res.json({
      totalUsers,
      totalTickets,
      activeTickets,
      resolvedTickets,
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );
    
    res.json(settings);
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 