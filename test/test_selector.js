import chai from 'chai'
import { createSelector, createSimpleSelector, memoizedSelectorCreator } from '../src/index'

const assert = chai.assert

suite('selector', () => {

  test('basic selector', () => {
    const selector = createSelector(
      state => state.a,
        a => a
    )
    assert.equal(selector({ a: 1 }), 1)
    assert.equal(selector({ a: 1 }), 1)
    assert.equal(selector({ a: 2 }), 2)
  })
  test('basic selector multiple keys', () => {
    const selector = createSelector(
      state => state.a,
      state => state.b,
      (a, b) => {
        return { val: a + b }
      }
    )
    const state1 = { a: 1, b: 2 }
    let obj = selector(state1)
    assert.equal(obj.val, 3)
    assert.equal(selector(state1), obj)
    const state2 = { a: 3, b: 2 }
    obj = selector(state2)
    assert.equal(obj.val, 5)
    assert.equal(selector(state2), obj)
  })
  test('basic simple selector, multiple keys', () => {
    const selector = createSimpleSelector(
      state => state.a,
      state => state.b,
      (a, b) => {
        return { val: a + b }
      }
    )
    const state1 = { a: 1, b: 2 }
    let obj = selector(state1)
    assert.equal(obj.val, 3)
    assert.notEqual(selector(state1), obj)
    const state2 = { a: 3, b: 2 }
    obj = selector(state2)
    assert.equal(obj.val, 5)
    assert.notEqual(selector(state2), obj)
  })
  test('basic selector invalid input selector', () => {
    assert.throw(() => createSelector(
      state => state.a,
        'not a function',
      (a, b) => a + b
    ), /input-selectors to be functions.*function, string/)
  })
  test('memoized composite arguments', () => {
    const selector = createSelector(
      state => state.sub,
        sub => sub
    )
    const state1 = {  sub: {  a: 1  }  }
    assert.deepEqual(selector(state1), {  a: 1  })
    assert.deepEqual(selector(state1), {  a: 1  })
    const state2 = {  sub: {  a: 2  }  }
    assert.deepEqual(selector(state2), {  a: 2  })
  })
  test('first argument can be an array', () => {
    const selector = createSelector(
      [ state => state.a, state => state.b ],
      (a, b) => {
        return { val: a + b }
      }
    )
    let obj = selector({ a: 1, b: 2 })
    assert.equal(obj.val, 3)
    assert.equal(selector({ a: 1, b: 2 }), obj)
    obj = selector({ a: 3, b: 2 })
    assert.equal(obj.val, 5)
    assert.equal(selector({ a: 3, b: 2 }), obj)
  })
  test('simple: first argument can be an array', () => {
    const selector = createSimpleSelector(
      [ state => state.a, state => state.b ],
      (a, b) => {
        return { val: a + b }
      }
    )
    let obj = selector({ a: 1, b: 2 })
    assert.equal(obj.val, 3)
    assert.notEqual(selector({ a: 1, b: 2 }), obj)
    obj = selector({ a: 3, b: 2 })
    assert.equal(obj.val, 5)
    assert.notEqual(selector({ a: 3, b: 2 }), obj)
  })
  test('can accept props', () => {
    const selector = createSelector(
      state => state.a,
      state => state.b,
      (state, props) => props.c,
      (a, b, c) => {
        return a + b + c
      }
    )
    assert.equal(selector({ a: 1, b: 2 }, { c: 100 }), 103)
  })
  test('can accept more than 3 selectors', () => {
    const selector = createSelector(
      state => state.a,
      state => state.b,
      (state, props) => props.c,
      (state, props) => props.d,
      (a, b, c, d) => {
        return a + b + c + d
      }
    )
    assert.equal(selector({ a: 1, b: 2 }, { c: 100, d: 200 }), 303)
  })
  test('checks both arity and presence of "arguments" keyword for fn purity', () => {
    const selector = createSelector(
      state => state.a,
      state => state.b,
      state => state.c,
      (state, props = {}) => props.d,
      (a, b, c, d) => {
        return a + b + c + d
      }
    )
    assert.equal(selector({ a: 1, b: 2, c: 3 }, { d: 4 }), 10)
  })
  test('chained selector', () => {
    const selector1 = createSelector(
      state => state.sub,
        sub => sub
    )
    const selector2 = createSelector(
      selector1,
      sub => ({ val: sub.value })
    )
    const state1 = { sub: {  value: 1 } }
    let obj = selector2(state1)
    assert.equal(obj.val, 1)
    assert.equal(selector2(state1), obj)
    const state2 = { sub: {  value: 2 } }
    obj = selector2(state2)
    assert.equal(obj.val, 2)
    assert.equal(selector2(state2), obj)
  })
  test('chained selector with props', () => {
    const selector1 = createSelector(
      state => state.sub,
      (state, props) => props.x,
        (sub, x) => ({ sub, x })
    )
    const selector2 = createSelector(
      selector1,
      (state, props) => props.y,
        (param, y) => ({ val: param.sub.value + param.x + y })
    )
    const state1 = { sub: {  value: 1 } }
    let obj = selector2(state1, { x: 100, y: 200 })
    assert.equal(obj.val, 301)
    assert.equal(selector2(state1, { x: 100, y: 200 }), obj)
    const state2 = { sub: {  value: 2 } }
    obj = selector2(state2, { x: 100, y: 201 })
    assert.equal(obj.val, 303)
    assert.equal(selector2(state2, { x: 100, y: 201 }), obj)
  })
  test('override valueEquals', () => {
    // a rather absurd equals operation we can verify in tests
    const createOverridenSelector = memoizedSelectorCreator(
      (a, b) => typeof a === typeof b
    )
    const selector = createOverridenSelector(
      state => state.a,
        a => a
    )
    assert.equal(selector({ a: 1 }), 1)
    assert.equal(selector({ a: 2 }), 1) // yes, really true
    assert.equal(selector({ a: 'A' }), 'A')
  })
  test('structured selector', () => {
    const selector = createSelector({
      x: state => state.a,
      y: state => state.b
    })
    const firstResult = selector({ a: 1, b: 2 })
    assert.deepEqual(firstResult, { x: 1, y: 2 })
    assert.strictEqual(selector({ a: 1, b: 2 }), firstResult)
    const secondResult = selector({ a: 2, b: 2 })
    assert.deepEqual(secondResult, { x: 2, y: 2 })
    assert.strictEqual(selector({ a: 2, b: 2 }), secondResult)
  })
  test('structured selector with invalid arguments', () => {
    assert.throw(() => createSelector({
      a: state => state.b,
      c: 'd'
    }), /input-selectors to be functions.*function, string/)
  })

})
