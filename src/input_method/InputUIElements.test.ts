import { InputUIStateBuilder } from './InputUIElements';
import { StackingState, WylieInputtingState } from './InputState';
import { Candidate } from './Candidate';

describe('InputUIStateBuilder', () => {
  describe('constructor', () => {
    it('should accept an InputtingState', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      const builder = new InputUIStateBuilder(state);
      expect(builder.state).toBe(state);
    });
  });

  describe('build', () => {
    it('should include composingBuffer text from WylieInputtingState', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      const builder = new InputUIStateBuilder(state);
      const result = builder.build();
      expect(result.composingBuffer).toBeDefined();
      expect(result.composingBuffer).toHaveLength(1);
      expect(result.composingBuffer[0].text).toBe('ka');
    });

    it('should include composingBuffer text from StackingState', () => {
      const codes = [0x0f40];
      const state = new StackingState(codes, [0]);
      const builder = new InputUIStateBuilder(state);
      const result = builder.build();
      expect(result.composingBuffer[0].text).toBe(String.fromCharCode(0x0f40));
    });

    it('should include cursorIndex from WylieInputtingState', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      const builder = new InputUIStateBuilder(state);
      const result = builder.build();
      expect(result.cursorIndex).toBe(2);
    });

    it('should include cursorIndex from StackingState', () => {
      const codes = [0x0f40, 0x0f72];
      const state = new StackingState(codes, [0]);
      const builder = new InputUIStateBuilder(state);
      const result = builder.build();
      expect(result.cursorIndex).toBe(state.composingBuffer.length);
    });

    it('should include tooltip from WylieInputtingState', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      const builder = new InputUIStateBuilder(state);
      const result = builder.build();
      expect(result.tooltip).toBe('ཀ');
    });

    it('should include tooltip from StackingState', () => {
      const state = new StackingState([], []);
      const builder = new InputUIStateBuilder(state);
      const result = builder.build();
      expect(result.tooltip).toBe('Stacking');
    });

    it('should return empty candidates when state has no candidates', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      const builder = new InputUIStateBuilder(state);
      const result = builder.build();
      expect(result.candidates).toHaveLength(0);
    });

    it('should wrap candidates with selection keys', () => {
      const state = new StackingState([0x0f40], [0]);
      state.candodates.push(new Candidate('ཀ', 'ka'));
      state.candodates.push(new Candidate('ཁ', 'kha'));
      const builder = new InputUIStateBuilder(state);
      const result = builder.build();
      expect(result.candidates).toHaveLength(2);
      expect(result.candidates[0].keyCap).toBe('1');
      expect(result.candidates[1].keyCap).toBe('2');
    });

    it('should set selected to false for all candidates', () => {
      const state = new StackingState([0x0f40], [0]);
      state.candodates.push(new Candidate('ཀ', 'ka'));
      const builder = new InputUIStateBuilder(state);
      const result = builder.build();
      expect(result.candidates[0].selected).toBe(false);
    });

    it('candidate reading and value should equal displayText', () => {
      const state = new StackingState([0x0f40], [0]);
      state.candodates.push(new Candidate('ཀ', 'ka'));
      const builder = new InputUIStateBuilder(state);
      const result = builder.build();
      expect(result.candidates[0].reading).toBe('ཀ');
      expect(result.candidates[0].value).toBe('ཀ');
    });

    it('candidate description should match Candidate description', () => {
      const state = new StackingState([0x0f40], [0]);
      state.candodates.push(new Candidate('ཀ', 'ka'));
      const builder = new InputUIStateBuilder(state);
      const result = builder.build();
      expect(result.candidates[0].description).toBe('ka');
    });
  });

  describe('buildJsonString', () => {
    it('should return a valid JSON string', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      const builder = new InputUIStateBuilder(state);
      const jsonStr = builder.buildJsonString();
      expect(() => JSON.parse(jsonStr)).not.toThrow();
    });

    it('should contain composingBuffer text in JSON', () => {
      const state = new WylieInputtingState('abc', 'ཀ', 3);
      const builder = new InputUIStateBuilder(state);
      const jsonStr = builder.buildJsonString();
      expect(jsonStr).toContain('abc');
    });

    it('should contain tooltip in JSON', () => {
      const state = new WylieInputtingState('ka', 'ཀ', 2);
      const builder = new InputUIStateBuilder(state);
      const jsonStr = builder.buildJsonString();
      expect(jsonStr).toContain('ཀ');
    });

    it('should contain candidates in JSON', () => {
      const state = new StackingState([0x0f40], [0]);
      state.candodates.push(new Candidate('ཀ', 'ka'));
      const builder = new InputUIStateBuilder(state);
      const jsonStr = builder.buildJsonString();
      const parsed = JSON.parse(jsonStr);
      expect(parsed.candidates).toHaveLength(1);
    });
  });
});
