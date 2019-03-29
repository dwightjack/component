import { DetachedComponent } from 'yuzu';
import { IState } from 'yuzu/types';

export interface IStoreOptions {
  name: string;
  debug: boolean;
  effects: { [key: string]: any };
}

export type StateChangeFn = (state: IState, prev?: IState) => void;

export default class Store extends DetachedComponent<IState, IStoreOptions> {
  public defaultOptions(): IStoreOptions {
    return {
      name: 'default',
      debug: true,
      effects: {},
    };
  }

  public dispatch = async (action: (...args: any[]) => any, ...args: any[]) => {
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
    this.logAction(`@@INIT`, this.state, null);
  }

  public logAction(
    msg: string,
    prev: IState,
    next: IState,
    args?: any[],
  ): void {
    if (this.options.debug && this.$$logger) {
      this.$$logger.log(msg, prev, next, args);
    }
  }

  public subscribe(fn: StateChangeFn): () => void {
    const listener = (state: IState): void => fn(state);
    this.on('change:*', listener);
    return () => this.unsubscribe(listener);
  }

  public unsubscribe(fn: StateChangeFn): void {
    this.off('change:*', fn);
  }
}

export const createStore = <S = IState>(
  initialState: S,
  options?: Partial<IStoreOptions>,
): Store => new Store(options).init(initialState);
