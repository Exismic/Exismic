declare module 'potrace' {
  export interface TraceOptions {
    background?: string;
    color?: string;
    threshold?: number;
    turdSize?: number;
    alphaMax?: number;
    optTolerance?: number;
    optCurve?: boolean;
    turnPolicy?: string;
  }
  
  export function trace(
    buffer: Buffer,
    callback: (err: any, svg: string) => void
  ): void;
  
  export function trace(
    buffer: Buffer,
    options: TraceOptions,
    callback: (err: any, svg: string) => void
  ): void;
  
  export class Potrace {
    constructor(options?: TraceOptions);
    loadImage(buffer: Buffer, callback: (err: any) => void): void;
    getSVG(): string;
  }
}
