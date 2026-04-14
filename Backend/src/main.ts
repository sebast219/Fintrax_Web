import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { AppLoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = await app.resolve(AppLoggerService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS for Angular dev server
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:4200',
      'http://127.0.0.1:53412',
      /^http:\/\/127\.0\.0\.1:\d+$/
    ],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Fintrax API')
    .setDescription('API de gestión financiera personal')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Use custom logger
  app.useLogger(logger);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(` Fintrax API running on http://localhost:${port}`, 'Bootstrap');
  logger.log(` Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
  
  // Log startup information
  logger.log(`Application started successfully on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
