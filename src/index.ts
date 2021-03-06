const behaviors: Behavior[] = []
let behaviorsToAdd: Behavior[] = []
let behaviorsToRemove: Behavior[] = []
let _logging = true

enum BehaviorType {
  ONCE = 'once',
  EVERY = 'every',
  FOREVER = 'forever',
}

export type onceCallback = () => void
export type foreverCallback = (updates: number, deltaTime: number) => void
export type everyCallback = (
  updates: number,
  deltaTime: number,
) => (() => void) | undefined

export type Behavior = {
  id: string | null
  labels: readonly string[]
  counter: number
  readonly callback: onceCallback | foreverCallback | everyCallback
  readonly type: BehaviorType
  readonly delay?: number
  readonly interval?: number
  readonly duration?: number
}

// TODO: Test that logging actually works
const log = (text: string) => {
  if (_logging) {
    console.warn(text)
  }
}

export type Options = {
  readonly logging: boolean
}

/**
 * Configure level1
 */
export const init = (options: Options): void => {
  if (!options) {
    throw new Error('level1: The first argument to init is an options object')
  }

  const { logging = true } = options

  _logging = logging
}

/**
 * Needs to be called on every game update.
 */
export const update = (deltaTime: number): void => {
  behaviorsToAdd.forEach((behaviorToAdd: Readonly<Behavior>) => {
    behaviors.push(behaviorToAdd)
  })

  behaviorsToAdd = []

  behaviorsToRemove.forEach((behaviorToRemove: Readonly<Behavior>) => {
    // * Mutate original array for performance reasons
    const indexToRemove = behaviors.indexOf(behaviorToRemove)
    if (indexToRemove >= 0) {
      behaviors.splice(indexToRemove, 1)
    }
  })

  behaviorsToRemove = []

  behaviors.forEach((behavior) => {
    behavior.counter += 1
    if (behavior.type === BehaviorType.ONCE) {
      if (behavior.counter === behavior.delay) {
        // @ts-expect-error
        behavior.callback()
        behaviorsToRemove.push(behavior)
      }
    } else if (behavior.type === BehaviorType.FOREVER) {
      // @ts-expect-error
      if (behavior.counter % behavior.interval === 0) {
        behavior.callback(behavior.counter, deltaTime)
      }
    } else if (behavior.type === BehaviorType.EVERY) {
      const onDone = behavior.callback(behavior.counter, deltaTime)
      if (behavior.counter === behavior.duration) {
        if (onDone) {
          onDone()
        }

        remove(behavior)
      }
    }
  })
}

const commonBehaviorProperties = {
  id: null,
  labels: [],
  counter: 0,
}

/**
 * Call a function once after a delay.
 */
export const once = (callback: onceCallback, delay = 1): Behavior => {
  if (!callback) {
    throw new Error('The fist argument to l1.once needs to be a function')
  }

  const behavior = {
    callback,
    delay,
    type: BehaviorType.ONCE,
    ...commonBehaviorProperties,
  }
  behaviorsToAdd.push(behavior)

  return behavior
}

/**
 * Call a function forever, each interval game update
 */
export const forever = (callback: foreverCallback, interval = 1): Behavior => {
  if (!callback) {
    throw new Error('The fist argument to l1.forever needs to be a function')
  }

  const behavior = {
    callback,
    interval,
    type: BehaviorType.FOREVER,
    ...commonBehaviorProperties,
  }
  behaviorsToAdd.push(behavior)

  return behavior
}

/**
 * Call a function `every` update until duration is reached
 */
export const every = (callback: everyCallback, duration: number): Behavior => {
  if (!callback || !duration) {
    throw new Error(
      'The fist argument to l1.every needs to be a function. The second one a duration',
    )
  }

  const behavior = {
    callback,
    duration,
    type: BehaviorType.EVERY,
    ...commonBehaviorProperties,
  }
  behaviorsToAdd.push(behavior)

  return behavior
}

/**
 * Resolves a promise after a delay
 */
export const delay = (delay = 1): Promise<void> =>
  new Promise((resolve) => {
    once(() => {
      resolve()
    }, delay)
  })

type sequence<T> = (
  callback: (item: T) => void,
  interval: number,
  list: readonly T[],
) => Promise<void>

/**
 * Apply a callback to an item in a list every interval updates.
 */
export const sequence = <T>(
  callback: (item: T) => void,
  interval: number,
  list: readonly T[],
): Promise<void> => {
  // eslint-disable-next-line unicorn/no-reduce
  return list.reduce(
    (p: Readonly<Promise<void>>, item: T) =>
      p.then(() => {
        callback(item)
        return delay(interval)
      }),
    Promise.resolve(),
  )
}

/**
 * Remove a behavior
 */
export const remove = (behavior: string | Behavior): void => {
  let behaviorObject
  if (typeof behavior === 'string') {
    behaviorObject = get(behavior)
  } else {
    behaviorObject = behavior
  }

  if (behaviorObject) {
    behaviorsToRemove.push(behaviorObject)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    log(`level1: Tried to remove non-existent behavior: ${behavior}`)
  }
}

/**
 * Get a behavior by id
 */
export const get = (id: string) =>
  behaviors.find((behavior: Readonly<Behavior>) => behavior.id === id)

/**
 * Get all behaviors
 */
export const getAll = (): Behavior[] => behaviors

/**
 * Get a behavior by label
 */
export const getByLabel = (label: string) =>
  behaviors.filter((behavior: Readonly<Behavior>) =>
    behavior.labels.includes(label),
  )
