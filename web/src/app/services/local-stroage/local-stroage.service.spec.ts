import { TestBed } from '@angular/core/testing';

import { LocalStroageService } from './local-stroage.service';

describe('LocalStroageService', () => {
  let service: LocalStroageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStroageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
