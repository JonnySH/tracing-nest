"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTracing = void 0;
const api_1 = require("@opentelemetry/api");
const core_1 = require("@opentelemetry/core");
const node_1 = require("@opentelemetry/node");
const tracing_1 = require("@opentelemetry/tracing");
const exporter_jaeger_1 = require("@opentelemetry/exporter-jaeger");
function initTracing(serviceName, pkg, jaegerOptions) {
    const provider = new node_1.NodeTracerProvider({
        logLevel: core_1.LogLevel.INFO,
        plugins: {
            express: {
                enabled: true,
                path: '@opentelemetry/plugin-express',
            },
        },
    });
    provider.register();
    provider.addSpanProcessor(new tracing_1.BatchSpanProcessor(new exporter_jaeger_1.JaegerExporter(Object.assign({}, jaegerOptions, { serviceName }))));
    console.log('tracing initialized');
    return api_1.trace.getTracer(pkg.name, pkg.version);
}
exports.initTracing = initTracing;
//# sourceMappingURL=tracing.middleware.js.map