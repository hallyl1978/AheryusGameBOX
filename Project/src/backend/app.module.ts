import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';
import { GameModule } from './modules/game/game.module';
import { GameGateway } from './gateway/game.gateway';
import { I18nService } from './services/i18n.service';
import { TelemetryService } from './services/telemetry.service';
import { ModerationService } from './services/moderation.service';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),

    // Feature Modules
    MatchmakingModule,
    GameModule,
  ],
  providers: [
    // Gateways
    GameGateway,

    // Global Services
    I18nService,
    TelemetryService,
    ModerationService,
  ],
})
export class AppModule {}
