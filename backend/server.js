const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Firebase Admin SDK initialization
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = (token, message) => {
  const payload = {
    notification: {
      title: 'Reminder Alert',
      body: message,
    },
  };

  admin.messaging().sendToDevice(token, payload)
    .then(response => {
      console.log('Successfully sent message:', response);
    })
    .catch(error => {
      console.log('Error sending message:', error);
    });
};

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'salahden77@gmail.com',
    pass: 'bibh dinr izzn absz'
  }
});

const sendEmailNotification = (to, subject, text) => {
  const mailOptions = {
    from: 'salahden77@gmail.com',
    to: to, // Send to the user's email
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Email sent: ' + info.response);
  });
};

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fcmToken: { type: String }
});

const User = mongoose.model('User', userSchema);

// Reminder schema and model
const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true 
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  notified: {
    type: Boolean,
    default: false 
  }
});


const Reminder = mongoose.model('Reminder', reminderSchema);

// Register a new user
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login a user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save FCM token
app.post('/api/save-token', async (req, res) => {
  const { userId, fcmToken } = req.body;

  try {
    // Find the user by ID and update their FCM token
    const user = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'FCM token saved successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save FCM token', error: error.message });
  }
});

// Create a new reminder
app.post('/api/reminders', async (req, res) => {
  const { userId, text, priority, date } = req.body;
  try {
    const newReminder = new Reminder({ userId, text, priority, date });
    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add reminder', error: error.message });
  }
});


// Get reminders for a user
app.get('/api/reminders/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const reminders = await Reminder.find({ userId });
    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error); // Log the error
    res.status(500).json({ message: 'Failed to get reminders', error });
  }
});

// Update a reminder
app.put('/api/reminders/:id', async (req, res) => {
  const { id } = req.params;
  const { text, priority } = req.body;

  try {
    const updatedReminder = await Reminder.findByIdAndUpdate(
      id,
      { text, priority },
      { new: true }
    );

    if (!updatedReminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.status(200).json(updatedReminder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update reminder', error: error.message });
  }
});

// Delete a reminder
app.delete('/api/reminders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedReminder = await Reminder.findByIdAndDelete(id);

    if (!deletedReminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete reminder', error: error.message });
  }
});

// Schedule task to check reminders and send notifications
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const reminders = await Reminder.find({
    date: { $lte: now }, 
    notified: false 
  });

  reminders.forEach(async (reminder) => {
    // Assuming you have stored FCM token and user's email in the User model
    const user = await User.findById(reminder.userId);
    if (user) {
      // Send push notification
      sendPushNotification(user.fcmToken, `Reminder: ${reminder.text}`);

      // Send email notification
      sendEmailNotification(user.email, 'Reminder Alert', `This is a reminder for: ${reminder.text}`);

      // Mark the reminder as notified
      reminder.notified = true;
      await reminder.save();
    }
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
