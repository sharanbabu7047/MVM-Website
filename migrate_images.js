const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { pool } = require('./db/init');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (filePath, title, description) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder: 'mvm_gallery' });
    const query = `INSERT INTO gallery_images (title, description, image_url) VALUES ($1, $2, $3) RETURNING *`;
    await pool.query(query, [title, description, result.secure_url]);
    console.log(`Uploaded & inserted: ${title}`);
  } catch (err) {
    console.error('Error uploading:', filePath, err);
  }
};

const run = async () => {
  const images = [
    { file: 'kalavarshini1.png', title: 'Kalavarshini Dance', desc: 'MVM Kalavarshini Cultural Event' },
    { file: 'kalavarshini2.jpg', title: 'Kalavarshini Radha Krishna', desc: 'MVM Kalavarshini Celebration' },
    { file: 'independence1.jpg', title: 'Independence Day Drill', desc: 'Student Drill Performance' },
    { file: 'independence2.jpg', title: 'Independence Day Hoisting', desc: 'Stage Celebration Flag Hoisting' }
  ];

  for (const img of images) {
    const fullPath = path.join(__dirname, 'images', img.file);
    if (fs.existsSync(fullPath)) {
      await uploadImage(fullPath, img.title, img.desc);
    } else {
      console.log(`File not found: ${fullPath}`);
    }
  }
  pool.end();
  console.log('Migration complete.');
};

run();
