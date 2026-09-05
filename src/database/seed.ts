import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const uri =
  process.env.DATABASE ??
  'mongodb://127.0.0.1:27017/secure-notes-api';

async function seed() {
  console.log('🌱 Starting Database Seeding Process...');
  console.log(`Connecting to MongoDB at: ${uri}`);
  await mongoose.connect(uri);

  const User = mongoose.connection.collection('users');
  const Note = mongoose.connection.collection('notes');
  const Post = mongoose.connection.collection('posts');

  console.log('Clearing existing records...');
  await User.deleteMany({});
  await Note.deleteMany({});
  await Post.deleteMany({});

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPassword = await bcrypt.hash('user123', 10);

  // 1. Seed Admin User
  const adminRes = await User.insertOne({
    name: 'System Admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'ADMIN',
    interests: ['security', 'architecture', 'chess'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('✅ Admin user created: admin@example.com / admin123');

  // 2. Seed Regular Users
  const user1Res = await User.insertOne({
    name: 'John Doe',
    email: 'user@example.com',
    password: hashedUserPassword,
    role: 'USER',
    interests: ['reading', 'chess'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const user2Res = await User.insertOne({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: hashedUserPassword,
    role: 'USER',
    interests: ['coding', 'reading'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ User 1 created: user@example.com / user123');
  console.log('✅ User 2 created: jane@example.com / user123');

  // 3. Seed Sample Notes
  await Note.insertMany([
    {
      title: 'John Personal Note',
      content: 'Confidential personal notes for John Doe.',
      userId: user1Res.insertedId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Project Architecture Ideas',
      content: 'Explore NestJS + MongoDB Aggregation pipelines.',
      userId: user1Res.insertedId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Jane Study Plan',
      content: 'Learn advanced TypeScript patterns and NestJS Guards.',
      userId: user2Res.insertedId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log('✅ Sample Notes created');

  // 4. Seed Sample Posts
  await Post.insertMany([
    {
      title: 'Why MongoDB Aggregation is Powerful',
      body: 'Understanding $unwind, $group, and $lookup stages in Mongoose.',
      userId: user1Res.insertedId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Building Secure REST APIs with NestJS',
      body: 'Role-Based Access Control and JWT Guard implementation guide.',
      userId: user2Res.insertedId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log('✅ Sample Posts created');

  console.log('🎉 Database seeding completed successfully!');
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
