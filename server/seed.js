/**
 * Database Seeding Script
 * Populates database with sample words for testing
 */

const mongoose = require('mongoose');
const Word = require('./models/Word');
require('dotenv').config();

const sampleWords = [
  // Animals
  { word: 'cat', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'dog', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'bird', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'fish', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'horse', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400', difficulty: 'medium', pecsPhase: 1 },
  
  // Food
  { word: 'apple', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b27c6a?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'banana', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'bread', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'milk', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'cookie', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', difficulty: 'medium', pecsPhase: 1 },
  
  // Objects
  { word: 'ball', category: 'objects', imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'book', category: 'objects', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'car', category: 'objects', imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'toy', category: 'objects', imageUrl: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=400', difficulty: 'easy', pecsPhase: 1 },
  { word: 'cup', category: 'objects', imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400', difficulty: 'easy', pecsPhase: 1 },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asd_tutor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing words (optional - comment out to keep existing)
    // await Word.deleteMany({});
    // console.log('🗑️  Cleared existing words');

    // Insert sample words
    const inserted = await Word.insertMany(sampleWords);
    console.log(`✅ Inserted ${inserted.length} words`);

    // Display summary
    const counts = await Word.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    console.log('\n📊 Word Summary:');
    counts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count} words`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleWords };

