import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly prefix = 'fintrax_';

  constructor() { }

  /**
   * Guarda un valor en localStorage
   */
  set(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serializedValue);
    } catch (error) {
      console.error(`Error saving to localStorage: ${error}`);
    }
  }

  /**
   * Obtiene un valor desde localStorage
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${error}`);
      return null;
    }
  }

  /**
   * Elimina un valor del localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Error removing from localStorage: ${error}`);
    }
  }

  /**
   * Limpia todos los valores de Fintrax del localStorage
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`);
    }
  }

  /**
   * Verifica si existe una clave
   */
  exists(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  /**
   * Obtiene todas las claves de Fintrax
   */
  getAllKeys(): string[] {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''));
  }
}
