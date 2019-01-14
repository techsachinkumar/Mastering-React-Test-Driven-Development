import { withUndoRedo } from '../../src/reducers/withUndoRedo';

describe('withUndoRedo', () => {
  let wrappedReducerSpy;
  let reducer;

  beforeEach(() => {
    wrappedReducerSpy = jest.fn();
    reducer = withUndoRedo(wrappedReducerSpy);
  });

  it('initially sets an empty array of past values', () => {
    expect(reducer(undefined)).toHaveProperty('past', []);
  });

  it('initially sets an empty array of future values', () => {
    expect(reducer(undefined)).toHaveProperty('future', []);
  });

  it('initially sets a present value of whatever the reducer returns', () => {
    wrappedReducerSpy.mockReturnValue({ a: 123 });
    expect(reducer(undefined)).toHaveProperty('present', { a: 123 });
  });

  it('initially calls the wrapped reducer with undefined state and the action passed', () => {
    const action = { type: 'UNKNOWN' };
    reducer(undefined, action);
    expect(wrappedReducerSpy).toHaveBeenCalledWith(undefined, action);
  });

  describe('undo', () => {
    const undoAction = { type: 'UNDO' };
    const entry = { a: 123 };

    it('sets the present to the latest past entry', () => {
      const updated = reducer({ past: [ {}, entry ], future: [] }, undoAction);
      expect(updated.present).toBe(entry);
    });

    it('removes the latest entry from the past array', () => {
      const updated = reducer({ past: [ entry, {} ], future: [] }, undoAction);
      expect(updated.past).toEqual([ entry ]);
    });

    it('adds the current present to the end of the future array', () => {
      const existing = { b: 234 };
      const updated = reducer({ past: [ {} ], present: entry, future: [ existing ] }, undoAction);
      expect(updated.future).toEqual([ existing, entry ]);
    });
  });

  describe('redo', () => {
    const redoAction = { type: 'REDO' };
    const entry = { a: 123 };

    it('sets the present to the latest future entry', () => {
      const updated = reducer({ past: [ {} ], future: [ {}, entry] }, redoAction);
      expect(updated.present).toBe(entry);
    });

    it('removes the latest entry from the future array', () => {
      const updated = reducer({ past: [ ], future: [ entry, {} ] }, redoAction);
      expect(updated.future).toEqual([ entry ]);
    });

    it('adds the current present to the end of the past array', () => {
      const existing = { b: 234 };
      const updated = reducer({ past: [ existing ], present: entry, future: [ {} ] }, redoAction);
      expect(updated.past).toEqual([ existing, entry ]);
    });
  });

  describe('all other actions', () => {
    const otherAction = { type: 'OTHER' };
    const present = { a: 123, nextInstructionId: 0 };
    const future = { b: 234, nextInstructionId: 1 };
    const past = { a: 123 };

    beforeEach(() => {
      wrappedReducerSpy.mockReturnValue(future);
    });

    it('forwards action to the inner reducer', () => {
      reducer({ present, past: [] }, otherAction);
      expect(wrappedReducerSpy).toHaveBeenCalledWith(present, otherAction);
    });

    it('sets present to the result of the inner reducer', () => {
      const result = reducer({ present, past: [] }, otherAction);
      expect(result.present).toEqual(future);
    });

    it('resets the future to nothing', () => {
      const result = reducer({ future: [ future ], present, past: [] }, otherAction);
      expect(result.future).toEqual([]);
    });

    it('adds the current present to the end of the past array', () => {
      const result = reducer({ past: [ past ], present }, otherAction);
      expect(result.past).toEqual([ past, present ]);
    });

    describe('nextInstructionId does not increment', () => {
      beforeEach(() => {
        wrappedReducerSpy.mockReturnValue({ nextInstructionId: 0 });
      });

      it('does not modify the past', () => {
        const result = reducer({ past: [ past ], present }, otherAction);
        expect(result.past).toEqual([ past ]);
      });

      it('does not modify the future', () => {
        const result = reducer({ present, future: [ future ] }, otherAction);
        expect(result.future).toEqual([ future ]);
      });
    });
  });
});

