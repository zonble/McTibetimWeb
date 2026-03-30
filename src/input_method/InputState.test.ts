import { Candidate } from './Candidate';
import {
  CommittingState,
  EmptyState,
  InputtingState,
  StackingState,
  WylieInputtingState,
} from './InputState';

describe('EmptyState', () => {
  it('is an instance of InputState', () => {
    const state = new EmptyState();
    expect(state).toBeInstanceOf(EmptyState);
  });
});

describe('CommittingState', () => {
  it('stores commitString', () => {
    const state = new CommittingState('hello');
    expect(state.commitString).toBe('hello');
  });

  it('stores unicode commit string', () => {
    const state = new CommittingState('ཀ');
    expect(state.commitString).toBe('ཀ');
  });
});

describe('WylieInputtingState', () => {
  it('stores letters, tibetan, and cursorIndex', () => {
    const state = new WylieInputtingState('ka', 'ཀ', 2);
    expect(state.letters).toBe('ka');
    expect(state.tibetan).toBe('ཀ');
    expect(state.cursorIndex).toBe(2);
  });

  it('composingBuffer returns letters', () => {
    const state = new WylieInputtingState('abc', 'ཀ', 1);
    expect(state.composingBuffer).toBe('abc');
  });

  it('tooltip returns tibetan', () => {
    const state = new WylieInputtingState('ka', 'ཀ', 1);
    expect(state.tooltip).toBe('ཀ');
  });

  it('starts with empty candidates array', () => {
    const state = new WylieInputtingState('ka', 'ཀ', 1);
    expect(state.candodates).toEqual([]);
  });

  it('is an instance of InputtingState', () => {
    const state = new WylieInputtingState('ka', 'ཀ', 1);
    expect(state).toBeInstanceOf(InputtingState);
  });

  it('has default selectionKeys', () => {
    const state = new WylieInputtingState('ka', 'ཀ', 1);
    expect(state.selectionKeys).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  });
});

describe('StackingState', () => {
  it('stores utf16Code and consonantIndexes', () => {
    const state = new StackingState([0x0f40], [0]);
    expect(state.utf16Code).toEqual([0x0f40]);
    expect(state.consonantIndexes).toEqual([0]);
  });

  it('composingBuffer returns string from utf16 codes', () => {
    const state = new StackingState([0x0f40], [0]);
    expect(state.composingBuffer).toBe(String.fromCharCode(0x0f40));
  });

  it('composingBuffer is empty when no codes', () => {
    const state = new StackingState([], []);
    expect(state.composingBuffer).toBe('');
  });

  it('cursorIndex equals composingBuffer length', () => {
    const state = new StackingState([0x0f40, 0x0f41], [0, 1]);
    expect(state.cursorIndex).toBe(2);
  });

  it('tooltip returns Stacking', () => {
    const state = new StackingState([], []);
    expect(state.tooltip).toBe('Stacking');
  });

  it('starts with empty candidates array', () => {
    const state = new StackingState([], []);
    expect(state.candodates).toEqual([]);
  });

  it('is an instance of InputtingState', () => {
    const state = new StackingState([], []);
    expect(state).toBeInstanceOf(InputtingState);
  });
});
