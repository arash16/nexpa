import getStateFactory from './state';
import getComputedFactory from './computed'
import getStepperFactory from './stepper';

export default class Wrapper {
    constructor(tracker) {
        this.state = getStateFactory(tracker);
        this.computed = getComputedFactory(tracker);
        this.stepper = getStepperFactory(this);

        this.once = function (fn, store, id) {
            if (!store) return tracker.middle(fn).evaluate();
            return (store[id] || (store[id] =
                    tracker.middle(fn, { onDisconnected: function () { delete store[id]; } }))
            ).evaluate();
        };

        let dummyCounter = this.state(0);
        this.repeatLater = function () {
            dummyCounter(dummyCounter() + 1);
        };

        this.now = this.computed(() => (this.repeatLater(), Date.now()));
    }
}
