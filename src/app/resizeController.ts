/**
 * Single owner of viewport-change rendering.
 *
 * Before this existed, `resize()` was wired to both a `ResizeObserver` on the
 * host and a `window` `resize` listener, so every window resize rendered twice
 * (T00-007 finding 4). A `ResizeObserver` on the full-viewport host already
 * fires for window resizes, so the window listener was redundant.
 *
 * The scheduling logic is kept DOM-light and injectable so it can be tested
 * without a browser.
 */

export interface ResizeScheduler {
  request(callback: () => void): void;
  cancel(handle: unknown): void;
}

/** Coalesces bursts of resize notifications into one render per frame. */
export class ResizeController {
  private handle: unknown = null;
  private disposed = false;
  private readonly onResize: () => void;
  private readonly scheduler: ResizeScheduler;
  private renderCount = 0;

  constructor(onResize: () => void, scheduler: ResizeScheduler) {
    this.onResize = onResize;
    this.scheduler = scheduler;
  }

  /**
   * Signals that the viewport may have changed. Repeated calls before the
   * scheduled callback runs collapse into a single render.
   */
  notify(): void {
    if (this.disposed || this.handle !== null) return;
    this.handle = this.scheduler.request(() => {
      this.handle = null;
      if (this.disposed) return;
      this.renderCount += 1;
      this.onResize();
    });
  }

  /** Renders immediately, bypassing scheduling (used for the first frame). */
  renderNow(): void {
    if (this.disposed) return;
    if (this.handle !== null) {
      this.scheduler.cancel(this.handle);
      this.handle = null;
    }
    this.renderCount += 1;
    this.onResize();
  }

  /** Number of renders actually performed; used by tests and diagnostics. */
  getRenderCount(): number {
    return this.renderCount;
  }

  dispose(): void {
    if (this.handle !== null) {
      this.scheduler.cancel(this.handle);
      this.handle = null;
    }
    this.disposed = true;
  }
}

/** Scheduler backed by requestAnimationFrame. */
export function animationFrameScheduler(): ResizeScheduler {
  return {
    request: (callback) => {
      if (typeof requestAnimationFrame === 'function') {
        return requestAnimationFrame(() => callback());
      }
      return setTimeout(callback, 0);
    },
    cancel: (handle) => {
      if (typeof cancelAnimationFrame === 'function' && typeof handle === 'number') {
        cancelAnimationFrame(handle);
        return;
      }
      clearTimeout(handle as ReturnType<typeof setTimeout>);
    },
  };
}
