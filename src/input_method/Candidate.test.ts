import { Candidate } from './Candidate';

describe('Candidate', () => {
  it('should store displayText and description', () => {
    const candidate = new Candidate('hello', 'a greeting');
    expect(candidate.displayText).toBe('hello');
    expect(candidate.description).toBe('a greeting');
  });

  it('should allow empty strings', () => {
    const candidate = new Candidate('', '');
    expect(candidate.displayText).toBe('');
    expect(candidate.description).toBe('');
  });

  it('should store Tibetan characters as displayText', () => {
    const candidate = new Candidate('ཀ', 'ka');
    expect(candidate.displayText).toBe('ཀ');
    expect(candidate.description).toBe('ka');
  });
});
