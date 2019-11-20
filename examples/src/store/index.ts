import { Sandbox } from 'yuzu-application';
import { List } from './list';
import { Counter } from './counter';
import { createStore } from './store';
import { connect } from './connect';
export { template } from './template';

interface IStoreState {
  items: number[];
}

const addItem = ({ items }: IStoreState): { items: number[] } => ({
  items: [...items, items.length],
});

const ConnectedList = connect<IStoreState>(
  ({ items }) => ({ items }),
  (dispatch) => ({
    onClick: () => dispatch(addItem),
  }),
)(List);

const ConnectedCounter = connect<IStoreState>(
  ({ items }) => ({ count: items.length }),
  null,
)(Counter);

// const context = createContext({ $store });

export function initialize(root: HTMLElement): () => Promise<void> {
  if (!root) {
    return () => Promise.resolve();
  }

  const $store = createStore<IStoreState>({
    items: [],
  });

  const sandbox = new Sandbox({
    root: '#app-connect',
    components: [
      [ConnectedList, { selector: '#list' }],
      [ConnectedCounter, { selector: '#num' }],
    ],
  });

  sandbox.start({ $store });

  return () => sandbox.stop();
}
