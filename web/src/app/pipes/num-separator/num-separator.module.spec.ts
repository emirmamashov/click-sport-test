import { NumSeparatorModule } from './num-separator.module';

describe('NumSeparatorModule', () => {
  let numSeparatorModule: NumSeparatorModule;

  beforeEach(() => {
    numSeparatorModule = new NumSeparatorModule();
  });

  it('should create an instance', () => {
    expect(numSeparatorModule).toBeTruthy();
  });
});
