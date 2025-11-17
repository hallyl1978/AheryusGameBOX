/**
 * Database Configuration
 * Supabase PostgreSQL connection setup
 */

import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

export class DatabaseConfig {
  private static supabaseClient: any;

  static initialize(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    });

    return this.supabaseClient;
  }

  static getClient() {
    if (!this.supabaseClient) {
      throw new Error('Database not initialized. Call initialize() first');
    }
    return this.supabaseClient;
  }
}

// Database helper functions
export const db = {
  /**
   * Execute a raw SQL query
   */
  async query(sql: string, params: any[] = []) {
    const client = DatabaseConfig.getClient();
    const { data, error } = await client.rpc('exec_sql', {
      sql_query: sql,
      sql_params: params
    });

    if (error) throw error;
    return data;
  },

  /**
   * Select from a table
   */
  from(table: string) {
    return DatabaseConfig.getClient().from(table);
  },

  /**
   * Begin transaction
   */
  async transaction(callback: (client: any) => Promise<void>) {
    const client = DatabaseConfig.getClient();

    try {
      await client.rpc('begin_transaction');
      await callback(client);
      await client.rpc('commit_transaction');
    } catch (error) {
      await client.rpc('rollback_transaction');
      throw error;
    }
  }
};
