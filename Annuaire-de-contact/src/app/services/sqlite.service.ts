import { Injectable } from '@angular/core';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

export interface User {
  id?: number;
  type: 'entreprise' | 'interimaire';
  nom: string;
  prenom: string;
  age?: number;
  telephone: string;
  email: string;
  adressePostal?: string;
  codePostal?: string;
  metier?: string;
  description?: string;
  photo?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private SQL: SqlJsStatic | null = null;
  private db: Database | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.SQL = await initSqlJs({
      locateFile: (file: string) => `assets/sql-js/${file}`
    });

    const savedDb = localStorage.getItem('contacts-db');
    if (savedDb) {
      const uint8Array = new Uint8Array(
        atob(savedDb).split('').map(c => c.charCodeAt(0))
      );
      this.db = new this.SQL.Database(uint8Array);
    } else {
      this.db = new this.SQL.Database();
      this.createTables();
    }
    this.isInitialized = true;
  }

  private createTables(): void {
    if (!this.db) return;
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        age INTEGER,
        telephone TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        adressePostal TEXT,
        codePostal TEXT,
        metier TEXT,
        description TEXT,
        photo TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    this.db.run(createTableQuery);
    this.saveDatabase();
  }

  private saveDatabase(): void {
    if (!this.db) return;
    const data = this.db.export();
    const base64String = btoa(String.fromCharCode(...data));
    localStorage.setItem('contacts-db', base64String);
  }

  async addContact(contact: Omit<User, 'id' | 'createdAt'>): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(
      `INSERT INTO contacts (
        type, nom, prenom, age, telephone, email,
        adressePostal, codePostal, metier, description, photo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run([
      contact.type,
      contact.nom,
      contact.prenom,
      contact.age ?? null,
      contact.telephone,
      contact.email,
      contact.adressePostal ?? null,
      contact.codePostal ?? null,
      contact.metier ?? null,
      contact.description ?? null,
      contact.photo ?? null
    ]);
    stmt.free();
    this.saveDatabase();
  }

  async getAllContacts(): Promise<User[]> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare('SELECT * FROM contacts ORDER BY createdAt DESC');
    const contacts: User[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      contacts.push({
        id: row['id'] as number,
        type: row['type'] as 'entreprise' | 'interimaire',
        nom: row['nom'] as string,
        prenom: row['prenom'] as string,
        age: row['age'] as number,
        telephone: row['telephone'] as string,
        email: row['email'] as string,
        adressePostal: row['adressePostal'] as string,
        codePostal: row['codePostal'] as string,
        metier: row['metier'] as string,
        description: row['description'] as string,
        photo: row['photo'] as string,
        createdAt: row['createdAt'] as string
      });
    }
    stmt.free();
    return contacts;
  }

  async updateContact(id: number, contact: Omit<User, 'id' | 'createdAt'>): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(
      `UPDATE contacts SET
        type = ?,
        nom = ?,
        prenom = ?,
        age = ?,
        telephone = ?,
        email = ?,
        adressePostal = ?,
        codePostal = ?,
        metier = ?,
        description = ?,
        photo = ?
      WHERE id = ?`
    );
    stmt.run([
      contact.type,
      contact.nom,
      contact.prenom,
      contact.age ?? null,
      contact.telephone,
      contact.email,
      contact.adressePostal ?? null,
      contact.codePostal ?? null,
      contact.metier ?? null,
      contact.description ?? null,
      contact.photo ?? null,
      id
    ]);
    stmt.free();
    this.saveDatabase();
  }

  async deleteContact(id: number): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare('DELETE FROM contacts WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    this.saveDatabase();
  }

  async searchContacts(searchTerm: string): Promise<User[]> {
    if (!this.isInitialized) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(
      `SELECT * FROM contacts
      WHERE nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR telephone LIKE ? OR metier LIKE ?
      ORDER BY createdAt DESC`
    );
    const term = `%${searchTerm}%`;
    const contacts: User[] = [];
    stmt.bind([term, term, term, term, term]);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      contacts.push({
        id: row['id'] as number,
        type: row['type'] as 'entreprise' | 'interimaire',
        nom: row['nom'] as string,
        prenom: row['prenom'] as string,
        age: row['age'] as number,
        telephone: row['telephone'] as string,
        email: row['email'] as string,
        adressePostal: row['adressePostal'] as string,
        codePostal: row['codePostal'] as string,
        metier: row['metier'] as string,
        description: row['description'] as string,
        photo: row['photo'] as string,
        createdAt: row['createdAt'] as string
      });
    }
    stmt.free();
    return contacts;
  }
}
