const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const { pool, initDB } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, '')));

// Initialize Database
initDB();

// Configure Nodemailer Transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Helper function to send email
const sendEmail = async (subject, text) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Sending to the college email itself
      subject: subject,
      text: text,
    };
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// API Endpoint: Admission Enquiry
app.post('/api/admissions', async (req, res) => {
  try {
    const { student_name, dob, grade_interest, parent_name, phone, email, message } = req.body;

    // Insert into PostgreSQL
    const insertQuery = `
      INSERT INTO admission_enquiries (student_name, dob, grade, parent_name, phone, email, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const values = [student_name, dob, grade_interest, parent_name, phone, email, message];
    
    await pool.query(insertQuery, values);

    // Send Email
    const emailSubject = `New Admission Enquiry - ${student_name} (${grade_interest})`;
    const emailText = `
      New Admission Enquiry Received:
      
      Student Name: ${student_name}
      Date of Birth: ${dob}
      Grade of Interest: ${grade_interest}
      Parent/Guardian Name: ${parent_name}
      Phone Number: ${phone}
      Email Address: ${email}
      Additional Message: ${message || 'N/A'}
    `;
    await sendEmail(emailSubject, emailText);

    res.status(201).json({ success: true, message: 'Admission enquiry submitted successfully.' });
  } catch (error) {
    console.error('Admission API Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// API Endpoint: Contact Message
app.post('/api/contact', async (req, res) => {
  try {
    const { contact_name, contact_email, contact_message } = req.body;

    // Insert into PostgreSQL
    const insertQuery = `
      INSERT INTO contact_messages (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;
    const values = [contact_name, contact_email, contact_message];
    
    await pool.query(insertQuery, values);

    // Send Email
    const emailSubject = `New Contact Message from ${contact_name}`;
    const emailText = `
      New Contact Message Received:
      
      Name: ${contact_name}
      Email: ${contact_email}
      Message: ${contact_message}
    `;
    await sendEmail(emailSubject, emailText);

    res.status(201).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact API Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Fallback route to serve index.html for unknown routes (useful for SPA, though this is a multi-page site)
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
