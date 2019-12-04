<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

# Events

Creates an event hub object.

This is a port to ES6 of the [dush][1] library.

## Examples

```javascript
import { Events } from 'yuzu-utils';

const events = new Events();

events.on('log', (msg) => console.log(msg))

events.emit('log', 'Hello world!') // logs 'Hello world!'
```

## \_allEvents

Type: {: [Array][2]&lt;listenerFn>}

## on

```js
this.on(event, handler [, once])
```

Adds an event handler for an event.

### Parameters

-   `name` **[string][3]** Event name to listen for, or `'*'` for all events
-   `handler` **[Function][4]** Function to call
-   `once` **[boolean][5]?** Make `handler` be called only once, the `.once` method use this internally

### Examples

```javascript
const emitter = new Events()

emitter
  .on('hi', (place) => {
    console.log(`hello ${place}!`) // => 'hello world!'
  })
  .on('hi', (place) => {
    console.log(`hi ${place}, yeah!`) // => 'hi world, yeah!'
  })

emitter.emit('hi', 'world')
```

Returns **[Event][6]** 

## once

```js
this.once(event, handler)
```

Like `.on` but calls the handler just once.

### Parameters

-   `name` **[string][3]** Event name to listen for, or `'*'` for all events
-   `handler` **[function][4]** Function to call

### Examples

```javascript
const emitter = new Events()
let called = 0

emitter.once('foo', () => {
  console.log('called only once')
  called++
})

emitter.emit('foo')
emitter.emit('foo')
emitter.emit('foo')

console.log(called) // => 1
```

Returns **[Events][7]** 

## off

```js
this.off([event [, handler]])
```

Removes an event listener for `name` event. If `handler` is not specified it will remove **all** listeners for that `name` event.
If `name` is not specified as well, it will then remove all registered event handlers.

### Parameters

-   `name` **[string][3]?** Event name
-   `handler` **[function][4]?** Handler to remove

### Examples

```javascript
const emitter = new Events()

const handler = () => {
  console.log('not called')
}

emitter.on('foo', handler)

// remove just an handler
emitter.off('foo', handler)

// remove all listeners for `foo`
emitter.off('foo')

// remove all listeners
emitter.off()
```

Returns **[Events][7]** 

## emit

```js
this.emit(event [, ...args])
```

Emits an event with optional parameters.
Will call every handler registered for the wildcard event `'*'` as well

### Parameters

-   `name` **[string][3]** The name of the event to invoke
-   `args` **...any** Any number of arguments of any type of value, passed to each listener

### Examples

```javascript
const emitter = new Events()

emitter.on('foo', (a, b, c) => {
  console.log(`${a}, ${b}, ${c}`) // => 1, 2, 3
})

emitter.on('*', (name, a, b, c) => {
  console.log(`event name is: ${name}`)
  console.log(`args are: ${a}, ${b}, ${c}`)
})

emitter.emit('foo', 1, 2, 3)
emitter.emit('bar', 555)
```

Returns **[Events][7]** 

[1]: https://github.com/tunnckoCoreLabs/dush

[2]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[3]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[4]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[5]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[6]: https://developer.mozilla.org/docs/Web/API/Event

[7]: #events