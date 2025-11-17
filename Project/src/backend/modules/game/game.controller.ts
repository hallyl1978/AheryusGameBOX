import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { GameService } from './game.service';
import { I18nService } from '../../services/i18n.service';

@Controller('games')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * Get all games
   * GET /games
   */
  @Get()
  async getAllGames(@Query('lang') lang?: string) {
    const games = await this.gameService.getAllGames();
    const userLang = lang || 'tr-TR';

    // Translate game names
    return {
      success: true,
      data: games.map(game => ({
        ...game,
        name: this.i18nService.parseJsonbTranslation(game.name_translations, userLang),
        description: this.i18nService.parseJsonbTranslation(game.description_translations, userLang),
      })),
    };
  }

  /**
   * Get game by ID
   * GET /games/:id
   */
  @Get(':id')
  async getGame(@Param('id') id: string, @Query('lang') lang?: string) {
    const game = await this.gameService.getGameById(id);
    const userLang = lang || 'tr-TR';

    return {
      success: true,
      data: {
        ...game,
        name: this.i18nService.parseJsonbTranslation(game.name_translations, userLang),
        description: this.i18nService.parseJsonbTranslation(game.description_translations, userLang),
      },
    };
  }

  /**
   * Create game session
   * POST /games/:id/sessions
   */
  @Post(':id/sessions')
  async createSession(
    @Param('id') gameId: string,
    @Body() body: {
      hostUserId: string;
      languageCode?: string;
      settings?: any;
    },
  ) {
    const session = await this.gameService.createSession(
      gameId,
      body.hostUserId,
      body.languageCode,
      body.settings,
    );

    return {
      success: true,
      message: 'Game session created',
      data: session,
    };
  }

  /**
   * Join game session
   * POST /games/sessions/:sessionId/join
   */
  @Post('sessions/:sessionId/join')
  async joinSession(
    @Param('sessionId') sessionId: string,
    @Body() body: {
      userId: string;
      seatOrder?: number;
    },
  ) {
    await this.gameService.joinSession(sessionId, body.userId, body.seatOrder);

    return {
      success: true,
      message: 'Joined game session',
    };
  }

  /**
   * Leave game session
   * POST /games/sessions/:sessionId/leave
   */
  @Post('sessions/:sessionId/leave')
  async leaveSession(
    @Param('sessionId') sessionId: string,
    @Body() body: { userId: string },
  ) {
    await this.gameService.leaveSession(sessionId, body.userId);

    return {
      success: true,
      message: 'Left game session',
    };
  }

  /**
   * Start game session
   * POST /games/sessions/:sessionId/start
   */
  @Post('sessions/:sessionId/start')
  async startSession(@Param('sessionId') sessionId: string) {
    await this.gameService.startSession(sessionId);

    return {
      success: true,
      message: 'Game session started',
    };
  }

  /**
   * Get session details
   * GET /games/sessions/:sessionId
   */
  @Get('sessions/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    const session = await this.gameService.getSession(sessionId);

    return {
      success: true,
      data: session,
    };
  }
}
