import { describe, expect, it, vi } from 'vitest';
import { ContextLiveness, describeContextLoss, detectWebGLSupport } from './rendererGuard';

/** Builds a fake canvas whose getContext returns the given contexts. */
function fakeCanvas(contexts: Record<string, unknown>) {
  const lose = vi.fn();
  const canvas = {
    getContext: (kind: string) => {
      const value = contexts[kind];
      if (value === undefined) return null;
      if (value === 'throw') throw new Error('context blocked');
      return value;
    },
  } as unknown as HTMLCanvasElement;
  return { canvas, lose };
}

const glStub = { getExtension: () => ({ loseContext: vi.fn() }) };

describe('detectWebGLSupport', () => {
  it('reports no failure when webgl2 is available', () => {
    const { canvas } = fakeCanvas({ webgl2: glStub });
    expect(detectWebGLSupport(() => canvas)).toBeNull();
  });

  it('accepts webgl1 as a fallback', () => {
    const { canvas } = fakeCanvas({ webgl: glStub });
    expect(detectWebGLSupport(() => canvas)).toBeNull();
  });

  // Finding 3: without this guard, an unsupported browser threw an uncaught
  // "Error creating WebGL context." and showed an unexplained blank shell.
  it('reports a friendly failure when neither context is available', () => {
    const { canvas } = fakeCanvas({});
    const failure = detectWebGLSupport(() => canvas);

    expect(failure?.kind).toBe('no-webgl');
    expect(failure?.message).toMatch(/does not support WebGL/i);
    expect(failure?.message).toMatch(/Chrome|Firefox/i);
  });

  it('treats a throwing getContext as unsupported rather than crashing', () => {
    const { canvas } = fakeCanvas({ webgl2: 'throw' });
    expect(detectWebGLSupport(() => canvas)?.kind).toBe('no-webgl');
  });

  it('treats a throwing canvas factory as unsupported rather than crashing', () => {
    const failure = detectWebGLSupport(() => {
      throw new Error('canvas blocked');
    });
    expect(failure?.kind).toBe('no-webgl');
    expect(failure?.message).toMatch(/blocked canvas creation/i);
  });

  it('releases the probe context so it does not linger', () => {
    const loseContext = vi.fn();
    const canvas = {
      getContext: () => ({ getExtension: () => ({ loseContext }) }),
    } as unknown as HTMLCanvasElement;

    detectWebGLSupport(() => canvas);
    expect(loseContext).toHaveBeenCalledTimes(1);
  });
});

describe('describeContextLoss', () => {
  it('includes a status message when the browser provides one', () => {
    expect(describeContextLoss({ statusMessage: 'GPU crashed' })).toMatch(/GPU crashed/);
  });

  it('degrades gracefully when there is no status message', () => {
    const message = describeContextLoss({});
    expect(message).toMatch(/lost its graphics context/i);
    expect(message).not.toMatch(/\(\)/);
  });

  it('ignores a whitespace-only status message', () => {
    expect(describeContextLoss({ statusMessage: '   ' })).not.toMatch(/\(/);
  });
});

describe('ContextLiveness', () => {
  it('renders while the context is live', () => {
    const liveness = new ContextLiveness();
    expect(liveness.isLost()).toBe(false);
    expect(liveness.shouldRender()).toBe(true);
  });

  it('stops rendering while the context is lost', () => {
    const liveness = new ContextLiveness();
    liveness.markLost();
    expect(liveness.isLost()).toBe(true);
    expect(liveness.shouldRender()).toBe(false);
  });

  it('resumes rendering and counts the restore', () => {
    const liveness = new ContextLiveness();
    liveness.markLost();
    liveness.markRestored();

    expect(liveness.shouldRender()).toBe(true);
    expect(liveness.getRestoreAttempts()).toBe(1);
  });

  it('counts repeated loss and restore cycles', () => {
    const liveness = new ContextLiveness();
    for (let i = 0; i < 3; i += 1) {
      liveness.markLost();
      liveness.markRestored();
    }
    expect(liveness.getRestoreAttempts()).toBe(3);
    expect(liveness.shouldRender()).toBe(true);
  });
});
