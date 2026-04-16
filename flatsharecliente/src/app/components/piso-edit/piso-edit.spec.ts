import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PisoEdit } from './piso-edit';

describe('PisoEdit', () => {
  let component: PisoEdit;
  let fixture: ComponentFixture<PisoEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PisoEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PisoEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
