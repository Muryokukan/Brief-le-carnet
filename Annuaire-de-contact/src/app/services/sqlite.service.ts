import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private db: SQLiteObject | null = null;
  private dbName = 'contacts-db';

  constructor(private sqlite: SQLite, private platform: Platform) {
    this.initializeDB();
  }

  async initializeDB() {
    if (this.platform.is('cordova')) {
      try {
        this.db = await this.sqlite.create({
          name: this.dbName,
          location: 'default'
        });
        await this.createTables();
        await this.migrateOldData(); // Migration !
        console.log('✅ Base de données initialisée');
      } catch (error) {
        console.error('❌ Erreur DB:', error);
      }
    }
  }

  private async createTables() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL DEFAULT 'interimaire',
        nom TEXT NOT NULL,
        prenom TEXT,
        photo TEXT,
        age INTEGER,
        telephone TEXT NOT NULL,
        email TEXT NOT NULL,
        adressePostal TEXT NOT NULL,
        codePostal TEXT NOT NULL,
        metier TEXT NOT NULL,
        description TEXT NOT NULL,
        dateCreation TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    if (this.db) {
      await this.db.executeSql(createTableSQL, []);
      console.log('✅ Table contacts créée/mise à jour');
    }
  }

  // Migration des anciennes données
  private async migrateOldData() {
    if (!this.db) return;

    try {
      // Vérifier si on a des anciens contacts (structure simple)
      const result = await this.db.executeSql(
        'SELECT * FROM contacts WHERE type IS NULL OR type = ""', 
        []
      );

      for (let i = 0; i < result.rows.length; i++) {
        const oldContact = result.rows.item(i);
        
        // Migrer vers nouvelle structure
        await this.db.executeSql(`
          UPDATE contacts 
          SET 
            type = 'interimaire',
            email = COALESCE(email, ''),
            adressePostal = COALESCE(adressePostal, ''),
            codePostal = COALESCE(codePostal, ''),
            metier = COALESCE(metier, ''),
            description = COALESCE(description, '')
          WHERE id = ?
        `, [oldContact.id]);
      }
      
      console.log('✅ Migration terminée');
    } catch (error) {
      console.log('ℹ️ Pas de migration nécessaire');
    }
  }

  async addContact(contact: Contact): Promise<boolean> {
    if (!this.db) return false;

    try {
      const result = await this.db.executeSql(`
        INSERT INTO contacts (
          type, nom, prenom, photo, age, telephone, 
          email, adressePostal, codePostal, metier, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        contact.type,
        contact.nom,
        contact.prenom || null,
        contact.photo || null,
        contact.age || null,
        contact.telephone,
        contact.email,
        contact.adressePostal,
        contact.codePostal,
        contact.metier,
        contact.description
      ]);

      console.log('✅ Contact ajouté, ID:', result.insertId);
      return true;
    } catch (error) {
      console.error('❌ Erreur ajout contact:', error);
      return false;
    }
  }

  async getAllContacts(): Promise<Contact[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.executeSql('SELECT * FROM contacts ORDER BY id DESC', []);
      const contacts: Contact[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        contacts.push(result.rows.item(i));
      }

      return contacts;
    } catch (error) {
      console.error('❌ Erreur récupération contacts:', error);
      return [];
    }
  }

  async getContactsByType(type: 'interimaire' | 'entreprise'): Promise<Contact[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.executeSql(
        'SELECT * FROM contacts WHERE type = ? ORDER BY id DESC', 
        [type]
      );
      
      const contacts: Contact[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        contacts.push(result.rows.item(i));
      }

      return contacts;
    } catch (error) {
      console.error('❌ Erreur récupération par type:', error);
      return [];
    }
  }

  async deleteContact(id: number): Promise<boolean> {
    if (!this.db) return false;

    try {
      await this.db.executeSql('DELETE FROM contacts WHERE id = ?', [id]);
      console.log('✅ Contact supprimé, ID:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      return false;
    }
  }
}
