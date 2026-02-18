import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard.js';
import { FastifyRequest } from 'fastify';
import { Req } from '@nestjs/common';
import { AccountsService } from './accounts.service.js';

@Controller('accounts')
@UseGuards(JwtGuard)
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Delete(':id')
  async disconnect(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.accounts.disconnectAccount(id, req.user!.sub);
  }
}
