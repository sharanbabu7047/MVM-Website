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

const uploadImage = async (filePath) => {
  if (filePath.startsWith('http')) return filePath;
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder: 'mvm_pages' });
    return result.secure_url;
  } catch (err) {
    console.error('Error uploading:', filePath, err);
    return null;
  }
};

const insertItem = async (slug, title, text, imgPath) => {
  let url = await uploadImage(imgPath);
  await pool.query('INSERT INTO pages_content (page_slug, title, content_text, image_url) VALUES ($1, $2, $3, $4)', [slug, title, text, url]);
  console.log(`Inserted ${title} into ${slug}`);
};

const run = async () => {
  try {
    // Achievements
    await insertItem('achievements', 'JEE Advanced - 2026', '', path.join(__dirname, 'images/jee.jpg'));
    await insertItem('achievements', 'SSCE Results - 2026', '', path.join(__dirname, 'images/XII-MVM-Results-pg2-2026.jpg'));
    await insertItem('achievements', 'SSE Results (Pg 1) - 2026', '', path.join(__dirname, 'images/SSE-Result-pg1.jpg'));
    await insertItem('achievements', 'SSE Results (Pg 2) - 2026', '', path.join(__dirname, 'images/SSE-Result-pg2.jpg'));

    // Extra-curricular
    await insertItem('extra-curricular', 'Athletics', 'Events like 100m, javelin, Long Jump, etc., are all a part of Athletics which boost the morale of our students to try harder with better preparations everytime they perform. These activities stretch their abilities and enhance their stamina, muscle tone and have a number of physical benefits.', 'https://res.cloudinary.com/mlsqzeb2/image/upload/v1790178559/mvm_pages/b1tobovyzwbknvbpec2n.jpg');
    await insertItem('extra-curricular', 'VolleyBall', 'Volleyball is a sport that requires teamwork and coordination. Children learn to work in a team, take responsibility and trust their teammates.', 'https://mvmschoolschetpet.com/wp-content/uploads/2023/12/sportday_11.jpeg');
    await insertItem('extra-curricular', 'Meditation', 'Transcendental Meditation is an integral part of our curriculum. It helps students reduce stress, improve focus, and develop their full creative potential for better academic and personal growth.', path.join(__dirname, 'images/meditation_1.jpg'));

    // After-school
    await insertItem('after-school', 'Yoga', '', 'https://www.mvmmangadu.in/wp-content/uploads/2020/01/Yoga.jpg');
    await insertItem('after-school', 'Basketball', '', 'https://www.mvmmangadu.in/wp-content/uploads/2020/01/Basketball.jpg');

    // Competitions
    await insertItem('competitions', 'Udbhav', '', path.join(__dirname, 'public/images/udbhav_poster.jpg'));
    await insertItem('competitions', 'Udbhav', '', path.join(__dirname, 'public/images/udbhav_competition.jpg'));
    await insertItem('competitions', 'Udbhav', '', path.join(__dirname, 'public/images/udbhav_winners.jpg'));
    await insertItem('competitions', 'Udbhav', '', path.join(__dirname, 'public/images/udbhav_felicitation.jpg'));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
};
run();
