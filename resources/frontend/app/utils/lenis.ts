/**
 * SensoraNote Kinetic Smooth Scroll Engine (Lenis-compatible)
 * Pure, self-contained 60fps momentum scroll with easing, lerp, and modal prevention.
 */

export interface LenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal' | 'both';
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  infinite?: boolean;
  [key: string]: any;
}

export default class Lenis {
  private isStopped = false;
  private targetScroll = 0;
  private currentScroll = 0;
  private ease = 0.08;
  private rafId: number | null = null;
  private onWheelBound: (e: WheelEvent) => void;

  constructor(options: LenisOptions = {}) {
    // Map duration (e.g. 1.2s) to lerp factor
    const dur = options.duration || 1.2;
    this.ease = Math.min(0.2, Math.max(0.02, 1 / (dur * 14)));
    this.targetScroll = window.scrollY || document.documentElement.scrollTop || 0;
    this.currentScroll = this.targetScroll;

    this.onWheelBound = this.onWheel.bind(this);
    window.addEventListener('wheel', this.onWheelBound, { passive: false });
    this.startRaf();
  }

  private onWheel(e: WheelEvent) {
    if (this.isStopped) return;

    // Check if target is inside an element marked with data-lenis-prevent="true"
    let target = e.target as HTMLElement | null;
    while (target && target !== document.body && target !== document.documentElement) {
      if (target.getAttribute && target.getAttribute('data-lenis-prevent') === 'true') {
        return;
      }
      target = target.parentElement;
    }

    e.preventDefault();
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    this.targetScroll = Math.max(0, Math.min(maxScroll, this.targetScroll + e.deltaY * 0.9));
  }

  private startRaf() {
    const loop = () => {
      if (!this.isStopped) {
        const diff = this.targetScroll - this.currentScroll;
        if (Math.abs(diff) > 0.5) {
          this.currentScroll += diff * this.ease;
          window.scrollTo(0, this.currentScroll);
        } else if (Math.abs(diff) > 0) {
          this.currentScroll = this.targetScroll;
          window.scrollTo(0, this.currentScroll);
        }
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  public raf(_time?: number) {
    // compatibility method
  }

  public stop() {
    this.isStopped = true;
    this.targetScroll = window.scrollY;
    this.currentScroll = window.scrollY;
  }

  public start() {
    this.isStopped = false;
    this.targetScroll = window.scrollY;
    this.currentScroll = window.scrollY;
  }

  public scrollTo(target: number | string | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) {
    let top = 0;
    if (typeof target === 'number') {
      top = target;
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) top = el.getBoundingClientRect().top + window.scrollY;
    } else if (target instanceof HTMLElement) {
      top = target.getBoundingClientRect().top + window.scrollY;
    }

    if (options?.offset) top += options.offset;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    this.targetScroll = Math.max(0, Math.min(maxScroll, top));

    if (options?.immediate) {
      this.currentScroll = this.targetScroll;
      window.scrollTo(0, this.currentScroll);
    }
  }

  public destroy() {
    window.removeEventListener('wheel', this.onWheelBound);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
