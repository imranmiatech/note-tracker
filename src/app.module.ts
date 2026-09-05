import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { NotesModule } from './notes/notes.module.js';
import { PostsModule } from './posts/posts.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUri =
          configService.get<string>('DATABASE') ??
          'mongodb://127.0.0.1:27017/secure-notes-api';

        console.log('MongoDB URI:', databaseUri);

        return {
          uri: databaseUri,
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
        };
      },
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    NotesModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
