"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestTracing = void 0;
const api_1 = require("@opentelemetry/api");
const node_1 = require("@opentelemetry/node");
const tracing_1 = require("@opentelemetry/tracing");
const exporter_jaeger_1 = require("@opentelemetry/exporter-jaeger");
class NestTracing {
    constructor(serviceName, pkg, exporterOption, plugins, exporter = 'jaeger', platform = 'express') {
        const supportPlugins = {
            koa: {
                enabled: true,
                path: '@opentelemetry/koa-instrumentation',
            },
            express: {
                enabled: true,
                path: '@opentelemetry/plugin-express',
            },
            http: {
                enabled: !!plugins ? (plugins.http === false ? false : true) : true,
                path: '@opentelemetry/plugin-http',
            },
            https: {
                enabled: !!plugins ? (plugins.https === false ? false : true) : true,
                path: '@opentelemetry/plugin-https',
            },
        };
        if (platform === 'express') {
            delete supportPlugins.koa;
        }
        else {
            delete supportPlugins.express;
        }
        const provider = new node_1.NodeTracerProvider({
            plugins: {
                express: {
                    enabled: true,
                    path: '@opentelemetry/plugin-express',
                },
                http: {
                    enabled: true,
                    path: '@opentelemetry/plugin-http',
                },
                https: {
                    enabled: true,
                    path: '@opentelemetry/plugin-https',
                },
            },
        });
        let _exporter;
        if (exporter === 'jaeger') {
            const _options = Object.assign({}, exporterOption);
            _options.serviceName = serviceName;
            _exporter = new exporter_jaeger_1.JaegerExporter(_options);
        }
        else {
            throw new Error('ExporterNotJaeger');
        }
        provider.addSpanProcessor(new tracing_1.SimpleSpanProcessor(_exporter));
        provider.register();
        this.tracer = api_1.trace.getTracer(pkg.name, pkg.version);
    }
    get instance() {
        if (!!this.tracer) {
            return this.tracer;
        }
        else {
            throw new Error('Tracer Not Instantiated');
        }
    }
    get currentTraceId() {
        if (!!this.tracer) {
            const currentSpan = this.tracer.getCurrentSpan();
            const { traceId } = currentSpan.context();
            return traceId;
        }
        else {
            throw new Error('Tracer Not Instantiated');
        }
    }
    get currentSpan() {
        if (!!this.tracer) {
            const currentSpan = this.tracer.getCurrentSpan();
            return currentSpan;
        }
        else {
            throw new Error('Tracer Not Instantiated');
        }
    }
    setAttribute(key, value) {
        if (!!this.tracer) {
            const currentSpan = this.tracer.getCurrentSpan();
            currentSpan.setAttribute(key, value);
        }
        else {
            throw new Error('Tracer Not Instantiated');
        }
    }
    setAttributes(attributes) {
        if (!!this.tracer) {
            const currentSpan = this.tracer.getCurrentSpan();
            currentSpan.setAttributes(attributes);
        }
        else {
            throw new Error('Tracer Not Instantiated');
        }
    }
    setStatus(code, message = undefined) {
        if (!!this.tracer) {
            const currentSpan = this.tracer.getCurrentSpan();
            const status = { code, message };
            if (message === undefined) {
                delete status.message;
            }
            currentSpan.setStatus(status);
        }
        else {
            throw new Error('Tracer Not Instantiated');
        }
    }
    startSpan(name, options = undefined, context = undefined) {
        const _trace = this.tracer;
        if (_trace) {
            const span = _trace.startSpan(name, options, context);
            return span;
        }
        else {
            throw new Error('Tracer Not Instantiated');
        }
    }
}
exports.NestTracing = NestTracing;
//# sourceMappingURL=tracing.middleware.js.map