import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { IConfigApp, configApp } from '@shared/configuration';
import { MainModule } from './main.module';

class AppApi {
  private readonly appKey = 'api';
  private config: IConfigApp;
  private app: NestExpressApplication;
  private logger = new Logger(AppApi.name, { timestamp: true });

  constructor(private readonly appModule: any) {
    this.getConfig();
  }

  private getConfig() {
    this.config = configApp;
    if (!this.config) {
      throw new Error(`Missing config for microservice ${this.appKey}`);
    }
  }

  async run() {
    try {
      this.app = await NestFactory.create<NestExpressApplication>(
        this.appModule,
        {
          rawBody: true,
        },
      );
      this.app.setGlobalPrefix(`api`);

      this.setupMiddlewares();
      this.setupPipes();
      this.setupInterceptors();
      await this.setupDocumentation();

      await this.app.listen(this.config.port);
      this.logger.log(`Listening on port ${this.config.port}`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async setupDocumentation() {
    const openApiConfig = new DocumentBuilder()
      .setTitle('Test Qtim API')
      .setDescription(`REST API for Test Qtim service`)
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(this.app, openApiConfig);
    SwaggerModule.setup(`swagger`, this.app, document);

    this.app
      .getHttpAdapter()
      .getInstance()
      .get('/swagger.json', (_, res) => {
        res.json(document);
      });
  }

  private setupMiddlewares() {
    this.app.use(cookieParser());
  }

  private setupPipes() {
    this.app.useGlobalPipes(new ValidationPipe({ transform: true }));
  }

  private setupInterceptors() {
    this.app.useGlobalInterceptors(
      new ClassSerializerInterceptor(this.app.get(Reflector)),
    );
  }
}

new AppApi(MainModule).run();
