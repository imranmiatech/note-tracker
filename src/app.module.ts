import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { NotesModule } from './notes/notes.module.js';
import { PostsModule } from './posts/posts.module.js';
import { UsersModule } from './users/users.module.js';

const databaseUri =
  process.env.DATABASE ?? 'mongodb://127.0.0.1:27017/secure-notes-api';

console.log('MongoDB URI:', databaseUri);

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(databaseUri, {
      serverSelectionTimeoutMS: 10000,
      dbName: 'secure-notes-api',
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('✅ MongoDB connected successfully');
        });
        connection.on('error', (error: any) => {
          console.error('❌ MongoDB connection error:', error.message);
        });
        connection.on('disconnected', () => {
          console.log('⚠️ MongoDB disconnected');
        });
        return connection;
      },
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    NotesModule,
    PostsModule,
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'secure-notes-api',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
