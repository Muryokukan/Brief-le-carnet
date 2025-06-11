import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SqliteService } from '../services/sqlite.service';
import { Contact, ContactForm } from '../models/contact.model';

@Component({
  selector: 'app-user-form-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './user-form-component.html',
  styleUrl: './user-form-component.css'
})
export class UserFormComponent {
  donneForm: ContactForm = {
    type: 'interimaire',
    nom: '',
    prenom: '',
    photo: null,
    age: null,
    telephone: '',
    email: '',
    adressePostal: '',
    codePostal: '',
    metier: '',
    description: ''
  };

  photoPrevieuw: string | ArrayBuffer | null = null;
  isSubmitting = false;

  constructor(private sqliteService: SqliteService) {}

  pictures(event: any) {
    const image = event.target.files[0];
    if (image) {
      this.donneForm.photo = image;
      
      // Aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPrevieuw = e.target?.result || null;
      };
      reader.readAsDataURL(image);
    }
  }

  private async convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async envoie(): Promise<void> {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    
    try {
      console.log('📤 Formulaire soumis :', this.donneForm);

      // Convertir le formulaire en contact DB
      const contact: Contact = {
        type: this.donneForm.type,
        nom: this.donneForm.nom,
        prenom: this.donneForm.type === 'interimaire' ? this.donneForm.prenom : undefined,
        photo: this.donneForm.photo ? await this.convertImageToBase64(this.donneForm.photo) : undefined,
        age: this.donneForm.type === 'interimaire' ? this.donneForm.age : undefined,
        telephone: this.donneForm.telephone,
        email: this.donneForm.email,
        adressePostal: this.donneForm.adressePostal,
        codePostal: this.donneForm.codePostal,
        metier: this.donneForm.metier,
        description: this.donneForm.description
      };

      const success = await this.sqliteService.addContact(contact);
      
      if (success) {
        alert('✅ Contact ajouté avec succès !');
        this.resetForm();
      } else {
        alert('❌ Erreur lors de l\'ajout du contact');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('❌ Erreur lors de l\'ajout du contact');
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
    this.donneForm = {
      type: 'interimaire',
      nom: '',
      prenom: '',
      photo: null,
      age: null,
      telephone: '',
      email: '',
      adressePostal: '',
      codePostal: '',
      metier: '',
      description: ''
    };
    this.photoPrevieuw = null;
  }

  // Debug removed later
  async debugContacts() {
    const contacts = await this.sqliteService.getAllContacts();
    console.table(contacts);
  }
}
