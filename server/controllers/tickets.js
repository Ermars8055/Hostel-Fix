import { Ticket } from '../models/Ticket.js';

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res) => {
  try {
    console.log('Create ticket request body:', req.body);
    console.log('User creating ticket:', req.user);

    // Extract fields from either JSON or FormData
    const title = req.body.title;
    const description = req.body.description;
    const category = req.body.category;
    const priority = req.body.priority || 'medium';
    const hostelName = req.body.hostelName;
    const roomNumber = req.body.roomNumber;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        missing: {
          title: !title,
          description: !description,
          category: !category
        }
      });
    }

    console.log('Creating new ticket...');
    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      user: req.user._id,
      status: 'open',
      hostelName,
      roomNumber
    });

    console.log('Ticket created:', ticket);

    // Populate user details
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('user', 'name email role hostelName roomNumber');

    console.log('Populated ticket:', populatedTicket);

    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error('Create ticket error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
  try {
    console.log('Getting tickets for user:', req.user._id);
    
    let query = {};
    
    // If user is not admin, only show their tickets
    if (req.user.role !== 'admin') {
      query = { user: req.user._id };
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'name email role hostelName roomNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    console.log('Found tickets:', tickets.length);
    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req, res) => {
  try {
    console.log('Getting ticket:', req.params.id);
    
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email role hostelName roomNumber')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');

    if (!ticket) {
      console.log('Ticket not found');
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user is authorized to view this ticket
    if (req.user.role !== 'admin' && ticket.user._id.toString() !== req.user._id.toString()) {
      console.log('User not authorized to view this ticket');
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    console.log('Ticket found:', ticket);
    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
export const updateTicket = async (req, res) => {
  try {
    console.log('Updating ticket:', req.params.id);
    console.log('Update data:', req.body);

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      console.log('Ticket not found');
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user is authorized to update this ticket
    if (req.user.role !== 'admin' && ticket.user.toString() !== req.user._id.toString()) {
      console.log('User not authorized to update this ticket');
      return res.status(403).json({ message: 'Not authorized to update this ticket' });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name email role hostelName roomNumber')
     .populate('assignedTo', 'name email');

    console.log('Ticket updated:', updatedTicket);
    res.json(updatedTicket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
export const deleteTicket = async (req, res) => {
  try {
    console.log('Deleting ticket:', req.params.id);

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      console.log('Ticket not found');
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticket.deleteOne();
    console.log('Ticket deleted successfully');
    res.json({ message: 'Ticket removed' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    console.log('Adding comment to ticket:', req.params.id);
    console.log('Comment data:', req.body);

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      console.log('Ticket not found');
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text
    };

    ticket.comments.push(comment);
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('user', 'name email role hostelName roomNumber')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');

    console.log('Comment added successfully');
    res.status(201).json(updatedTicket.comments);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private/Admin
export const updateStatus = async (req, res) => {
  try {
    console.log('Updating ticket status:', req.params.id);
    console.log('New status:', req.body.status);

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      console.log('Ticket not found');
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = req.body.status;
    ticket.updatedAt = Date.now();
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('user', 'name email role hostelName roomNumber')
      .populate('assignedTo', 'name email');

    console.log('Status updated successfully');
    res.json(updatedTicket);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets/my-tickets
// @access  Private
export const getMyTickets = async (req, res) => {
  try {
    console.log('Getting tickets for user:', req.user._id);
    
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('user', 'name email role hostelName roomNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    console.log('Found tickets:', tickets.length);
    res.json(tickets);
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's ticket stats
// @route   GET /api/tickets/my-stats
// @access  Private
export const getMyStats = async (req, res) => {
  try {
    console.log('Getting stats for user:', req.user._id);
    
    const tickets = await Ticket.find({ user: req.user._id });
    
    const stats = {
      total: tickets.length,
      pending: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length
    };

    console.log('Stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Get my stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 