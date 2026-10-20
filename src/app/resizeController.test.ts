import { describe, expect, it, vi } from 'vitest';
import { ResizeController, type ResizeScheduler } from './resizeController';

/** Scheduler that records requested callbacks so tests can flush them manually. */
function manualScheduler() {
  const pending = new Map<number, () => void>();
  const cancelled: number[] = [];
  let nextId = 1;

  const scheduler: ResizeScheduler = {
    request(callback) {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    },
    cancel(handle) {
      const id = handle as number;
      cancelled.push(id);
      pending.delete(id);
    },
  };

  return {
    scheduler,
    cancelled,
    get pendingCount() {
      return pending.size;
    },
    flush() {
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback());
    },
  };
}

describe('ResizeController', () => {
  it('renders once for a single notification', () => {
    const render = vi.fn();
    const s = manualScheduler();
    const controller = new ResizeController(render, s.scheduler);

    controller.notify();
    expect(render).not.toHaveBeenCalled();

    s.flush();
    expect(render).toHaveBeenCalledTimes(1);
  });

  // Finding 4: the window resize listener and the ResizeObserver both called
  // resize(), so one window resize rendered twice. Coalescing is the fix.
  it('coalesces a burst of notifications into one render', () => {
    const render = vi.fn();
    const s = manualScheduler();
    const controller = new ResizeController(render, s.scheduler);

    controller.notify();
    controller.notify();
    controller.notify();
    expect(s.pendingCount).toBe(1);

    s.flush();
    expect(render).toHaveBeenCalledTimes(1);
    expect(controller.getRenderCount()).toBe(1);
  });

  it('renders again after the previous frame completed', () => {
    const render = vi.fn();
    const s = manualScheduler();
    const controller = new ResizeController(render, s.scheduler);

    controller.notify();
    s.flush();
    controller.notify();
    s.flush();

    expect(render).toHaveBeenCalledTimes(2);
  });

  it('renderNow bypasses scheduling and cancels a pending frame', () => {
    const render = vi.fn();
    const s = manualScheduler();
    const controller = new ResizeController(render, s.scheduler);

    controller.notify();
    controller.renderNow();

    expect(render).toHaveBeenCalledTimes(1);
    expect(s.cancelled).toHaveLength(1);
    expect(s.pendingCount).toBe(0);

    // The cancelled callback must not fire a second render.
    s.flush();
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('stops rendering after dispose', () => {
    const render = vi.fn();
    const s = manualScheduler();
    const controller = new ResizeController(render, s.scheduler);

    controller.notify();
    controller.dispose();
    s.flush();

    expect(render).not.toHaveBeenCalled();

    controller.notify();
    s.flush();
    expect(render).not.toHaveBeenCalled();
  });

  it('cancels a pending frame on dispose', () => {
    const render = vi.fn();
    const s = manualScheduler();
    const controller = new ResizeController(render, s.scheduler);

    controller.notify();
    controller.dispose();

    expect(s.cancelled).toHaveLength(1);
    expect(s.pendingCount).toBe(0);
  });
});
