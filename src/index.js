const NOT_SET = {}

function defaultEq(a, b) {
  return a === b
}

function selectorAry1(f, a) {
  return (s, p) => f(a(s, p))
}
function pureSelectorAry1(f, a) {
  return s => f(a(s))
}
function selectorAry2(f, a, b) {
  return (s, p) => f(a(s, p), b(s, p))
}
function pureSelectorAry2(f, a, b) {
  return s => f(a(s), b(s))
}
function selectorAry3(f, a, b, c) {
  return (s, p) => f(a(s, p), b(s, p), c(s, p))
}
function pureSelectorAry3(f, a, b, c) {
  return s => f(a(s), b(s), c(s))
}
function selectorAryN(f, ...fns) {
  return (s, p) => f(...fns.map(r => r(s, p)))
}
function pureSelectorAryN(f, ...fns) {
  return s => f(...fns.map(r => r(s)))
}
function memoizedAry1(eq, f, a) {
  let lastResult, lastA; lastResult = NOT_SET
  return (s, p) => {
    const aVal = a(s, p)
    if (lastResult !== NOT_SET && eq(lastA, aVal)) {
      return lastResult
    }
    lastA = aVal
    return (lastResult = f(aVal))
  }
}
function pureMemoizedAry1(eq, f, a) {
  let lastResult, lastA; lastResult = NOT_SET
  return s => {
    const aVal = a(s)
    if (lastResult !== NOT_SET && eq(lastA, aVal)) {
      return lastResult
    }
    lastA = aVal
    return (lastResult = f(aVal))
  }
}
function memoizedAry2(eq, f, a, b) {
  let lastResult, lastB, lastA; lastResult = NOT_SET
  return (s, p) => {
    const aVal = a(s, p), bVal = b(s, p)
    if (lastResult !== NOT_SET && eq(lastA, aVal) && eq(lastB, bVal)) {
      return lastResult
    }
    lastA = aVal
    lastB = bVal
    return (lastResult = f(aVal, bVal))
  }
}
function pureMemoizedAry2(eq, f, a, b) {
  let lastResult, lastB, lastA; lastResult = NOT_SET
  return s => {
    const aVal = a(s), bVal = b(s)
    if (lastResult !== NOT_SET && eq(lastA, aVal) && eq(lastB, bVal)) {
      return lastResult
    }
    lastA = aVal
    lastB = bVal
    return (lastResult = f(aVal, bVal))
  }
}
function memoizedAry3(eq, f, a, b, c) {
  let lastResult, lastC, lastB, lastA; lastResult = NOT_SET
  return (s, p) => {
    const aVal = a(s, p), bVal = b(s, p), cVal = c(s, p)
    if (lastResult !== NOT_SET && eq(lastA, aVal) && eq(lastB, bVal) && eq(lastC, cVal)) {
      return lastResult
    }
    lastA = aVal
    lastB = bVal
    lastC = cVal
    return (lastResult = f(aVal, bVal, cVal))
  }
}
function pureMemoizedAry3(eq, f, a, b, c) {
  let lastResult, lastC, lastB, lastA; lastResult = NOT_SET
  return s => {
    const aVal = a(s), bVal = b(s), cVal = c(s)
    if (lastResult !== NOT_SET && eq(lastA, aVal) && eq(lastB, bVal) && eq(lastC, cVal)) {
      return lastResult
    }
    lastA = aVal
    lastB = bVal
    lastC = cVal
    return (lastResult = f(aVal, bVal, cVal))
  }
}
function memoizedAryN(eq, f, fns) {
  let lastResult, lastArgs; lastResult = NOT_SET
  return (s, p) => {
    const vals = fns.map(fn => fn(s, p))
    if (lastResult !== NOT_SET && vals.every((val, i) => eq(val, lastArgs[i]))) {
      return lastResult
    }
    lastArgs = vals
    return (lastResult = f(...vals))
  }
}
function pureMemoizedAryN(eq, f, fns) {
  let lastResult, lastArgs; lastResult = NOT_SET
  return s => {
    const vals = fns.map(fn => fn(s))
    if (lastResult !== NOT_SET && vals.every((val, i) => eq(val, lastArgs[i]))) {
      return lastResult
    }
    lastArgs = vals
    return (lastResult = f(...vals))
  }
}

/* Selector Dispatcher */

function makePureSelector(final, selectors) {
  switch (selectors.length) {
    case 1: return pureSelectorAry1(final, selectors[0])
    case 2: return pureSelectorAry2(final, selectors[0], selectors[1])
    case 3: return pureSelectorAry3(final, selectors[0], selectors[1], selectors[2])
    default: return pureSelectorAryN(final, selectors)
  }
}
function makeSelector(final, selectors) {
  switch (selectors.length) {
    case 1: return selectorAry1(final, selectors[0])
    case 2: return selectorAry2(final, selectors[0], selectors[1])
    case 3: return selectorAry3(final, selectors[0], selectors[1], selectors[2])
    default: return selectorAryN(final, selectors)
  }
}
function makePureMemoizedSelector(eq, final, selectors) {
  switch (selectors.length) {
    case 1: return pureMemoizedAry1(eq, final, selectors[0])
    case 2: return pureMemoizedAry2(eq, final, selectors[0], selectors[1])
    case 3: return pureMemoizedAry3(eq, final, selectors[0], selectors[1], selectors[2])
    default: return pureMemoizedAryN(eq, final, selectors)
  }
}
function makeMemoizedSelector(eq, final, selectors) {
  switch (selectors.length) {
    case 1: return memoizedAry1(eq, final, selectors[0])
    case 2: return memoizedAry2(eq, final, selectors[0], selectors[1])
    case 3: return memoizedAry3(eq, final, selectors[0], selectors[1], selectors[2])
    default: return memoizedAryN(eq, final, selectors)
  }
}

/* Exported API */

export function createSimpleSelector(...args) {
  if (isPlainObject(args[0])) return structured(createSimpleSelector, args[0])
  const selectors = getDependencies(args.slice(0, -1)), final = args[args.length - 1]
  return isPure(selectors) ? makePureSelector(final, selectors) : makeSelector(final, selectors)
}

export function memoizedSelectorCreator(eq) {
  return function createMemoizedSelector(...args) {
    if (isPlainObject(args[0])) return structured(memoizedSelectorCreator(eq),  args[0])
    const selectors = getDependencies(args.slice(0, -1)), final = args[args.length - 1]
    return isPure(selectors) ?
      makePureMemoizedSelector(eq, final, selectors) :
      makeMemoizedSelector(eq, final, selectors)
  }
}

export const createSelector = memoizedSelectorCreator(defaultEq)

/* Helpers */

function structured(selectorCreator, selectorObject) {
  const objectKeys = Object.keys(selectorObject)
  return selectorCreator(
    objectKeys.map(key => selectorObject[key]),
    (...values) => {
      const composition = {}
      for (let i = 0; i < values.length; i++) {
        composition[objectKeys[i]] = values[i]
      }
      return composition
    }
  )
}
function getDependencies(funcs) {
  if (Array.isArray(funcs[0])) {
    if (funcs.length > 1) {
      throw new Error(`Invalid selector signature`)
    }
    return getDependencies(funcs[0])
  }
  if (!funcs.every(dep => typeof dep === 'function')) {
    const dependencyTypes = funcs.map(
      dep => typeof dep
    ).join(', ')
    throw new Error(
      `Selector creators expect all input-selectors to be functions, ` +
      `instead received the following types: [${dependencyTypes}]`
    )
  }
  return funcs
}
function isPure(fns) {
  return fns.every(fn => fn.length === 1 && String(fn).indexOf('arguments') === -1)
}
function isPlainObject(o) {
  return typeof o == 'object' && o !== null && o.constructor === Object
}
