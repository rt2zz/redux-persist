import createMemoryStorage from './utils/createMemoryStorage'
import createPersistoid from '../src/createPersistoid'
const memoryStorage = createMemoryStorage()

const config = {
  key: 'persist-reducer-test',
  version: 1,
  storage: memoryStorage,
  debug: true
}

let spy: jest.SpyInstance;
let clock: typeof jest;

beforeEach(() => {
    spy = jest.spyOn(memoryStorage, 'setItem')
    clock = jest.useFakeTimers()
});

afterEach(() => {
    spy.mockRestore()
    clock.useRealTimers()
});

test('it updates changed state', () => {
    const { update } = createPersistoid(config)
    update({ a: 1 })
    clock.runAllTimers()
    update({ a: 2 })
    clock.runAllTimers()
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, 'persist:persist-reducer-test', '{"a":"1"}');
    expect(spy).toHaveBeenNthCalledWith(2, 'persist:persist-reducer-test', '{"a":"2"}');
})

test('it does not update unchanged state', () => {
    const { update } = createPersistoid(config)
    update({ a: undefined, b: 1 })
    clock.runAllTimers()
    // This update should not cause a write.
    update({ a: undefined, b: 1 })
    clock.runAllTimers()
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('persist:persist-reducer-test', '{"b":"1"}');
})

test('it updates removed keys', () => {
    const { update } = createPersistoid(config)
    update({ a: undefined, b: 1 })
    clock.runAllTimers();
    update({ a: undefined, b: undefined })
    clock.runAllTimers();
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(1,'persist:persist-reducer-test', '{"b":"1"}')
    expect(spy).toHaveBeenNthCalledWith(2,'persist:persist-reducer-test', '{}')
})
