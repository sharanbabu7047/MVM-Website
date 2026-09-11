const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_mvm';

// Middleware to verify admin JWT
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Failed to authenticate token' });
    req.adminId = decoded.id;
    next();
  });
};const { pool, initDB } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

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
    res.status(500).json({ success: false, message: 'Internal Server Error: ' + (error.message || error) });
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
    res.status(500).json({ success: false, message: 'Internal Server Error: ' + (error.message || error) });
  }
});

// --- ADMIN API ---

// Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const admin = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change Password
app.put('/api/admin/password', authenticateAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [passwordHash, req.adminId]);
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, error: 'Server error while updating password' });
  }
});

// Get content blocks
app.get('/api/content', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM content_blocks');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update content block
app.put('/api/admin/content', authenticateAdmin, async (req, res) => {
  try {
    const { section_key, heading, description } = req.body;
    
    const query = `
      INSERT INTO content_blocks (section_key, heading, description) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (section_key) 
      DO UPDATE SET heading = EXCLUDED.heading, description = EXCLUDED.description, updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [section_key, heading, description]);
    res.json({ success: true, message: 'Content updated' });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get gallery images
app.get('/api/gallery', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gallery_images ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Upload gallery image
app.post('/api/admin/gallery', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    
    const { title, description } = req.body;
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'mvm_gallery' },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ success: false, message: 'Upload failed' });
        }
        
        const insertQuery = `
          INSERT INTO gallery_images (title, description, image_url)
          VALUES ($1, $2, $3) RETURNING *;
        `;
        const dbRes = await pool.query(insertQuery, [title, description, result.secure_url]);
        
        res.json({ success: true, data: dbRes.rows[0] });
      }
    );
    
    uploadStream.end(req.file.buffer);
    
  } catch (error) {
    console.error('Gallery add error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper to extract Cloudinary public ID from URL
const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    const pathAfterVersion = parts.slice(uploadIndex + 2).join('/');
    return pathAfterVersion.substring(0, pathAfterVersion.lastIndexOf('.'));
  } catch (e) {
    return null;
  }
};

// Delete gallery image
app.delete('/api/admin/gallery/:id', authenticateAdmin, async (req, res) => {
  try {
    const itemRes = await pool.query('SELECT image_url FROM gallery_images WHERE id = $1', [req.params.id]);
    if (itemRes.rows.length > 0 && itemRes.rows[0].image_url) {
      const publicId = extractPublicId(itemRes.rows[0].image_url);
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(err => console.error('Cloudinary delete error:', err));
    }
    await pool.query('DELETE FROM gallery_images WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('Gallery delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get activities
app.get('/api/activities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activities_news ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add activity
app.post('/api/admin/activities', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, date } = req.body;
    
    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'mvm_activities' },
        async (error, result) => {
          if (error) return res.status(500).json({ success: false, message: 'Upload failed' });
          const insertQuery = `INSERT INTO activities_news (title, description, date, image_url) VALUES ($1, $2, $3, $4) RETURNING *;`;
          const dbRes = await pool.query(insertQuery, [title, description, date, result.secure_url]);
          res.json({ success: true, data: dbRes.rows[0] });
        }
      );
      uploadStream.end(req.file.buffer);
    } else {
      const insertQuery = `INSERT INTO activities_news (title, description, date) VALUES ($1, $2, $3) RETURNING *;`;
      const dbRes = await pool.query(insertQuery, [title, description, date]);
      res.json({ success: true, data: dbRes.rows[0] });
    }
  } catch (error) {
    console.error('Activity add error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete activity
app.delete('/api/admin/activities/:id', authenticateAdmin, async (req, res) => {
  try {
    const itemRes = await pool.query('SELECT image_url FROM activities_news WHERE id = $1', [req.params.id]);
    if (itemRes.rows.length > 0 && itemRes.rows[0].image_url) {
      const publicId = extractPublicId(itemRes.rows[0].image_url);
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(err => console.error('Cloudinary delete error:', err));
    }
    await pool.query('DELETE FROM activities_news WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    console.error('Activity delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get specific page content (Multiple items)
app.get('/api/pages/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pages_content WHERE page_slug = $1 ORDER BY updated_at DESC', [req.params.slug]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add/Update page content
app.post('/api/admin/pages', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const { page_slug, title, content_text } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'mvm_pages' },
        async (error, result) => {
          if (error) return res.status(500).json({ success: false, message: 'Upload failed' });
          imageUrl = result.secure_url;
          savePageToDb();
        }
      );
      uploadStream.end(req.file.buffer);
    } else {
      savePageToDb();
    }

    async function savePageToDb() {
      let query;
      let params;
      if (imageUrl) {
        query = `
          INSERT INTO pages_content (page_slug, title, content_text, image_url) 
          VALUES ($1, $2, $3, $4) 
          RETURNING *;
        `;
        params = [page_slug, title, content_text, imageUrl];
      } else {
        query = `
          INSERT INTO pages_content (page_slug, title, content_text) 
          VALUES ($1, $2, $3) 
          RETURNING *;
        `;
        params = [page_slug, title, content_text];
      }
      const dbRes = await pool.query(query, params);
      res.json({ success: true, data: dbRes.rows[0] });
    }
  } catch (error) {
    console.error('Page add error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete specific page item
app.delete('/api/admin/pages/:id', authenticateAdmin, async (req, res) => {
  try {
    const itemRes = await pool.query('SELECT image_url FROM pages_content WHERE id = $1', [req.params.id]);
    if (itemRes.rows.length > 0 && itemRes.rows[0].image_url) {
      const publicId = extractPublicId(itemRes.rows[0].image_url);
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(err => console.error('Cloudinary delete error:', err));
    }
    await pool.query('DELETE FROM pages_content WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Page item delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Fallback route to serve index.html for unknown routes (useful for SPA, though this is a multi-page site)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
