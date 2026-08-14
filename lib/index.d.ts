import type { Context } from '@deepseek-ai/cordis';
export interface Config {
    roots?: string[];
    maxFiles?: number;
    maxBytesPerFile?: number;
}
export declare function apply(ctx: Context, config?: Config): void;
//# sourceMappingURL=index.d.ts.map