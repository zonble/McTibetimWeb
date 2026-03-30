import {
  CommittingState,
  EmptyState,
  InputState,
  InputtingState,
  StackingState,
  WylieInputtingState,
} from './InputState';
import { Candidate } from './Candidate';

describe('EmptyState', () => {
  it('should be an instance of InputState', () => {
    const state = new EmptyState();
    expect(state).toBeInstanceOf(InputState);
  });

  it('should be an instance of EmptyState', () => {
    const state = new EmptyState();
    expect(state).toBeInstanceOf(EmptyState);
  });
});

describe('CommittingState', () => {
  it('should store the commitString', () => {
    const state = new CommittingState('commit this');
    expect(state.commitString).toBe('commit this');
  });

  it('should store an empty commitString', () => {
    const state = new CommittingState('');
    expect(state.commitString).toBe('');
  });

  it('should store Tibetan characters as commitString', () => {
    const state = new CommittingState('ཀ');
    expect(state.commitString).toBe('ཀ');
  });

  it('should be an instance of InputState', () => {
    const state = new CommittingState('x');
    expect(state).toBeInstanceOf(InputState);
  });
});

describe('WylieInputtingState', () => {
  it('should store letters, tibetan, and cursorIndex', () => {
    const state = new WylieInputtingState('abc', 'ཀ', 3);
    expect(state.letters).toBe('abc');
    expect(state.tibetan).toBe('ཀ');
    expect(state.cursorIndex).toBe(3);
  });

  it('composingBuffer should return letters', () => {
    const state = new WylieInputtingState('ka', 'ཀ', 2);
    expect(state.composingBuffer).toBe('ka');
  });

  it('tooltip should return tibetan', () => {
    const state = new WylieInputtingState('ka', 'ཀ', 2);
    expect(state.tooltip).toBe('ཀ');
  });

  it('should be an instance of InputtingState', () => {
    const state = new WylieInputtingState('', '', 0);
    expect(state).toBeInstanceOf(InputtingState);
  });

  it('candidates should be empty by default', () => {
    const state = new WylieInputtingState('', '', 0);
    expect(state.candodates).toEqual([]);
  });

  it('selectionKeys should have default values', () => {
    const state = new WylieInputtingState('', '', 0);
    expect(state.selectionKeys).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  });

  it('should allow adding candidates', () => {
    const state = new WylieInputtingState('ka', 'ཀ', 2);
    state.candodates.push(new Candidate('ཀ', 'ka'));
    expect(state.candodates).toHaveLength(1);
    expect(state.candodates[0].displayText).toBe('ཀ');
  });
});

describe('StackingState', () => {
  it('should store utf16Code and consonantIndexes', () => {
    const codes = [0x0f40, 0x0f72];
    const state = new StackingState(codes, [0]);
    expect(state.utf16Code).toEqual(codes);
    expect(state.consonantIndexes).toEqual([0]);
  });

  it('composingBuffer should be a string built from utf16Code', () => {
    const codes = [0x0f40];
    const state = new StackingState(codes, [0]);
    expect(state.composingBuffer).toBe(String.fromCharCode(0x0f40));
  });

  it('composingBuffer should be empty for empty codes', () => {
    const state = new StackingState([], []);
    expect(state.composingBuffer).toBe('');
  });

  it('cursorIndex should equal composingBuffer length', () => {
    const codes = [0x0f40, 0x0f72];
    const state = new StackingState(codes, [0, 1]);
    expect(state.cursorIndex).toBe(state.composingBuffer.length);
  });

  it('tooltip should be "Stacking"', () => {
    const state = new StackingState([], []);
    expect(state.tooltip).toBe('Stacking');
  });

  it('should be an instance of InputtingState', () => {
    const state = new StackingState([], []);
    expect(state).toBeInstanceOf(InputtingState);
  });

  it('candidates should be empty by default', () => {
    const state = new StackingState([], []);
    expect(state.candodates).toEqual([]);
  });

  it('selectionKeys should have default values', () => {
    const state = new StackingState([], []);
    expect(state.selectionKeys).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  });
});
