import { IsUUID } from 'class-validator';

export class SetDestinationDto {
  @IsUUID()
  accountId!: string;
}
