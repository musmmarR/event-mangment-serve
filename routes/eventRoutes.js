const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { auth, adminAuth } = require('../middleware/auth');
// Add this new route
router.get('/dashboard-stats', auth, eventController.getDashboardStats);
router.get('/user-dashboard', auth, eventController.getUserDashboardStats);
router.post('/create', auth, eventController.createEvent);
router.get('/', auth, eventController.getEvents); 
router.get('/users', auth, eventController.getAllUsers);
router.put('/', auth, eventController.updateEvent);
router.delete('/', auth, eventController.deleteEvent);
router.get('/user-events', auth, eventController.getUserEvents);
router.get('/pending-events', auth, eventController.getPendingEvents);
router.post('/approve', adminAuth, eventController.approveEvent);
router.post('/:id/join', auth, eventController.joinEvent);
router.get('/admin/events', auth, eventController.getAllEventsAdmin);
router.get('/get-join-event', auth, eventController.getJoinEvent);

module.exports = router; 