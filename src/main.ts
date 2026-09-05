import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const corsOrigin = process.env.CORS_ORIGIN;
  let allowedOrigins: boolean | string | string[] = true;

  if (corsOrigin) {
    if (corsOrigin === '*') {
      allowedOrigins = '*';
    } else if (corsOrigin.includes(',')) {
      allowedOrigins = corsOrigin.split(',').map((origin) => origin.trim());
    } else {
      allowedOrigins = corsOrigin.trim();
    }
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  });

  // Set global API prefix to /api/v1
  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Secure Note-Taking API (v1)')
    .setDescription(
      'REST API v1 with JWT Authentication, Role-Based Access Control (RBAC), and MongoDB Aggregation Pipelines.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/api/v1`);
  console.log(
    `📚 Swagger API Docs available at http://localhost:${port}/api/v1/docs`,
  );
}
await bootstrap();
