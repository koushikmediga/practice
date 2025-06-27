const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/employee_management';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mongoose Schema & Model
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  ph: { type: String, required: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
    // Test the connection
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('MongoDB connection test successful');
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    console.log('Please ensure MongoDB is running on localhost:27017');
    console.log('You can still test the API endpoints, but database operations will fail');
  });

// API Endpoints
// GET ALL
app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ONE
app.get('/employee/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
app.post('/employees', async (req, res) => {
  try {
    console.log("the control is here");
    const { name, email, ph } = req.body;
    const newEmployee = new Employee({ name, email, ph });
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT
app.put('/employee/:id', async (req, res) => {
  try {
    const { name, email, ph } = req.body;
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, ph },
      { new: true, runValidators: true }
    );
    if (!updatedEmployee) return res.status(404).json({ error: 'Employee not found' });
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
app.delete('/employee/:id', async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 