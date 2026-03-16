import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PisoList } from './piso-list';

describe('PisoList', () => {
  let component: PisoList;
  let fixture: ComponentFixture<PisoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PisoList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PisoList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
