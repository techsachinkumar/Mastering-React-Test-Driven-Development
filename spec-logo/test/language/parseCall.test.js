import { parseAndSaveStatement, parseCall } from '../../src/language/parseCall';

describe('parseAndSaveStatement', () => {
  let state;

  describe('completing an instruction', () => {
    beforeEach(() => {
      state = parseAndSaveStatement({
        parsedInstructions: [],
        parsedTokens: [],
        currentInstruction: {
          id: 123,
          isComplete: true,
          functionDefinition: { parseToken: () => ({ a: 123 }) } } },
        { type: 'token', text: 'token' });
    });

    it('appends currentInstruction to parsedInstructions when it is complete', () => {
      expect(state.parsedInstructions.length).toEqual(1);
      expect(state.parsedInstructions[0].a).toEqual(123);
    });

    it('removes currentInstruction if it has been completed', () => {
      expect(state.currentInstruction).not.toBeDefined();
    });

    it('adds this token into the parsedTokens after parsing', () => {
      expect(state.parsedTokens.length).toEqual(1);
      expect(state.parsedTokens[0]).toEqual({ type: 'token', text: 'token', instructionId: 123 });
    });
  });

  describe('beginning a new instruction', () => {
    beforeEach(() => {
      state = parseAndSaveStatement({
        nextInstructionId: 123,
        parsedInstructions: [],
        currentInstruction: undefined,
        parsedTokens: [],
        allFunctions: [ { names: ['forward'] } ]
      }, { type: 'token', text: 'forward'});
    });

    it('assigns an id to the new instruction', () => {
      expect(state.currentInstruction.id).toEqual(123);
    });

    it('increments nextInstructionId', () => {
      expect(state.nextInstructionId).toEqual(124);
    });

    it('adds this token into the currentInstruction parseTokens', () => {
      expect(state.parsedTokens.length).toEqual(1);
      expect(state.parsedTokens[0]).toEqual({ type: 'token', text: 'forward', instructionId: 123 });
    });
  });

  describe('whitespace', () => {
    it('adds whitespace as tokens without an instruction if currently outside an instruction', () => {
      state = parseAndSaveStatement({
        parsedInstructions: [],
        currentInstruction: undefined,
        parsedTokens: [],
        allFunctions: [ { names: ['forward'] } ]
      }, { type: 'whitespace', text: '   ' });
      expect(state.parsedTokens.length).toEqual(1);
      expect(state.parsedTokens[0]).toEqual({ type: 'whitespace', text: '   ' });
    });
  });
});

describe('parseCall', () => {
  it('ignores whitespace', () => {
    const currentInstruction = {
      collectedParameters: {},
      functionDefinition: {
        parameters: ['x']
      }
    };
    const result = parseCall({ currentInstruction }, { type: 'whitespace' });

    expect(result).toEqual(currentInstruction);
  });
});
