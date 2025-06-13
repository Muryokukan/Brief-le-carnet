import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SqliteService, User } from '../services/sqlite.service';

@Component({
  selector: 'app-contact-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-manager.html',
  styleUrl: './contact-manager.css'
})
export class ContactManagerComponent {
  contacts: User[] = [];
  currentContact: Omit<User, 'id' | 'createdAt'> = this.newContactObj();
  isEditing: boolean = false;
  editingId: number | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(private sqliteService: SqliteService) {
    this.loadContacts();
  }

  async loadContacts() {
    this.contacts = await this.sqliteService.getAllContacts();
  }

  async submitForm() {
    try {
      if (this.isEditing && this.editingId) {
        await this.sqliteService.updateContact(this.editingId, this.currentContact);
        this.successMessage = 'Contact modifié !';
      } else {
        await this.sqliteService.addContact(this.currentContact);
        this.successMessage = 'Contact ajouté !';
      }
      this.resetForm();
      this.loadContacts();
    } catch (e) {
      this.errorMessage = 'Erreur lors de l\'enregistrement';
    }
  }

  editContact(contact: User) {
    this.isEditing = true;
    this.editingId = contact.id ?? null;
    this.currentContact = {
      type: contact.type,
      nom: contact.nom,
      prenom: contact.prenom,
      age: contact.age,
      telephone: contact.telephone,
      email: contact.email,
      adressePostal: contact.adressePostal,
      codePostal: contact.codePostal,
      metier: contact.metier,
      description: contact.description,
      photo: contact.photo
    };
    this.clearMessages();
  }

  async deleteContact(id: number | undefined) {
    if (!id) return;
    await this.sqliteService.deleteContact(id);
    this.loadContacts();
  }

  resetForm() {
    this.currentContact = this.newContactObj();
    this.isEditing = false;
    this.editingId = null;
    this.clearMessages();
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  newContactObj(): Omit<User, 'id' | 'createdAt'> {
    return {
      type: "interimaire",
      nom: "",
      prenom: "",
      age: undefined,
      telephone: "",
      email: "",
      adressePostal: "",
      codePostal: "",
      metier: "",
      description: "",
      photo: ""
    };
  }
}
