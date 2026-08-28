declare module 'lenis' {
  export interface LenisOptions {
    wrapper?: HTMLElement | Window;
    content?: HTMLElement;
    eventsTarget?: HTMLElement | Window;
    smoothWheel?: boolean;
    syncTouch?: boolean;
    syncTouchLerp?: number;
    touchInertiaMultiplier?: number;
    duration?: number;
    easing?: (t: number) => number;
    lerp?: number;
    infinite?: boolean;
    orientation?: 'vertical' | 'horizontal';
    gestureOrientation?: 'vertical' | 'horizontal' | 'both';
    touchMultiplier?: number;
    wheelMultiplier?: number;
    autoResize?: boolean;
    prevent?: (node: Element) => boolean;
    virtualScroll?: any;
    [key: string]: any;
  }

  export default class Lenis {
    constructor(options?: LenisOptions);
    raf(time: number): void;
    start(): void;
    stop(): void;
    destroy(): void;
    scrollTo(target: any, options?: any): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
  }
}

declare module 'lenis/dist/lenis.css';
