import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { I18nService } from '../../services/i18n.service';

@Module({
  controllers: [GameController],
  providers: [GameService, I18nService],
  exports: [GameService],
})
export class GameModule {}
