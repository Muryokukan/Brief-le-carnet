export interface Contact {
  id?: number;
  type: 'interimaire' | 'entreprise';
  nom: string;
  prenom?: string; // Optionnel pour entreprise
  photo?: string; // Base64 ou chemin
  age?: number; // Optionnel pour entreprise
  telephone: string;
  email: string;
  adressePostal: string;
  codePostal: string;
  metier: string;
  description: string;
  dateCreation?: string;
}

// Interface pour le formulaire (avec File)
export interface ContactForm {
  type: 'interimaire' | 'entreprise';
  nom: string;
  prenom: string;
  photo: File | null;
  age: number | null;
  telephone: string;
  email: string;
  adressePostal: string;
  codePostal: string;
  metier: string;
  description: string;
}
