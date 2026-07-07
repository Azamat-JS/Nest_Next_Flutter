import { Module } from '@nestjs/common';
import { WaitingListService } from './waiting-list.service';
import { WaitingListController } from './waiting-list.controller';

@Module({
  controllers: [WaitingListController],
  providers: [WaitingListService],
})
export class WaitingListModule { }
