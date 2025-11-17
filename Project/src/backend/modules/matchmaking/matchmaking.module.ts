import { Module } from '@nestjs/common';
import { MatchmakingService } from '../../services/matchmaking.service';
import { RatingService } from '../../services/rating.service';
import { MatchmakingController } from './matchmaking.controller';

@Module({
  controllers: [MatchmakingController],
  providers: [MatchmakingService, RatingService],
  exports: [MatchmakingService, RatingService],
})
export class MatchmakingModule {}
