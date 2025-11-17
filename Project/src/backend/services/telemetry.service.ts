/**
 * Telemetry Service
 *
 * Oyuncu davranışı, sistem olayları ve performans metriklerini toplar.
 * GDPR/KVKK uyumlu veri toplama.
 *
 * @see Documentation/Advanced_Features.md - Bölüm 2
 */

import { Injectable, Logger } from '@nestjs/common';

export interface TelemetryEvent {
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventCategory: 'navigation' | 'action' | 'system' | 'social' | 'economy';
  eventData: Record<string, any>;
  clientTimestamp?: Date;
  platform?: string;
  appVersion?: string;
}

export interface SessionMetrics {
  userId: string;
  sessionId?: string;
  sessionStart: Date;
  sessionEnd?: Date;
  platform: string;
  deviceInfo?: Record<string, any>;
}

export interface FunnelStep {
  userId: string;
  funnelName: string;
  stepName: string;
  stepOrder: number;
  completed: boolean;
  metadata?: Record<string, any>;
}

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  // Event buffer (batch processing için)
  private eventBuffer: TelemetryEvent[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 5000; // 5 saniye

  constructor() {
    // Periyodik flush
    setInterval(() => this.flushEvents(), this.FLUSH_INTERVAL);
  }

  /**
   * Telemetri olayı kaydeder
   */
  async trackEvent(event: TelemetryEvent): Promise<void> {
    // Privacy check - hassas veri kontrolü
    if (this.containsSensitiveData(event.eventData)) {
      this.logger.warn('Sensitive data detected in telemetry event, sanitizing...');
      event.eventData = this.sanitizeData(event.eventData);
    }

    // Server timestamp ekle
    const enrichedEvent = {
      ...event,
      serverTimestamp: new Date()
    };

    this.eventBuffer.push(enrichedEvent);

    // Buffer doluysa flush et
    if (this.eventBuffer.length >= this.BUFFER_SIZE) {
      await this.flushEvents();
    }
  }

  /**
   * Batch olayları veritabanına yazar
   */
  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // TODO: Database'e batch insert
      // INSERT INTO telemetry_events (user_id, event_type, event_data, ...) VALUES ...

      this.logger.debug(`Flushed ${events.length} telemetry events to database`);
    } catch (error) {
      this.logger.error('Failed to flush telemetry events', error);
      // Hata durumunda event'leri geri koy (en fazla 2x buffer size)
      if (this.eventBuffer.length < this.BUFFER_SIZE * 2) {
        this.eventBuffer.unshift(...events);
      }
    }
  }

  /**
   * Oturum metriklerini başlatır
   */
  async startSession(metrics: SessionMetrics): Promise<void> {
    // TODO: player_session_metrics tablosuna kayıt

    this.logger.log(`Session started for user ${metrics.userId} on ${metrics.platform}`);
  }

  /**
   * Oturum metriklerini sonlandırır
   */
  async endSession(userId: string, sessionId?: string): Promise<void> {
    const sessionEnd = new Date();

    // TODO: Session kaydını güncelle
    // UPDATE player_session_metrics SET session_end = ?, duration_seconds = ? WHERE user_id = ?

    this.logger.log(`Session ended for user ${userId}`);
  }

  /**
   * Funnel analizi için adım kaydeder
   */
  async trackFunnelStep(step: FunnelStep): Promise<void> {
    // TODO: funnel_events tablosuna kayıt

    this.logger.debug(
      `Funnel step tracked: ${step.funnelName} - ${step.stepName} (${step.completed ? 'completed' : 'started'})`
    );
  }

  /**
   * Kullanıcı engagement metriklerini hesaplar
   */
  async calculateEngagementMetrics(userId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<{
    sessionCount: number;
    avgSessionDuration: number;
    totalPlayTime: number;
    daysActive: number;
  }> {
    // TODO: Database sorgusu
    // Belirli bir periyot için kullanıcının metriklerini hesapla

    return {
      sessionCount: 0,
      avgSessionDuration: 0,
      totalPlayTime: 0,
      daysActive: 0
    };
  }

  /**
   * Retention metriklerini hesaplar (D1, D7, D30)
   */
  async calculateRetention(cohortDate: Date): Promise<{
    d1Retention: number;
    d7Retention: number;
    d30Retention: number;
  }> {
    // TODO: Cohort analizi
    // 1. cohortDate tarihinde kayıt olan kullanıcıları bul
    // 2. 1, 7, 30 gün sonra geri dönenleri say
    // 3. Yüzde hesapla

    return {
      d1Retention: 0,
      d7Retention: 0,
      d30Retention: 0
    };
  }

  /**
   * Günlük metrikleri toplar ve saklar
   */
  async aggregateDailyMetrics(date: Date): Promise<void> {
    // TODO: Günlük aggregation job
    // - DAU (Daily Active Users)
    // - New registrations
    // - Avg session duration
    // - Top games
    // - Revenue metrics (ileride)

    this.logger.log(`Aggregating daily metrics for ${date.toISOString().split('T')[0]}`);
  }

  /**
   * Hassas veri kontrolü
   */
  private containsSensitiveData(data: Record<string, any>): boolean {
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn', 'email'];

    for (const key of Object.keys(data)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Hassas verileri temizler
   */
  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (key.toLowerCase().includes('email')) {
        // Email'i hash'le
        sanitized[key] = this.hashEmail(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Email'i hash'ler (privacy)
   */
  private hashEmail(email: string): string {
    // Basit hash (production'da crypto kullanılmalı)
    return `hashed_${email.split('@')[1]}`;
  }

  /**
   * GDPR - Kullanıcı verilerini siler
   */
  async deleteUserData(userId: string): Promise<void> {
    // TODO: Tüm telemetry verilerini sil veya anonimleştir
    // - telemetry_events'de user_id'yi null yap veya sil
    // - player_session_metrics'de user_id'yi null yap
    // - funnel_events'de user_id'yi null yap

    this.logger.warn(`Deleting telemetry data for user ${userId} (GDPR request)`);
  }

  /**
   * GDPR - Kullanıcı verilerini export eder
   */
  async exportUserData(userId: string): Promise<Record<string, any>> {
    // TODO: Kullanıcının tüm telemetry verilerini topla

    return {
      events: [],
      sessions: [],
      funnelSteps: []
    };
  }
}
