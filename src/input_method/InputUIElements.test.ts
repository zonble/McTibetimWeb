import { Candidate } from './Candidate';
import { InputUIStateBuilder } from './InputUIElements';
import { StackingState, WylieInputtingState } from './InputState';

describe('InputUIStateBuilder', () => {
  describe('build', () => {
    it('builds UI state from WylieInputtingState', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      const builder = new InputUIStateBuilder(state);
      const uiState = builder.build();

      expect(uiState.composingBuffer).toHaveLength(1);
      expect(uiState.composingBuffer[0].text).toBe('ka');
      expect(uiState.cursorIndex).toBe(2);
      expect(uiState.candidates).toHaveLength(0);
      expect(uiState.tooltip).toBe('ཀ');
    });

    it('builds UI state with candidates', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      state.candodates = [
        new Candidate('ཀ', 'ka'),
        new Candidate('ཁ', 'kha'),
      ];
      const builder = new InputUIStateBuilder(state);
      const uiState = builder.build();

      expect(uiState.candidates).toHaveLength(2);
      expect(uiState.candidates[0].keyCap).toBe('1');
      expect(uiState.candidates[0].reading).toBe('ཀ');
      expect(uiState.candidates[0].value).toBe('ཀ');
      expect(uiState.candidates[0].description).toBe('ka');
      expect(uiState.candidates[0].selected).toBe(false);
      expect(uiState.candidates[1].keyCap).toBe('2');
    });

    it('builds UI state from StackingState', () => {
      const state = new StackingState([0x0f40], [0]);
      const builder = new InputUIStateBuilder(state);
      const uiState = builder.build();

      expect(uiState.composingBuffer).toHaveLength(1);
      expect(uiState.composingBuffer[0].text).toBe(String.fromCharCode(0x0f40));
      expect(uiState.tooltip).toBe('Stacking');
    });
  });

  describe('buildJsonString', () => {
    it('returns valid JSON string', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      const builder = new InputUIStateBuilder(state);
      const json = builder.buildJsonString();

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed.cursorIndex).toBe(2);
    });
  });
});
