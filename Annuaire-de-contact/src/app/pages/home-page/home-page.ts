import { Component } from '@angular/core';
import { Annuaire } from '../annuaire/annuaire';
import { CardEntrepriseComponent } from "../../card-entreprise-component/card-entreprise-component";
import { CardInterimaireComponent } from "../../card-interimaire-component/card-interimaire-component";
import { CardContainerComponent } from "../../card-container-component/card-container-component";
import { UserFormComponent } from '../../user-form-component/user-form-component';
import { RouterOutlet } from '@angular/router';
import { ContactManagerComponent } from '../../contact-manager/contact-manager';

@Component({
  selector: 'app-home-page',
  imports: [Annuaire, CardContainerComponent, CardEntrepriseComponent, CardInterimaireComponent, UserFormComponent, RouterOutlet, ContactManagerComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {

}
