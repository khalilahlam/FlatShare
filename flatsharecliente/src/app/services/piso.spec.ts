import { TestBed } from '@angular/core/testing';

import { Piso } from './piso';

describe('Piso', () => {
  let service: Piso;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Piso);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
