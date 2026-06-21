const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $project: {
          username: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          updatedAt: 1,
          pokedexCount: { $size: '$pokedex' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};
