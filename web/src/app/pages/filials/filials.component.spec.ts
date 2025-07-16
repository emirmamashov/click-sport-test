import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilialsComponent } from './filials.component';

describe('FilialsComponent', () => {
  let component: FilialsComponent;
  let fixture: ComponentFixture<FilialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
