export declare class NestTracing {
    tracer: any;
    constructor(serviceName: any, pkg: any, exporterOption: any, plugins: any, exporter?: string, platform?: 'express' | 'koa');
    get instance(): any;
    get currentTraceId(): any;
    get currentSpan(): any;
    setAttribute(key: any, value: any): void;
    setAttributes(attributes: any): void;
    setStatus(code: any, message?: any): void;
    startSpan(name: any, options?: any, context?: any): any;
}
