import { Component } from '@angular/core';
import { SqliteService } from '../services/sqlite.service';
@Component({
  selector: 'app-export-contacts',
  standalone: true,
  templateUrl: './export-contacts.component.html',
  styleUrls: ['./export-contacts.component.css']
})
export class ExportContactsComponent {
  constructor(private sqliteService: SqliteService) {}

  async exportAllContactsToJson(): Promise<string> {
    const contacts = await this.sqliteService.getAllContacts();
    return JSON.stringify(contacts, null, 2);
  }

  async exportDonnees() {
    const json = await this.exportAllContactsToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
