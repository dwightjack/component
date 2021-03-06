import { DetachedComponent } from 'yuzu';

export interface IStoreOptions {
  name: string;
  debug: boolean;
  effects: { [key: string]: any };
}

export type StateChangeFn<S> = (state: Readonly<S>) => void;

export type ActionFn<S> = (
  state: Readonly<S>,
  ...args: any[]
) => Partial<S> | null;

export default class Store<S = {}> extends DetachedComponent<S, IStoreOptions> {
  public defaultOptions(): IStoreOptions {
    return {
      name: 'default',
      debug: true,
      effects: {},
    };
  }

  public dispatch = async (
    action: ActionFn<S>,
    ...args: any[]
  ): Promise<void> => {
    const { state: oldState } = this;
    const state = await action(this.state, ...args);
    if (state) {
      this.setState(state);
    }
    this.logAction(`${action.name || ''}`, this.state, oldState, args);
  };

  public initialize(): void {
    if (this.options.debug && this.$$logStart) {
      this.$$logStart(this.options.name, false);
    }
    this.actions = this.options.effects;
  }

  public ready(): void {
    this.logAction(`@@INIT`, this.state);
  }

  public logAction(
    msg: string,
    prev: Readonly<S>,
    next?: Readonly<S>,
    args?: any[],
  ): void {
    if (this.options.debug && this.$$logger) {
      this.$$logger.log(msg, prev, next, args);
    }
  }

  public subscribe(fn: StateChangeFn<S>): () => void {
    const listener = (state: Readonly<S>): void => fn(state);
    this.on('change:*', listener);
    return () => {
      this.off('change:*', listener);
    };
  }
}

export const createStore = <S = {}>(
  initialState: Partial<S>,
  options?: Partial<IStoreOptions>,
): Store<S> => new Store<S>(options).init(initialState);
