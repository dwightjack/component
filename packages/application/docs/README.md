# @yuzu/application

> Components management for [@yuzu/core](https://github.com/dwightjack/yuzu/tree/master/packages/core)

Yuzu Application exposes a set of modules aimed to simplify the instantiation of Yuzu components in the context of a page.

> **Available modules:**
>
> - [Context](packages/application/context.md)
> - [Sandbox](packages/application/sandbox.md)

<!-- TOC depthTo:3 -->

- [Installation](#installation)
  - [as NPM package](#as-npm-package)
  - [CDN delivered `<script>`](#cdn-delivered-script)
  - [ES2017 Syntax](#es2017-syntax)
- [Browser support](#browser-support)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

<!-- /TOC -->

## Installation

### as NPM package

```
npm install @yuzu/core @yuzu/application --save

# or

yarn add @yuzu/core @yuzu/application
```

### CDN delivered `<script>`

add the following script tags before your code

```html
<script src="https://unpkg.com/dush/dist/dush.umd.js"></script>
<script src="https://unpkg.com/@yuzu/core"></script>
<script src="https://unpkg.com/@yuzu/application"></script>
```

Yuzu application will be available in the global scope under `YZ.Application`.

### ES2017 Syntax

To provide maximum compatibility with every development environment, packages are transpiled to ES5. When used with a bundler like Webpack or rollup the module resolution system will automatically pick either the Commonjs or ESM version based on your configuration.

If you want to import the ES2017 version of a package you can do so by setting an alias on the bundler's configuration file:

#### Webpack

```diff
// webpack.config.js

module.exports = {
  // ...
+  resolve: {
+    alias: {
+      '@yuzu/application': '@yuzu/application/dist/index.next.js'
+    }
+  }
}
```

#### Rollup

Use [rollup-plugin-alias](https://github.com/rollup/rollup-plugin-alias)

```diff
// rollup.config.js
+ import path from 'path';
+ import alias from 'rollup-plugin-alias';

export default {
  input: './src/index.js',
  plugins: [
    // ...
+    alias({
+      '@yuzu/application': path.resolve(__dirname, 'node_modules/@yuzu/application/dist/index.next.js')
+    })
  ],
};
```

## Browser support

Yuzu works in all modern browsers. In order to make it work in browsers that don't support ES2015+ features (like IE11) you need to include the `@yuzu/polyfills` package before any other `@yuzu/*` package.

If you're using a package bundler without any polyfill library like [babel-polyfill](https://babeljs.io/docs/en/babel-polyfill/) add this line at the very top of your entrypoint:

```js
import '@yuzu/polyfills';
```

## API Documentation

- [Sandbox](packages/application/api/sandbox.md)
- [Context](packages/application/api/context.md)

## Contributing

1.  Fork it or clone the repo
1.  Install dependencies `yarn install`
1.  Code your changes and write new tests in the `test` folder.
1.  Ensure everything is fine by running `yarn build`
1.  Push it or submit a pull request :D