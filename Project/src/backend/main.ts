import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DatabaseConfig } from './config/database.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Initialize database
  try {
    DatabaseConfig.initialize(configService);
    logger.log('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database', error);
    process.exit(1);
  }

  // Enable CORS
  app.enableCors({
    origin: configService.get('cors.origins'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = configService.get('port');

  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`🎮 WebSocket Gateway: ws://localhost:${port}/game`);
  logger.log(`🌍 Environment: ${configService.get('nodeEnv')}`);
}

bootstrap();
