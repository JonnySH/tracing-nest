import { trace } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/node';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

export class NestTracing {
  tracer: any;
  constructor(
    serviceName,
    pkg,
    exporterOption,
    plugins,
    exporter = 'jaeger',
    platform: 'express' | 'koa' = 'express',
  ) {
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
        enabled: !!plugins ? (plugins.http === false ? false : true) : true, // http 插件默认开启，false时才不加载,
        path: '@opentelemetry/plugin-http',
      },
      https: {
        enabled: !!plugins ? (plugins.https === false ? false : true) : true, // https 插件默认开启，false时才不加载,
        path: '@opentelemetry/plugin-https',
      },
    };
    if (platform === 'express') {
      delete supportPlugins.koa;
    } else {
      delete supportPlugins.express;
    }

    const provider: NodeTracerProvider = new NodeTracerProvider({
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
      _exporter = new JaegerExporter(_options);
    } else {
      throw new Error('ExporterNotJaeger');
    }
    provider.addSpanProcessor(new SimpleSpanProcessor(_exporter));
    provider.register();
    this.tracer = trace.getTracer(pkg.name, pkg.version);
  }

  get instance() {
    if (!!this.tracer) {
      return this.tracer;
    } else {
      throw new Error('Tracer Not Instantiated');
    }
  }
  get currentTraceId() {
    if (!!this.tracer) {
      const currentSpan = this.tracer.getCurrentSpan();
      const { traceId } = currentSpan.context();
      return traceId;
    } else {
      throw new Error('Tracer Not Instantiated');
    }
  }
  get currentSpan() {
    if (!!this.tracer) {
      const currentSpan = this.tracer.getCurrentSpan();
      return currentSpan;
    } else {
      throw new Error('Tracer Not Instantiated');
    }
  }

  setAttribute(key, value) {
    if (!!this.tracer) {
      const currentSpan = this.tracer.getCurrentSpan();
      currentSpan.setAttribute(key, value);
    } else {
      throw new Error('Tracer Not Instantiated');
    }
  }

  /**
   * 设置当前链路节点的属性
   * value 的属性有： string | number | boolean | Array<null | undefined | string> | Array<null | undefined | number> | Array<null | undefined | boolean>
   * @param {Object} attributes
   */
  setAttributes(attributes) {
    if (!!this.tracer) {
      const currentSpan = this.tracer.getCurrentSpan();
      currentSpan.setAttributes(attributes);
    } else {
      throw new Error('Tracer Not Instantiated');
    }
  }

  /**
   * 设置当前链路节点的状态
   * @param {Number<0|1|2>} code 0成功 1不设置(默认) 2异常，具体参考 @opentelemetry/api/build/src/trace/status.d.ts
   * @param {String|undefined}message
   */
  setStatus(code, message = undefined) {
    if (!!this.tracer) {
      const currentSpan = this.tracer.getCurrentSpan();
      const status = { code, message };
      if (message === undefined) {
        delete status.message;
      }
      currentSpan.setStatus(status);
    } else {
      throw new Error('Tracer Not Instantiated');
    }
  }

  /**
   * 创建自定义的链路节点
   * @param {String} name 节点名称
   * @param {parent: Span,kind: Number<1|2|3|4>,...} options 一般需要 parent 和 kind. kind: 1=SERVER, 2=CLIENT, 3=PRODUCER, 4=CONSUMER,
   * @param context 这里不深入，请参考opentelemetry文档
   * @return {Span}
   */
  startSpan(name, options = undefined, context = undefined) {
    const _trace = this.tracer;
    if (_trace) {
      const span = _trace.startSpan(name, options, context);
      return span;
    } else {
      throw new Error('Tracer Not Instantiated');
    }
  }
}
