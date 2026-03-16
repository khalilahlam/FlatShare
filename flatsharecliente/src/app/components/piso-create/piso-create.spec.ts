import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PisoCreate } from './piso-create';

describe('PisoCreate', () => {
  let component: PisoCreate;
  let fixture: ComponentFixture<PisoCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PisoCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PisoCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
