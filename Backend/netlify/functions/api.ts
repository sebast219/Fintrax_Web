import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import * as express from 'express';
import * as serverless from 'serverless-http';

let cachedApp: any;

async function bootstrapApp() {
  if (!cachedApp) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule, adapter, {
      logger: ['error', 'warn'],
    });
    
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:4200',
      credentials: true,
    });
    
    await app.init();
    cachedApp = serverless(expressApp);
  }
  return cachedApp;
}

export const handler = async (event: any, context: any) => {
  const app = await bootstrapApp();
  return app(event, context);
};
