// apps/api/src/transfers/transfers.controller.ts

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TransfersService } from './transfers.service.js';
import { CreateTransferDto } from './transfers.dto.js';
import { JwtGuard } from '../auth/jwt.guard.js';
import { FastifyRequest } from 'fastify';

@Controller('transfers')
@UseGuards(JwtGuard)
export class TransfersController {
  constructor(private readonly transfers: TransfersService) {}

  @Post()
  async create(@Body() dto: CreateTransferDto, @Req() req: FastifyRequest) {
    return this.transfers.createTransfer(req.user!.sub, dto);
  }

  @Get()
  async list(@Req() req: FastifyRequest) {
    return this.transfers.listTransfers(req.user!.sub);
  }
}
