import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  get client() {
    return this.supabase;
  }

  // Auth methods
  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({
      email,
      password
    });
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getCurrentUser() {
    return await this.supabase.auth.getUser();
  }

  async onAuthStateChange(callback: any) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // Database methods
  async get(table: string, options?: any) {
    return await this.supabase.from(table).select('*');
  }

  async insert(table: string, data: any) {
    return await this.supabase.from(table).insert(data);
  }

  async update(table: string, data: any, filter: { column: string, value: any }) {
    return await this.supabase.from(table).update(data).eq(filter.column, filter.value);
  }

  async delete(table: string, filter: { column: string, value: any }) {
    return await this.supabase.from(table).delete().eq(filter.column, filter.value);
  }
}
