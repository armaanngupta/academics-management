const Admin = require('../models/Admin');

exports.listAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, 'name username email role createdAt').sort({ createdAt: -1 });
    res.json({ message: 'Admins retrieved successfully', admins });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving admins', error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { name, username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({
      name: name || '',
      username,
      password,
      email: email || `${username}@institution.com`,
      role: 'admin',
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: { id: admin._id, name: admin.name, username: admin.username, email: admin.email, role: admin.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.admin?.id === id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (admin.role === 'superadmin') {
      return res.status(400).json({ message: 'Superadmin cannot be deleted' });
    }

    await Admin.findByIdAndDelete(id);

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin', error: error.message });
  }
};
