const Event = require('../models/Event');
const User = require('../models/User');
const HttpError = require('../config/httpError');
const { sendEventInvitation } = require('../services/emailService');

exports.createEvent = async (req, res, next) => {
    try {
let {title, description, date, time, location, category, maxParticipants, participants} = req.body;
        const event = new Event({
            title:title,
            description:description,
            date:date, 
            time: time,
            location: location,
            category: category,
            maxParticipants: maxParticipants,
            creator: req.user._id
        });
        await event.save();

        if (req.body.participants) {
            for (const email of req.body.participants) {
                event.pendingParticipants.push({ email });
            }
            await event.save();
        }
        res.appData = {
            data: { event: event },
            code: 201
          }
          next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.appData = {
            data: { users: users },
            code: 200
          }
          next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};

exports.getEvents = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, startDate, endDate } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { location: new RegExp(search, 'i') }
            ];
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const events = await Event.find(query)
            .populate('creator', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Event.countDocuments(query);
console.log(events)

        res.appData = {
            data: { events: events,
                totalPages: Math.ceil(count / limit),
                currentPage: page
             },
            code: 200
          }
          next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};

exports.updateEvent = async (req, res, next) => {
    try {
        let {title, description, date, time, location, maxParticipants, participants} = req.body;
        const event = await Event.findById(req.body._id);
        console.log(event)
        if (!event) {
            throw new HttpError(404, 'Event not found');
        }

        if (event.creator.toString() !== req.user._id.toString()) {
            throw new HttpError(400, 'Not authorized');
        }

       
        if(event.status == 'pending'){
            let data = {
                title:title,
                description:description,
                date:date, 
                time: time,
                location: location,
                maxParticipants: maxParticipants,
                participants: []
            }
            Object.assign(event, data);
            await event.save();
            for (const email of req.body.participants) {
                event.pendingParticipants.push({ email });
            }
            await event.save();
        }else{
            Object.assign(event, req.body);
            await event.save();
        }
        res.appData = {
            data: { event: event },
            code: 201
          }
          next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.body.eventId);
        
        if (!event) {
            throw new HttpError(400, 'Event not found');
        }

        if (event.creator.toString() !== req.user._id.toString()) {
            throw new HttpError(400, 'Not authorized');
        }

        await Event.deleteOne({ _id: event._id });
        res.appData = {
            data: { message: 'Event deleted successfully'},
            code: 200
          }
          next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};

exports.approveEvent = async (req, res, next) => {
    try {
        let {eventId , status } = req.body;
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            throw new HttpError(400, 'Event not found');
        }
if(status == 'Approved'){
    event.status = 'approved';
    await event.save();

    // Send emails to pending participants
    for (const participant of event.pendingParticipants) {
        await sendEventInvitation(participant.email, event, participant._id);
    }

    event.pendingParticipants = [];
    await event.save();
}else{
    event.status = 'rejected';
    await event.save();
}
      
        res.appData = {
            data: { event:event},
            code: 200
          }
          next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};

exports.joinEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            throw new HttpError(400, 'Event not found');
        }

        if (event.date < new Date()) {
            throw new HttpError(400, 'Event has already passed');
        }

        if (event.participants.length >= event.maxParticipants) {
            throw new HttpError(400, 'Event is full');
        }

        if (event.participants.includes(req.user._id)) {
            throw new HttpError(400, 'Already joined this event');
        }

        event.participants.push(req.user._id);
        await event.save();
        res.appData = {
            data: { event:event},
            code: 200
          }
          next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
}; 
// Add this new function to your eventController.js
exports.getDashboardStats = async (req, res, next) => {
    try {
        // Get total events count
        const totalEvents = await Event.countDocuments();
        
        // Get upcoming events (events with future dates)
        const upcomingEvents = await Event.countDocuments({
            date: { $gte: new Date() }
        });

        // Get recent events (last 5 events)
        const recentEvents = await Event.find()
            .populate('creator', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get events by status
        const pendingEvents = await Event.countDocuments({ status: 'pending' });
        const approvedEvents = await Event.countDocuments({ status: 'approved' });

        // Get events created by the user
        const userEvents = await User.countDocuments();

        // Get events where user is participating
        const participatingEvents = await Event.countDocuments({
            participants: req.user._id
        });

        res.appData = {
            data: {
                stats: {
                    totalEvents,
                    upcomingEvents,
                    pendingEvents,
                    approvedEvents,
                    userEvents,
                    participatingEvents
                },
                recentEvents
            },
            code: 200
        }
        next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};
exports.getUserDashboardStats = async (req, res, next) => {
    try {
        // Get events where user is participating
        const participatingEvents = await Event.find({
            participants: req.user._id
        })
        .populate('creator', 'name email')
        .sort({ date: 1 }) // Sort by upcoming dates
        .limit(5);

        // Get events created by the user
        const userCreatedEvents = await Event.find({
            creator: req.user._id
        })
        .sort({ createdAt: -1 })
        .limit(5);

        // Get counts for statistics
        const stats = {
            totalParticipating: await Event.countDocuments({ participants: req.user._id }),
            upcomingEvents: await Event.countDocuments({ 
                participants: req.user._id,
                date: { $gte: new Date() }
            }),
            eventsCreated: await Event.countDocuments({ creator: req.user._id }),
            pendingEvents: await Event.countDocuments({ 
                creator: req.user._id,
                status: 'pending'
            })
        };

        res.appData = {
            data: {
                stats,
                participatingEvents,
                userCreatedEvents
            },
            code: 200
        }
        next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};
// Add these functions to your existing eventController.js

exports.getUserEvents = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = { creator: req.user._id };

        // Add status filter if provided
        if (status) {
            query.status = status;
        }

        const events = await Event.find(query)
            .populate('creator', 'name email')
            .populate('participants', 'name email')
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Event.countDocuments(query);

        res.appData = {
            data: { 
                events,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                totalEvents: count
            },
            code: 200
        }
        next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};

exports.getPendingEvents = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const query = { 
            status: 'pending'
        };

        const events = await Event.find(query)
            .populate('creator', 'name email')
            .populate('pendingParticipants.email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Event.countDocuments(query);

        res.appData = {
            data: { 
                events,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                totalEvents: count
            },
            code: 200
        }
        next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};
exports.getAllEventsAdmin = async (req, res, next) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search,
            status,
            location,
            startDate,
            endDate
        } = req.query;

        const query = {};

        // Search filter
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        // Location filter
        if (location) {
            query.location = new RegExp(location, 'i');
        }

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const events = await Event.find(query)
            .populate('creator', 'name email')
            .populate('participants', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Event.countDocuments(query);

        res.appData = {
            data: { 
                events,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                totalEvents: count
            },
            code: 200
        }
        next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};
exports.getJoinEvent = async (req, res, next) => {
    try {
        const { eventId } = req.query;
        const decryptedData = CryptoUtil.decryptData(eventId);
        const event = await Event.findById(decryptedData.eventId);
        const user = await User.findById(decryptedData.userId);
        res.appData = {
            data: { event: event, user: user },
            code: 200
          }
          next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
};
