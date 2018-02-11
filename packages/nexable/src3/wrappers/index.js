import getStateFactory from './state'
import getComputedFactory from './computed'
import getStepperFactory from './stepper'
import getArrayFactory from './array'
import StateArray from '../array/state'
import ComputedArray from '../array/computed'

export default class Wrapper {
    constructor(tracker) {
        this.tracker = tracker;

        this.once = function (fn, store, id) {
            if (!store) return tracker.middle(fn).evaluate();
            return (store[id] || (store[id] =
                    tracker.middle(fn, { onDisconnected: function () { delete store[id]; } }))
            ).evaluate();
        };

        this.state = getStateFactory(this);
        this.computed = getComputedFactory(this);
        this.stepper = getStepperFactory(this);

        this.array = getArrayFactory(this, StateArray);
        this.computedArray = getArrayFactory(this, ComputedArray);

        let dummyCounter = this.state(0);
        this.repeatLater = function () {
            dummyCounter(dummyCounter() + 1);
        };

        this.now = this.computed(() => (this.repeatLater(), Date.now()));
    }
}
