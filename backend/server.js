const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

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

// User schema and model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);



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
      default: Date.now
  },
  priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
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

app.post('/api/reminders', async (req, res) => {
  const { userId, text, priority } = req.body;
  try {
      const newReminder = new Reminder({ userId, text, priority });
      await newReminder.save();
      res.status(201).json(newReminder);
  } catch (error) {
      res.status(500).json({ message: 'Failed to add reminder', error: error.message });
  }
});


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
          { new: true } // This option returns the updated document
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



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
