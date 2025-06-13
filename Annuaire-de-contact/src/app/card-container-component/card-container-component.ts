import { Component, OnInit } from '@angular/core';
import { CardEntrepriseComponent } from '../card-entreprise-component/card-entreprise-component';
import { CardInterimaireComponent } from '../card-interimaire-component/card-interimaire-component';
import { CommonModule } from '@angular/common';
import { SqliteService, User } from '../services/sqlite.service';

@Component({
  selector: 'app-card-container',
  standalone: true,
  imports: [CardEntrepriseComponent, CardInterimaireComponent, CommonModule],
  templateUrl: './card-container-component.html'
})
export class CardContainerComponent implements OnInit {
  donnees: User[] = [];
  filtre: 'tous' | 'entreprise' | 'interimaire' = 'tous';
  loading = true;

  constructor(private sqliteService: SqliteService) {}

  async ngOnInit() {
    this.donnees = await this.sqliteService.getAllContacts();
    this.loading = false;
  }

  filtrer(type: 'tous' | 'entreprise' | 'interimaire') {
    this.filtre = type;
  }

  getFiltered() {
    if (this.filtre === 'tous') return this.donnees;
    return this.donnees.filter(d => d.type === this.filtre);
  }
  
}
