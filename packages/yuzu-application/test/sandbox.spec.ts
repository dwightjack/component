import { Component } from 'yuzu';
import * as utils from 'yuzu-utils';
import { Sandbox, sandboxComponentOptions } from '../src/sandbox';
import * as context from '../src/context';

describe('`Sandbox`', () => {
  describe('constructor', () => {
    it('extends Component', () => {
      const inst = new Sandbox();
      expect(inst).toEqual(jasmine.any(Component));
    });

    it('assigns prop `id` to $id attribute', () => {
      const inst = new Sandbox({ id: 'demo' });
      expect(inst.$id).toBe('demo');
    });

    it('auto-generates an id if it is not passed in', () => {
      const inst = new Sandbox();
      expect(inst.$id).toMatch(/_sbx-[0-9]+/);
    });

    it('passes `options.root` to mount method and starts the sandbox', () => {
      const root = document.createElement('div');
      const inst = new Sandbox({ root });
      const spy = spyOn(inst, 'mount').and.callThrough();
      inst.start({ demo: true });
      expect(spy).toHaveBeenCalledWith(root);
    });

    it('sets a data-* attribute on the root element', () => {
      const root = document.createElement('div');
      const inst = new Sandbox({ id: 'demo' });
      inst.mount(root);
      expect(root.hasAttribute(Sandbox.SB_DATA_ATTR)).toBe(true);
    });

    it('creates an internal array to keep track of registered components', () => {
      const inst = new Sandbox();
      expect(inst.$registry).toEqual(jasmine.any(Array));
    });

    it('creates an internal map to keep track of component instances', () => {
      const inst = new Sandbox();
      expect(inst.$instances).toEqual(jasmine.any(Map));
    });

    it('calls register() for every passed-in component configuration', () => {
      class Child extends Component {
        public static root = 'demo';
      }
      const components = [Child];
      const spy = spyOn(Sandbox.prototype, 'register');
      new Sandbox({ components });
      expect(spy).toHaveBeenCalledWith({ component: Child, selector: 'demo' });
    });

    it('calls register() for every passed-in component configuration (with options)', () => {
      class Child extends Component {
        public static root = 'demo';
      }
      const components = [
        [Child, { selector: 'custom', prop: true }] as sandboxComponentOptions,
      ];
      const spy = spyOn(Sandbox.prototype, 'register');
      new Sandbox({ components });
      expect(spy).toHaveBeenCalledWith({
        component: Child,
        selector: 'custom',
        prop: true,
      });
    });

    it('falls back to the component selector if not defined in the options', () => {
      class Child extends Component {
        public static root = 'demo';
      }
      const components = [[Child, { prop: true }] as sandboxComponentOptions];
      const spy = spyOn(Sandbox.prototype, 'register');
      new Sandbox({ components });
      expect(spy).toHaveBeenCalledWith({
        component: Child,
        selector: 'demo',
        prop: true,
      });
    });
  });

  describe('.register()', () => {
    let inst: Sandbox;

    beforeEach(() => {
      inst = new Sandbox();
    });

    it('throws if "component" is not a Component constructor', () => {
      spyOn(Component, 'isComponent').and.returnValue(false);
      expect(() => {
        inst.register({ component: Component, selector: 'demo' });
      }).toThrowError(Error);
    });

    it('throws if "selector" is nor a string or a function', () => {
      expect(() => {
        inst.register({ component: Component, selector: null as any });
      }).toThrowError(Error);
    });

    it('DOES NOT throw if "selector" is a string or a function', () => {
      expect(() => {
        inst.register({ component: Component, selector: 'selector' });
        inst.register({ component: Component, selector: () => true });
      }).not.toThrowError(Error);
    });

    it('pushes the passed-in params to the internal registry', () => {
      const params = { component: Component, selector: 'demo' };
      inst.register(params);
      expect(inst.$registry[0]).toBe(params);
    });
  });
  describe('.resolveSelector()', () => {
    let inst: Sandbox;
    beforeEach(() => {
      inst = new Sandbox();
    });
    it('should call utils.evaluate on the passed-in selector', () => {
      const spy = spyOn(utils, 'evaluate').and.returnValue(false);
      const selector = 'selector';
      inst.resolveSelector(selector);
      expect(spy).toHaveBeenCalledWith(selector, inst);
    });
    it('should return utils.evaluate returned value', () => {
      const selector = 'selector';
      spyOn(utils, 'evaluate').and.returnValue(false);
      expect(inst.resolveSelector(selector)).toBe(false);
    });
    it('should call Sandbox#findNodes if the resolved selector is a string', () => {
      const selector = 'selector';
      const results: any[] = [];
      const spy = spyOn(inst, 'findNodes').and.returnValue(results);
      expect(inst.resolveSelector(selector)).toBe(results);
      expect(spy).toHaveBeenCalledWith(selector);
    });
  });
  describe('.start()', () => {
    let inst: Sandbox;
    let root: HTMLElement;
    const params = { component: Component, selector: 'demo' };
    beforeEach(() => {
      root = document.createElement('div');
      inst = new Sandbox();
      inst.$registry = [params];
    });

    it('should create an internal context', () => {
      const mock = context.createContext({});
      const spy = spyOn(mock, 'update');
      const ctx = {};
      (inst.options as any).context = mock;
      (inst.options as any).root = root;
      inst.start(ctx);
      expect(spy).toHaveBeenCalledWith(ctx);
      expect(inst.$ctx).toBe(mock);
    });

    it('sets a deprecation flag', () => {
      (inst.options as any).root = root;
      inst.start();
      expect((inst as any).$legacyStart).toBe(true);
    });

    it('starts the sandbox by running mount/setup/discover', () => {
      const spy = spyOn(inst, 'mount').and.callThrough();
      const spySetup = spyOn(inst, 'setup').and.callThrough();
      const spyDiscover = spyOn(inst, 'discover');
      (inst.options as any).root = root;
      inst.start({ demo: true });
      expect(spy).toHaveBeenCalledWith(root);
      expect(spySetup).toHaveBeenCalledWith();
      expect(spyDiscover).toHaveBeenCalledWith();
    });
  });

  describe('.setup()', () => {
    it('setups the context from the passed in "context" option and injects it into the sandbox instance', () => {
      const mock = {
        inject: jasmine.createSpy('inject'),
      } as any;
      const inst = new Sandbox({
        context: mock,
      });
      inst.setup();
      expect(inst.$ctx).toBe(mock);
      expect(mock.inject).toHaveBeenCalledWith(inst);
    });
  });

  describe('.discover()', () => {
    let inst: Sandbox;
    let root: HTMLElement;
    const params = { component: Component, selector: 'demo' };
    beforeEach(() => {
      root = document.createElement('div');
      inst = new Sandbox();
      inst.$el = root;
      inst.$el.setAttribute(Sandbox.SB_DATA_ATTR, '');
      inst.$registry = [params];
    });

    it('should emit a "beforeStart" event', () => {
      const spy = spyOn(inst, 'emit');
      inst.discover();
      expect(spy).toHaveBeenCalledWith('beforeStart');
    });

    it('should abort component initialization if it is already registered', () => {
      const spy = spyOn(inst.$instances, 'has').and.returnValue(true);
      const spyWarn = spyOn(console, 'warn');
      inst.discover();
      expect(spy).toHaveBeenCalledWith(params.selector);
      expect(spyWarn).toHaveBeenCalled();
      expect(inst.$instances.size).toBe(0);
    });

    it('should call Sandbox#resolveSelector', () => {
      const spy = spyOn(inst, 'resolveSelector').and.returnValue(false);
      inst.discover();
      expect(spy).toHaveBeenCalledWith(params.selector);
    });

    it('should NOT call Sandbox#createInstance if selector DOES NOT resolve to true', () => {
      spyOn(inst, 'resolveSelector').and.returnValue(false);
      const spy = spyOn(inst, 'createInstance');
      inst.discover();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should NOT call Sandbox#createInstance if selector DOES NOT resolve to an array', () => {
      spyOn(inst, 'resolveSelector').and.returnValue({} as any);
      const spy = spyOn(inst, 'createInstance');
      inst.discover();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should call Sandbox#createInstance once if selector resolves to true', () => {
      const child = new Component();
      const spy = spyOn(inst, 'createInstance').and.returnValue(
        Promise.resolve(child),
      );
      inst.$registry[0].selector = () => true;
      inst.discover();
      expect(spy.calls.count()).toBe(1);
    });

    it('should call Sandbox#createInstance for each matched element when the selector resolves to DOM elements', () => {
      const children = [
        document.createElement('div'),
        document.createElement('div'),
      ];

      children.forEach((el) => root.appendChild(el));

      spyOn(inst, 'resolveSelector').and.returnValue(children);
      const spy = spyOn(inst, 'createInstance').and.callThrough();
      inst.$registry[0].demo = true;
      inst.discover();
      expect(spy.calls.count()).toBe(2);
      const calls = spy.calls.allArgs();
      calls.forEach((args, i) => {
        expect(args).toEqual([Component, { demo: true }, children[i]]);
      });
    });

    it('skips if the element has "data-skip"', () => {
      const child = document.createElement('div');
      root.appendChild(child);
      child.setAttribute('data-skip', '');
      spyOn(inst, 'resolveSelector').and.returnValue([child]);
      const spy = spyOn(inst, 'createInstance').and.callThrough();
      inst.discover();
      expect(spy).not.toHaveBeenCalled();
    });

    it('skips if the element is not a child of the root sandbox', () => {
      const child = document.createElement('div');
      const spy = spyOn(inst, 'createInstance').and.callThrough();
      spyOn(inst, 'resolveSelector').and.returnValue([child]);
      inst.discover();
      expect(spy).not.toHaveBeenCalled();

      const mid = document.createElement('div');

      // child is nested inside another sandbox
      mid.setAttribute('data-sandbox', 'mid');
      mid.appendChild(child);
      root.appendChild(mid);
      expect(spy).not.toHaveBeenCalled();
    });

    it('skips if the element is inside a [data-skip] element', () => {
      const child = document.createElement('div');
      const spy = spyOn(inst, 'createInstance').and.callThrough();
      const mid = document.createElement('div');

      spyOn(inst, 'resolveSelector').and.returnValue([child]);

      // child is nested inside a [data-skip] element
      mid.setAttribute('data-skip', '');
      mid.appendChild(child);
      root.appendChild(mid);

      inst.discover();

      expect(spy).not.toHaveBeenCalled();
    });

    it('sets a record with component instances', (done) => {
      const child = document.createElement('div');
      root.appendChild(child);

      spyOn(inst, 'resolveSelector').and.returnValue([child]);
      const childInstance = new Component();
      spyOn(inst, 'createInstance').and.returnValue(
        Promise.resolve(childInstance),
      );
      const spy = spyOn(inst.$instances, 'set');
      inst.discover();

      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(params.selector, [childInstance]);
        done();
      }, 0);
    });

    it('emits a "start" event when instance creation has ended', (done) => {
      const spy = spyOn(inst, 'emit').and.callThrough();
      let runner: any;
      const promise: Promise<Component> = new Promise((resolve) => {
        runner = resolve.bind(null, new Component());
      });
      spyOn(inst, 'resolveSelector').and.returnValue(true);
      spyOn(inst, 'createInstance').and.returnValue(promise);
      inst.on('start', () => {
        expect(spy).toHaveBeenCalledWith('start');
        done();
      });
      inst.discover();
      expect(spy).not.toHaveBeenCalledWith('start');
      setTimeout(runner, 300);
    });
  });

  describe('mount', () => {
    it('executes setup/discover', () => {
      const inst = new Sandbox();
      const spySetup = spyOn(inst, 'setup');
      const spyDiscover = spyOn(inst, 'discover');
      inst.mount(document.createElement('div'));
      expect(spySetup).toHaveBeenCalled();
      expect(spyDiscover).toHaveBeenCalled();
    });

    it('does NOT execute setup/discover only if called from "start" (has "$legacyStart")', () => {
      const inst = new Sandbox();
      const spySetup = spyOn(inst, 'setup');
      const spyDiscover = spyOn(inst, 'discover');
      Object.defineProperty(inst, '$legacyStart', { value: true });
      inst.mount(document.createElement('div'));
      expect(spySetup).not.toHaveBeenCalled();
      expect(spyDiscover).not.toHaveBeenCalled();
    });
  });

  describe('.createInstance()', () => {
    let inst: Sandbox;
    let root: HTMLElement;
    let el: HTMLElement;

    beforeEach(() => {
      el = document.createElement('div');
      root = document.createElement('div');
      inst = new Sandbox({ root }).start();
    });

    it('initializes a child instance', () => {
      const spy = jasmine.createSpy('created');
      const options = {};
      class Child extends Component {
        public created(): void {
          spy(this, this.options);
        }
      }
      inst.createInstance(Child, options, el);
      expect(spy).toHaveBeenCalledWith(jasmine.any(Child), options);
    });

    it('sets the component as sandbox child ref', () => {
      const spy = spyOn(inst, 'setRef');
      const options = { demo: true };
      class Child extends Component<{}, { demo: boolean }> {}

      inst.createInstance(Child, options, el);

      expect(spy).toHaveBeenCalledWith({
        component: Child,
        el,
        id: jasmine.any(String) as any,
        ...options,
      });
    });

    it('returns a the setRef result', async () => {
      // const val = new Component();
      // spyOn(inst, 'setRef').and.returnValue(val);
      const ret = await inst.createInstance(Component, {}, el);
      expect(ret).toEqual(jasmine.any(Component));
    });

    it('extracts inline options and passes it to the constructor IF el parameter is defined', () => {
      const spy = jasmine.createSpy('created');
      const options = { demo: true };
      class Child extends Component {
        public constructor(opts: any) {
          super(opts);
          spy(opts);
        }
      }
      spyOn(utils, 'datasetParser').and.returnValue({
        inline: true,
      });
      inst.createInstance(Child, options, el);
      expect(spy).toHaveBeenCalledWith({ demo: true, inline: true });

      spy.calls.reset();
      inst.createInstance(Child, options);
      expect(spy).toHaveBeenCalledWith({ demo: true });
    });

    // it('injects the context', () => {
    //   class Child extends Component {}

    //   const spy = jasmine.createSpy('inject');

    //   inst.$context = context.createContext();
    //   inst.$context.inject = spy;

    //   inst.createInstance(Child, {}, el);
    //   expect(spy).toHaveBeenCalledWith(jasmine.any(Child));
    // });

    // it('mounts the instance', () => {
    //   class Child extends Component {}
    //   const spy = spyOn(Child.prototype, 'mount');

    //   inst.createInstance(Child, {}, el);
    //   expect(spy).toHaveBeenCalledWith(el);
    // });
  });

  describe('.stop()', () => {
    let inst: Sandbox;
    let spy: any;
    class Child extends Component {}
    class GrandChild extends Component {}

    beforeEach(() => {
      spy = jasmine
        .createSpy('destroy')
        .and.returnValue(Promise.resolve('ret'));
      Child.prototype.destroy = spy;
      GrandChild.prototype.destroy = spy;

      inst = new Sandbox({ root: document.createElement('div') });
      inst.$instances.set('.childSelector', [
        new Child().mount(document.createElement('div')),
      ]);
      inst.$instances.set('.grandChildSelector', [
        new GrandChild().mount(document.createElement('div')),
      ]);
    });
    it('returns a promise', () => {
      expect(inst.stop()).toEqual(jasmine.any(Promise));
    });
    // it('cycles stored instances and calls destroy on them', async () => {
    //   await inst.stop();
    //   expect(spy.calls.count()).toBe(2);
    // });
    it('calls beforeDestroy hook', async () => {
      const hookSpy = spyOn(inst, 'beforeDestroy');
      await inst.stop();
      expect(hookSpy).toHaveBeenCalled();
    });

    it('calls beforeDestroy hook', async () => {
      const hookSpy = spyOn(inst, 'beforeDestroy');
      await inst.stop();
      expect(hookSpy).toHaveBeenCalled();
    });

    it('calls `removeListeners` method', async () => {
      const removeSpy = spyOn(inst, 'removeListeners');
      await inst.stop();
      expect(removeSpy).toHaveBeenCalled();
    });

    it('calls destroyRefs and waits until the destroy promises are resolved', async () => {
      const destroySpy = spyOn(inst, 'destroyRefs');
      await inst.stop();
      expect(destroySpy).toHaveBeenCalled();
    });

    it('rejects if something goes wrong', () => {
      spy.and.throwError('MOCK');
      return inst.stop().catch((e) => {
        expect(e.message).toBe('MOCK');
      });
    });

    it('clears the instances register', async () => {
      await inst.stop();
      expect(inst.$instances.size).toBe(0);
    });

    it('sets the `$active` property to false', async () => {
      await inst.stop();
      expect(inst.$active).toBe(false);
    });

    it('calls "clear()"', async () => {
      const clearSpy = spyOn(inst, 'clear');
      await inst.stop();
      expect(clearSpy).toHaveBeenCalled();
    });

    it('emits  "beforeStop" asap', () => {
      const emitSpy = spyOn(inst, 'emit');
      inst.stop();
      expect(emitSpy).toHaveBeenCalledWith('beforeStop');
    });

    it('emits  "stop" after the process has ended', (done) => {
      const emitSpy = spyOn(inst, 'emit');
      inst.stop().then(() => {
        expect(emitSpy).toHaveBeenCalledWith('stop');
        done();
      });
      expect(emitSpy).not.toHaveBeenCalledWith('stop');
    });

    it('emits  "error" on error', async () => {
      const emitSpy = spyOn(inst, 'emit');
      const err = new Error('MOCK');
      spy.and.throwError(err);

      try {
        await inst.stop();
      } catch {
        expect(emitSpy).toHaveBeenCalledWith('error', err);
      }
    });
  });

  describe('.clear()', () => {
    let inst: Sandbox;

    beforeEach(() => {
      inst = new Sandbox({ root: document.createElement('div') });
      inst.$ctx = context.createContext({});
    });

    it('clears the context', () => {
      inst.clear();
      expect(inst.$ctx).toBeUndefined();
    });

    it('detaches events', () => {
      const spyEmit = spyOn(inst, 'off');
      inst.clear();
      ['beforeStart', 'start', 'beforeStop', 'stop'].forEach((event) => {
        expect(spyEmit).toHaveBeenCalledWith(event);
      });
    });
  });
});
