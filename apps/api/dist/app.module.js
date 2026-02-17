var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { baseEnvSchema } from '@repo/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller.js';
import { HealthController } from './health.controller.js';
import { AppService } from './app.service.js';
console.log('NODE_ENV =', JSON.stringify(process.env.NODE_ENV));
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['apps/api/.env', '.env'],
                validate: (config) => baseEnvSchema.parse(config),
            }),
            LoggerModule.forRoot({
                pinoHttp: {
                    transport: process.env.NODE_ENV !== 'production'
                        ? {
                            target: 'pino-pretty',
                            options: { singleLine: true },
                        }
                        : undefined,
                },
            }),
        ],
        controllers: [AppController, HealthController],
        providers: [AppService],
    })
], AppModule);
export { AppModule };
