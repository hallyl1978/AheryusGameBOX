/**
 * Moderation Service
 *
 * AI destekli içerik moderasyonu servisi.
 * Kullanıcı adları, oda isimleri, chat mesajları için filtreleme.
 *
 * @see Documentation/Advanced_Features.md - Bölüm 3.3
 */

import { Injectable, Logger } from '@nestjs/common';

export interface ModerationResult {
  approved: boolean;
  score: number; // 0-100, yüksek = daha riskli
  flags: string[];
  suggestedAction: 'approve' | 'flag' | 'block' | 'escalate';
  reason?: string;
}

export interface ModerationRule {
  id: string;
  ruleType: string;
  pattern: string | RegExp;
  severity: 'low' | 'medium' | 'high';
  autoAction: 'none' | 'flag' | 'block' | 'warn';
}

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  // Blacklist kelimeleri (production'da database'den yüklenecek)
  private blacklistedWords: Set<string> = new Set([
    // Türkçe
    'küfür1', 'küfür2', // Gerçek kelimeler eklenmeli
    // İngilizce
    'profanity1', 'profanity2'
  ]);

  // Spam pattern'leri
  private spamPatterns: RegExp[] = [
    /(.)\1{5,}/, // Aynı karakterin 5+ kez tekrarı
    /http[s]?:\/\//, // URL'ler (bazı durumlarda spam)
    /\d{10,}/ // 10+ digit (telefon, spam)
  ];

  /**
   * Kullanıcı adını kontrol eder
   */
  async moderateUsername(username: string): Promise<ModerationResult> {
    const result: ModerationResult = {
      approved: true,
      score: 0,
      flags: [],
      suggestedAction: 'approve'
    };

    // Uzunluk kontrolü
    if (username.length < 3 || username.length > 20) {
      result.flags.push('invalid_length');
      result.score += 20;
    }

    // Blacklist kontrolü
    const lowerUsername = username.toLowerCase();
    for (const word of this.blacklistedWords) {
      if (lowerUsername.includes(word)) {
        result.flags.push('blacklisted_word');
        result.score += 80;
        result.approved = false;
        result.suggestedAction = 'block';
        result.reason = 'Contains inappropriate language';
        break;
      }
    }

    // Spam pattern kontrolü
    for (const pattern of this.spamPatterns) {
      if (pattern.test(username)) {
        result.flags.push('spam_pattern');
        result.score += 40;
      }
    }

    // Sadece sayı kontrolü
    if (/^\d+$/.test(username)) {
      result.flags.push('only_numbers');
      result.score += 30;
    }

    // Special character spam
    if ((username.match(/[^a-zA-Z0-9_]/g) || []).length > username.length * 0.3) {
      result.flags.push('excessive_special_chars');
      result.score += 25;
    }

    // AI moderasyon (ileride)
    // result.score += await this.aiModerateText(username);

    // Final karar
    if (result.score >= 70) {
      result.approved = false;
      result.suggestedAction = 'block';
    } else if (result.score >= 40) {
      result.suggestedAction = 'flag';
    }

    if (!result.approved || result.suggestedAction === 'flag') {
      this.logger.warn(`Username moderation: "${username}" - Score: ${result.score}, Action: ${result.suggestedAction}`);
      await this.queueForReview('username', username, result);
    }

    return result;
  }

  /**
   * Oda adını kontrol eder
   */
  async moderateRoomName(roomName: string): Promise<ModerationResult> {
    const result: ModerationResult = {
      approved: true,
      score: 0,
      flags: [],
      suggestedAction: 'approve'
    };

    // Uzunluk kontrolü
    if (roomName.length < 3 || roomName.length > 50) {
      result.flags.push('invalid_length');
      result.score += 15;
    }

    // Blacklist kontrolü
    const lowerRoomName = roomName.toLowerCase();
    for (const word of this.blacklistedWords) {
      if (lowerRoomName.includes(word)) {
        result.flags.push('blacklisted_word');
        result.score += 70;
        result.approved = false;
        result.suggestedAction = 'block';
        result.reason = 'Contains inappropriate language';
        break;
      }
    }

    // Spam kontrolü
    for (const pattern of this.spamPatterns) {
      if (pattern.test(roomName)) {
        result.flags.push('spam_pattern');
        result.score += 30;
      }
    }

    if (result.score >= 60) {
      result.approved = false;
      result.suggestedAction = 'block';
    } else if (result.score >= 30) {
      result.suggestedAction = 'flag';
    }

    if (!result.approved || result.suggestedAction === 'flag') {
      this.logger.warn(`Room name moderation: "${roomName}" - Score: ${result.score}`);
      await this.queueForReview('room_name', roomName, result);
    }

    return result;
  }

  /**
   * Chat mesajını kontrol eder (ileride)
   */
  async moderateMessage(message: string, userId: string): Promise<ModerationResult> {
    const result: ModerationResult = {
      approved: true,
      score: 0,
      flags: [],
      suggestedAction: 'approve'
    };

    // Uzunluk kontrolü
    if (message.length > 500) {
      result.flags.push('too_long');
      result.score += 10;
    }

    // Blacklist kontrolü
    const lowerMessage = message.toLowerCase();
    let blacklistCount = 0;

    for (const word of this.blacklistedWords) {
      if (lowerMessage.includes(word)) {
        blacklistCount++;
        result.flags.push('inappropriate_language');
        result.score += 30;
      }
    }

    // Tekrarlı küfür kullanımı
    if (blacklistCount > 2) {
      result.score += 40;
      result.suggestedAction = 'block';
    }

    // Spam kontrolü
    for (const pattern of this.spamPatterns) {
      if (pattern.test(message)) {
        result.flags.push('spam_pattern');
        result.score += 25;
      }
    }

    // Caps lock spam
    const upperCount = (message.match(/[A-Z]/g) || []).length;
    if (upperCount > message.length * 0.7 && message.length > 10) {
      result.flags.push('excessive_caps');
      result.score += 15;
    }

    // AI moderasyon (ileride)
    // Toxicity detection, hate speech, harassment

    if (result.score >= 70) {
      result.approved = false;
      result.suggestedAction = 'block';
      result.reason = 'Message violates community guidelines';
    } else if (result.score >= 40) {
      result.suggestedAction = 'warn';
    }

    if (!result.approved || result.score >= 40) {
      this.logger.warn(`Message moderation for user ${userId}: Score ${result.score}`);
      await this.queueForReview('chat', message, result, userId);
    }

    return result;
  }

  /**
   * AI moderasyon API çağrısı (ileride OpenAI Moderation API kullanılabilir)
   */
  private async aiModerateText(text: string): Promise<number> {
    // TODO: AI moderasyon API entegrasyonu
    // - OpenAI Moderation API
    // - Google Perspective API
    // - Kendi ML modelimiz

    return 0;
  }

  /**
   * İnceleme kuyruğuna ekler
   */
  private async queueForReview(
    contentType: string,
    content: string,
    result: ModerationResult,
    userId?: string
  ): Promise<void> {
    // TODO: moderation_queue tablosuna kayıt

    const queueEntry = {
      contentType,
      content,
      userId,
      aiScore: result.score,
      aiFlags: result.flags,
      status: 'pending'
    };

    this.logger.debug(`Queued for review: ${contentType} - ${content.substring(0, 50)}`);
  }

  /**
   * Moderasyon kurallarını yükler
   */
  async loadModerationRules(): Promise<void> {
    // TODO: Database'den moderation_rules tablosunu oku
    // Blacklist ve pattern'leri güncelle

    this.logger.log('Moderation rules loaded');
  }

  /**
   * Yeni moderasyon kuralı ekler
   */
  async addModerationRule(rule: Partial<ModerationRule>): Promise<ModerationRule> {
    // TODO: Database'e kaydet

    const newRule: ModerationRule = {
      id: this.generateRuleId(),
      ruleType: rule.ruleType || 'blacklist',
      pattern: rule.pattern || '',
      severity: rule.severity || 'medium',
      autoAction: rule.autoAction || 'flag'
    };

    // In-memory cache'i güncelle
    if (typeof newRule.pattern === 'string') {
      this.blacklistedWords.add(newRule.pattern.toLowerCase());
    }

    this.logger.log(`Added moderation rule: ${newRule.id} - ${newRule.pattern}`);

    return newRule;
  }

  /**
   * Admin inceleme sonucu
   */
  async reviewContent(
    queueId: string,
    reviewerId: string,
    action: 'approve' | 'reject' | 'escalate',
    notes?: string
  ): Promise<void> {
    // TODO: moderation_queue kaydını güncelle

    this.logger.log(`Content ${queueId} reviewed by ${reviewerId}: ${action}`);
  }

  /**
   * Kullanıcının moderasyon geçmişini getirir
   */
  async getUserModerationHistory(userId: string): Promise<Array<{
    contentType: string;
    action: string;
    timestamp: Date;
  }>> {
    // TODO: Database sorgusu

    return [];
  }

  /**
   * İstatistikler
   */
  async getModerationStats(period: 'daily' | 'weekly' | 'monthly'): Promise<{
    totalReviews: number;
    approved: number;
    rejected: number;
    pending: number;
    avgScore: number;
  }> {
    // TODO: Database aggregation

    return {
      totalReviews: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      avgScore: 0
    };
  }

  /**
   * Rule ID generator
   */
  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
