import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportContacts } from './export-contacts';

describe('ExportContacts', () => {
  let component: ExportContacts;
  let fixture: ComponentFixture<ExportContacts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportContacts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportContacts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
