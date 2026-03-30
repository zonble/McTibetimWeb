import { Candidate } from './Candidate';

describe('Candidate', () => {
  it('stores displayText and description', () => {
    const candidate = new Candidate('hello', 'a greeting');
    expect(candidate.displayText).toBe('hello');
    expect(candidate.description).toBe('a greeting');
  });

  it('accepts empty strings', () => {
    const candidate = new Candidate('', '');
    expect(candidate.displayText).toBe('');
    expect(candidate.description).toBe('');
  });

  it('stores unicode text', () => {
    const candidate = new Candidate('ཀ', 'Tibetan ka');
    expect(candidate.displayText).toBe('ཀ');
    expect(candidate.description).toBe('Tibetan ka');
  });
});
