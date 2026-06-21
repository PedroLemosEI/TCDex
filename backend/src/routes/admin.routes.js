const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { getAllUsers, deleteUser } = require('../controllers/admin.controller');

router.use(auth, adminOnly);

router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);

module.exports = router;
