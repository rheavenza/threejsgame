/**
 * Renderer startup checks and user-facing failure reporting.
 *
 * `docs/ARCHITECTURE.md` §2 puts bootstrap and error reporting in the
 * application shell, and §3 keeps that shell separate from scene content. The
 * pure decision logic lives here so it can be unit-tested without a real WebGL
 * context; the DOM-facing helper is a thin wrapper.
 */

/** Why the renderer could not start, in terms a player can act on. */
export type RendererFailureKind = 'no-webgl' | 'context-creation-failed';

export interface RendererFailure {
  kind: RendererFailureKind;
  message: string;
}

/**
 * Probes for a usable WebGL context in a throwaway canvas.
 *
 * Returns null when a context is available. This runs *before* constructing the
 * real renderer so an unsupported browser produces a calm message instead of an
 * uncaught `Error creating WebGL context.`
 */
/**
 * Probes for a usable WebGL **2** context in a throwaway canvas.
 *
 * Returns null when a context is available. This runs *before* constructing the
 * real renderer so an unsupported browser produces a calm message instead of an
 * uncaught `Error creating WebGL context.`
 *
 * WebGL 2 is required, not merely preferred: three.js 0.180.0's WebGLRenderer
 * requests the `'webgl2'` context name and has no WebGL 1 fallback. Accepting a
 * WebGL 1 context here would let a WebGL-1-only browser pass the preflight and
 * then fail during renderer construction, which reports the less accurate
 * `context-creation-failed` message.
 */
export function detectWebGLSupport(
  createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas'),
): RendererFailure | null {
  let canvas: HTMLCanvasElement;
  try {
    canvas = createCanvas();
  } catch {
    return {
      kind: 'no-webgl',
      message: 'This browser blocked canvas creation, so the valley cannot be drawn.',
    };
  }

  let context: RenderingContext | null = null;
  try {
    context = canvas.getContext('webgl2');
  } catch {
    context = null;
  }

  if (!context) {
    return {
      kind: 'no-webgl',
      message:
        'This scene needs WebGL 2, which this browser does not provide. ' +
        'Try a recent version of Chrome, Firefox, Edge, or Safari, and check that ' +
        'hardware acceleration is enabled.',
    };
  }

  // Release the probe context rather than leaving it alive for the page's life.
  const lose = (context as WebGLRenderingContext).getExtension('WEBGL_lose_context');
  lose?.loseContext();

  return null;
}

/**
 * True when an event means the GPU context went away for a reason we should
 * tell the player about, rather than a transient loss we can recover from.
 */
export function describeContextLoss(event: { statusMessage?: string }): string {
  const detail = event.statusMessage?.trim();
  return detail
    ? `The 3D view lost its graphics context (${detail}). It will try to restore automatically.`
    : 'The 3D view lost its graphics context. It will try to restore automatically.';
}

/**
 * Renders a failure message into the scene shell so the player sees an
 * explanation instead of a blank or partially drawn page.
 */
export function showRendererFailure(host: HTMLElement, failure: RendererFailure): void {
  host.dataset.rendererFailure = failure.kind;

  const existing = host.querySelector('.renderer-notice');
  if (existing) existing.remove();

  const notice = document.createElement('div');
  notice.className = 'renderer-notice';
  notice.setAttribute('role', 'alert');

  const title = document.createElement('p');
  title.className = 'renderer-notice__title';
  title.textContent = 'The valley could not be drawn';

  const body = document.createElement('p');
  body.className = 'renderer-notice__body';
  body.textContent = failure.message;

  notice.append(title, body);
  host.append(notice);
}

/** Removes a previously shown failure notice, e.g. after a successful restore. */
export function clearRendererFailure(host: HTMLElement): void {
  delete host.dataset.rendererFailure;
  host.querySelector('.renderer-notice')?.remove();
}

/**
 * Tracks whether the renderer is currently able to draw.
 *
 * Kept separate from the DOM so the transitions are unit-testable: the main
 * loop calls `shouldRender()` instead of assuming the context is always live.
 */
export class ContextLiveness {
  private lost = false;
  private restoreAttempts = 0;

  markLost(): void {
    this.lost = true;
  }

  markRestored(): void {
    this.lost = false;
    this.restoreAttempts += 1;
  }

  isLost(): boolean {
    return this.lost;
  }

  getRestoreAttempts(): number {
    return this.restoreAttempts;
  }

  shouldRender(): boolean {
    return !this.lost;
  }
}
