# Simple Selectors
[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]

```
npm i simple-selectors --save
```

Simple "selectors" library, forked and heavily based on the original [reselect](https://github.com/rackt/reselect).

In brief:

* Selectors can compute derived data, allowing Redux to store the minimal possible state.
* Selectors are efficient. A selector is not recomputed unless one of its arguments change.
* Selectors are composable. They can be used as input to other selectors.

For more detailed information about the rationale behind selectors, please visit the reselect documentation. 

#### Differences from Reselect:

* A selector takes a maximum of two arguments, (state) or (state, props) - variadic args are not permitted.
* `createSelector` also covers `createStructuredSelector` when passed an object.
* `createSimpleSelector` creates a non-memoized selector for situations where memoization is not helpful
* Simplified memoization, only the equality operator can be configured via `memoizedSelectorCreator`
* Simpler internals for easier debugging

## API

- [`createSelector(...selectors, resultFunc)`](#createSelector)
- [`createSelector(object)`](#createSelectorStructured)
- [`createSimpleSelector(...)`](#createSimpleSelector)
- [`memoizedSelectorCreator(equalityCheck)(...)`](#memoizedSelectorCreator)

<div id="createSelector"></div>

### createSelector(...inputSelectors | [inputSelectors], resultFunc)
### createSelector(structuredSelector)

Takes one or more selectors, or an array of selectors, computes their values and passes them as arguments to `resultFn`.

`createSelector` determines if the value returned by an input-selector has changed between calls using reference equality (`===`). Inputs to selectors created with `createSelector` should be immutable.

Selectors created with `createSelector` have a cache size of 1. This means they always recalculate when the value of an input-selector changes, as a selector only stores the preceding value of each input-selector.

```js
const mySelector = createSelector(
  state => state.values.value1,
  state => state.values.value2,
  (value1, value2) => value1 + value2
)

// You can also pass an array of selectors
const totalSelector = createSelector(
  [
    state => state.values.value1,
    state => state.values.value2
  ],
  (value1, value2) => value1 + value2
)
```

It can be useful to access the props of a component from within a selector. When a selector is connected to a component with `connect`, the component props are passed as the second argument to the selector:

```js
const abSelector = (state, props) => state.a * props.b

// props only (ignoring state argument)
const cSelector =  (_, props) => props.c

// state only (props argument omitted as not required)
const dSelector = state => state.d

const totalSelector = createSelector(
  abSelector,
  cSelector,
  dSelector,
  (ab, c, d) => ({
    total: ab + c + d
  })
)

```

<div id="createSelectorStructured"></div>

#### Structured Selector:

`createSelector` may also take an object whose properties are input-selectors and returns a structured selector. This "structured selector" returns an object with the same keys as the `inputSelectors` argument, but with the selectors replaced with their values.

```js
const mySelectorA = state => state.a
const mySelectorB = state => state.b

const structuredSelector = createSelector({
  x: mySelectorA,
  y: mySelectorB
})

const result = structuredSelector({ a: 1, b: 2 }) // will produce { x: 1, y: 2 }
```

Structured selectors can be nested:

```js
const nestedSelector = createSelector({
  subA: createSelector({
    selectorA,
    selectorB
  }),
  subB: createSelector({
    selectorC,
    selectorD
  })
})

```

<div id="createSimpleSelector"></div>

### createSimpleSelector(...inputSelectors | [inputSelectors], resultFunc)
### createSimpleSelector(structuredSelector)

Same API as `createSelector`, however it does not perform any memoization on the selector.

<div id="memoizedSelectorCreator"></div>

### memoizedSelectorCreator(equalityCheck)

`memoizedSelectorCreator` can be used to make a customized version of `createSelector`.

The `equalityCheck` determines how equality is used when checking against previous values.

```js
import shallowEquals from 'shallow-equals'

function shallowish(maxDepth = 1) {
  return function eq(a, b, currentDepth = 0) {
    if (a === b) return true
    if (currentDepth >= maxDepth) return false
    if ((Array.isArray(a) && Array.isArray(b)) || (isPlainObject(a) && isPlainObject(b))) {
      return shallowEquals(a, b, (a, b) => eq(a, b, currentDepth + 1));
    }
    return false
  }
}

const customSelector = memoizedSelectorCreator(shallowish(2))

customSelector(selectorA, selectorB, (a, b) => a.concat(b))
```

## License

MIT

[build-badge]: https://img.shields.io/travis/tgriesser/simple-selectors/master.svg?style=flat-square
[build]: https://travis-ci.org/tgriesser/simple-selectors

[npm-badge]: https://img.shields.io/npm/v/simple-selectors.svg?style=flat-square
[npm]: https://www.npmjs.org/package/simple-selectors
