import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const filePath = './swayamkrushi/src/data/articles_complete.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const art = data.find(a => a.id === 'story-covid');

if (art) {
  const p1 = '<p><strong>' + art.paragraphs[0] + '</strong></p>';
  const p2 = '<p>' + art.paragraphs[1] + '</p>';
  const p3 = '<p>' + art.paragraphs[2] + '</p>';
  const imgTag = '<p><img src="https://res.cloudinary.com/ll9equhn/image/upload/v1791530515/swayamkrushi/ihpru7ipo0e7idmc97n7.jpg"></p>';
  const rest = art.paragraphs.slice(3).map(p => '<p>' + p + '</p>').join('');

  art.contentHtml = p1 + p2 + p3 + imgTag + rest;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Updated articles_complete.json successfully!');
}

async function updateDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('No MONGO_URI in server/.env, skipping DB update.');
    process.exit(0);
  }
  try {
    await mongoose.connect(uri);
    const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }));
    const p1 = '<p><strong>' + art.paragraphs[0] + '</strong></p>';
    const p2 = '<p>' + art.paragraphs[1] + '</p>';
    const p3 = '<p>' + art.paragraphs[2] + '</p>';
    const imgTag = '<p><img src="https://res.cloudinary.com/ll9equhn/image/upload/v1791530515/swayamkrushi/ihpru7ipo0e7idmc97n7.jpg"></p>';
    const rest = art.paragraphs.slice(3).map(p => '<p>' + p + '</p>').join('');
    const newHtml = p1 + p2 + p3 + imgTag + rest;

    const res = await Article.updateOne(
      { id: 'story-covid' },
      { $set: { contentHtml: newHtml } }
    );
    console.log('Updated story-covid in MongoDB:', res);
  } catch (err) {
    console.warn('Could not connect to MongoDB:', err.message);
  } finally {
    process.exit(0);
  }
}

updateDb();
