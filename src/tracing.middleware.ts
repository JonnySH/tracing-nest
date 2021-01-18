import { trace } from '@opentelemetry/api';
import { LogLevel } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import { BatchSpanProcessor } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
// 函数式中间件
/**
 * 仅开启了express的tracing
 * @param serviceName
 * @param pkg
 * @param jaegerOptions
 */
export function initTracing(serviceName, pkg, jaegerOptions) {
  const provider: NodeTracerProvider = new NodeTracerProvider({
    logLevel: LogLevel.INFO,
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

  provider.register();

  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new JaegerExporter(Object.assign({}, jaegerOptions, { serviceName })),
    ),
  );
  console.log('tracing initialized');
  return trace.getTracer(pkg.name, pkg.version);
}
