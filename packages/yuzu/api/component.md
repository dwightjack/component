<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

# Component

**Extends Events**

`Component` is an extensible class constructor which provides the building block of Yuzu component system.

It inherits methods from [**Events**][1].

```js
const instance = new Component({ ... })
```

> **Lifecycle**
>
> | stage    | hooks     |
> | -------- | --------- |
> | `create` | `created` |

### Parameters

-   `options` **[object][2]** Instance options (optional, default `{}`)

## Properties

-   `$active` **[boolean][3]** `true` if the instance is mounted and initialized
-   `options` **[object][2]** Instance options (see [defaultOptions][4])
-   `state` **[object][2]** Instance state (see [setState][5])
-   `$el` **[Element][6]** The instance root DOM element (see [mount][7])
-   `$els` **[Object][2]&lt;[string][8], [Element][6]>** Object mapping references to component's child DOM elements (see `selectors` below)
-   `$refs` **{string: [Component][9]}** Object mapping references to child components (see [setRef][10])
-   `selectors` **[object][2]** Object mapping a child element's reference name and a CSS selector or custom function
-   `listeners` **[Object][2]&lt;[string][8], ([function][11] \| [string][8])>** Object mapping DOM listeners and handlers (see [setListener][12])
-   `actions` **[Object][2]&lt;[string][8], ([function][11] \| [string][8])>** Object mapping state keys and functions to executed on state update

Returns **[Component][9]** 

## defaultOptions

```js
this.defaultOptions()
```

Returns an object with default options.

### Parameters

-   `self` **[Component][9]** The component instance itself

Returns **[object][2]** 

## mount

```js
mount(el, [state])
```

Mounts a component instance on a DOM element and initializes it.

?> To prevent initialization and just mount the component set `state` to `null`.

> **Lifecycle**
>
> | stage   | hooks                                   |
> | ------- | --------------------------------------- |
> | `mount` | `beforeMount` <sup>(1)</sup>, `mounted` |

1.  Just after attaching the root element (`this.$el`) but before any listener and selector registration.

### Parameters

-   `el` **([string][8] \| [Element][6])** Component's root element
-   `state` **([object][2] | null)** Initial state (optional, default `{}`)

Returns **[Component][9]** 

## init

```js
init([state])
```

Initializes the component instance.

> **Lifecycle**
>
> | stage  | hooks                 |
> | ------ | --------------------- |
> | `init` | `initialize`, `ready` |

### Parameters

-   `state` **([object][2] | null)** Initial state (optional, default `{}`)

Returns **[Component][9]** 

## created

Lifecycle hook called on instance creation.

At this stage just the instance options (`this.options`) are initialized.

 Overwrite this method with custom logic in your components.

?> Use this hook to tap as early as possible into the component's properties. For example to set a dynamic initial state.

Returns **void** 

## beforeMount

Lifecycle hook called just before mounting the instance onto the root element.

At this stage the component is already attached to its root DOM element.

Overwrite this method with custom logic in your components.

Returns **void** 

## mounted

Lifecycle hook called when the instance gets mounted onto a DOM element.

At this stage both children elements (`this.$els.*`) and event listeners configured in `this.listeners` have been setup.

Overwrite this method with custom logic in your components.

?> Use this method when you need to work with the DOM or manage any side-effect that requires the component to be into the DOM.

Returns **void** 

## initialize

Lifecycle hook called before instance initialization.

At this stage the state and state listeners are not yet been initialized.

Overwrite this method with custom logic in your components.

?> Use this method to set child components by [setRef][10] and run any preparatory work on the instance.

Returns **void** 

## ready

Lifecycle hook called after instance initialization.

At this stage State and event binding are already in place.

Overwrite this method with custom logic in your components.

?> `ready` lifecycle can be delayed (_async ready_) by implementing a [`readyState`][13] method.

Returns **void** 

## beforeDestroy

Lifecycle hook called just before closing child refs.

This hook is called just before destroying the instance. Every property, listener and state feature is still active.

Overwrite this method with custom logic in your components.

!> This is an async method. Return a promise in order to suspend the destroy process.

Returns **void** 

## findNodes

Returns an array of elements matching a CSS selector in the context of the component's root element

### Parameters

-   `selector` **[string][8]** {string} CSS selector to match

Returns **[Array][14]&lt;[Element][6]>** 

## findNode

Returns the first element matching a CSS selector in the context of the component's root element

### Parameters

-   `selector` **[string][8]** {string} CSS selector to match

Returns **[Element][6]** 

## getState

```js
getState(key)
```

Returns a property of the state or a default value if the property is not set.

?> In ES6 environments you can use a [destructuring assignment][15] instead: `const { name = 'John'} = this.state`

### Parameters

-   `key` **[string][8]** Property to return
-   `def` **any** Default value

### Examples

```javascript
const instance = new Component().mount('#app', { a: 1 });
// instance.getState('a') === 1

// instance.getState('b', false) === false
```

Returns **any** 

## shouldUpdateState

```js
shouldUpdateState(string, currentValue, newValue)
```

Executes a strict inequality comparison (`!==`) on the passed-in values and returns the result.

!> This method is executed on every [`setState`][16] call.

You can overwrite this method with your own validation logic.

### Parameters

-   `_key` **any** 
-   `currentValue` **any** Value stored in the current state
-   `newValue` **any** New value
-   `key` **[string][8]** State property name

Returns **[boolean][3]** 

## setState

```js
setState(updater, [silent])
```

Updates the internal instance state by creating a shallow copy of the current state and updating the passed-in keys.

If the computed new state is different from the old one it emits a `change:<property>` event for every changed property
as well as a global `change:*` event.

If the new value argument is a function, it will be executed with the current state as argument.
The returned value will be used to update the state.

?> To prevent an instance from emitting `change:` events set the second argument to `true` (silent update).

### Parameters

-   `updater` **([object][2] \| [function][11])** Defines which part of the state must be updated
-   `silent` **[boolean][3]** Update the state without emitting change events (optional, default `false`)

### Examples

```javascript
instance.on('change:a', (next, prev) => console.log(next, prev));
instance.setState({ a: 1 }); //emits 'change:a' -> logs undefined,1

instance.setState({ a: 1 }); //nothing happens
instance.setState({ a: 2 }, true); //nothing happens, again...

// use the current state to calculate its next value
instance.setState(({ a }) => ({a + 1}));
```

Returns **void** 

## replaceState

```js
replaceState(newState, [silent])
```

Replaces the current state of the instance with a completely new state.

!> Note that this methods is un-affected by [`shouldUpdateState`][17].

### Parameters

-   `newState` **[object][2]** The new state object
-   `silent` **[boolean][3]** Replace the state without emitting change events (optional, default `false`)

### Examples

```javascript
instance.replaceState({ a: 1 });
// instance.state.a === 1
instance.replaceState({ b: 2 });
// instance.state.b === 2
// instance.state.a === undefined
```

Returns **void** 

## broadcast

```js
broadcast(event, [...params])
```

Emits a `broadcast:<eventname>` event on every child component listed in `$refs`.

### Parameters

-   `event` **[string][8]** Event name
-   `params` **[Array][14]&lt;any>?** Additional arguments to pass to the handler

### Examples

```javascript
const child = new Component('#child');
child.on('broadcast:log', (str) => console.log(str));

instance.setRef({ id: 'child', component: child });
instance.broadcast('log', 'test') // child component logs 'test'
```

Returns **void** 

## setListener

```js
setListener(string, handler)
```

Sets a DOM event listener.

The first argument must be a string composed by an event name (ie `click`) and a CSS selector (`.element`)
separated by a space.

If the CSS selector starts with `@` the listener will be attached to the
corresponding reference child element (`this.$els.<element>`), if any.

### Parameters

-   `def` **[string][8]** Event and target element definition. Format `eventName [target]`
-   `handler` **[function][11]** Event handler

### Examples

```javascript
// attach a click handler to a child element
instance.setListener('click .button', () => ...)

// attach a click handler to this.$els.btn
instance.setListener('click @btn', () => ...)

// attach a click handler to this.$el
instance.setListener('click', () => ...)
```

Returns **void** 

## removeListeners

```js
removeListeners()
```

Removes all DOM event listeners attached with `.setListener`.

Returns **void** 

## setRef

```js
setRef(config, [props])
```

Attaches a reference to a child component.

If a reference `id` is already attached, the previous one is destroyed and replaced with the new one.

?> This is an async method returning a promise.

### Parameters

-   `refCfg` **IRef&lt;(IComponentConstructable&lt;C> | C | function (el: any, state: Readonly&lt;S>): C)>** 
-   `props` **[object][2]?** Child component initial state
-   `config` **[object][2]** A child component configuration object
    -   `config.id` **[string][8]** Reference id. Will be used to set a reference to the child component onto `this.$refs`
    -   `config.component` **component** Component constructor or component instance
    -   `config.el` **([string][8] \| [HTMLElement][18])?** Child component root element. This property is ignored if `config.component` is a component instance or a detached component constructor
    -   `config.on` **[Object][2]?** Child component event listeners. Format `{ 'eventname': handler }`
    -   `config.null` **any** -   Any other property listed here will be passed to the constructor as option

### Examples

```javascript
const parent = new Component('#root');

class ChildComponent extends Component {}

// as constructor
parent.setRef({
  id: 'child',
  component: ChildComponent,
  el: '#child',
  // other options here...
});

// as instance
parent.setRef({
  id: 'child',
  component: new ChildComponent({ ... }).mount('#child', null) // <-- prevent component init
});

// sync parent - child state
// updates child `parentCount` state whenever `parent.state.count` changes
parent.setRef({
  id: 'child',
  component: ChildComponent,
  el: '#child',
  // other options here...
}, {
  parentCount: (parentState) => parentState.count
});
```

Returns **[Promise][19]** 

## destroyRef

Destroys and detaches a specific child component by its reference `id` (as set in `setRef`).

### Parameters

-   `id` **[string][8]** Child component reference id
-   `detach` **[boolean][3]** Remove the child component root element from the DOM (optional, default `false`)

Returns **[Promise][19]** 

## destroyRefs

Calls `.destroy()` on every child references and detaches them from the parent component.

!> This is an async method returning a promise

Returns **[Promise][19]** 

## destroy

```js
destroy()
```

Detaches DOM events, instance's events and destroys all references as well.

> **Lifecycle**
>
> | stage     | hooks           |
> | --------- | --------------- |
> | `destroy` | `beforeDestroy` |

!> This is an async method returning a promise

Returns **[Promise][19]** 

## &lt;static> YUZU_DATA_ATTR

```js
Component.YUZU_DATA_ATTR
```

Component root element attribute marker.

Returns **[object][2]** 

## &lt;static> YUZU_COMPONENT

Marks yuzu components

## &lt;static> isComponent

```js
Component.isComponent(obj)
```

Checks whether the passed-in value is a Component constructor.

### Parameters

-   `value` **any** 

Returns **[boolean][3]** 

[1]: /packages/yuzu-utils/api/events

[2]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[3]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[4]: #defaultOptions

[5]: #setState

[6]: https://developer.mozilla.org/docs/Web/API/Element

[7]: #mount

[8]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[9]: #component

[10]: #setRef

[11]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[12]: #setListener

[13]: packages/yuzu/#async-ready-state

[14]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[15]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

[16]: #setstate

[17]: #shouldupdatestate

[18]: https://developer.mozilla.org/docs/Web/HTML/Element

[19]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise