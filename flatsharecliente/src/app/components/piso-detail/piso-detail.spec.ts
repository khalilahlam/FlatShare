import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PisoDetail } from './piso-detail';

describe('PisoDetail', () => {
  let component: PisoDetail;
  let fixture: ComponentFixture<PisoDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PisoDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PisoDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
