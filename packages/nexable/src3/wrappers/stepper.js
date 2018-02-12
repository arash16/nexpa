import { isUndefined, assert } from 'nxutils'


export default function getStepperFactory(wrapper) {
    return function (count, read) {
        let step = wrapper.state(0),
            awaits = wrapper.state(0);

        assert(count > 0, "Stepper Counter should be greater than zero.");

        let result = wrapper.computed(function () {
            if (awaits()) return step(), result.peek();
            else {
                let res = read.call(result, step.peek());

                // when step became zero, next eval won't execute
                // until some other dependency is changed
                if (step.peek() < count - 1)
                    step(step() + 1);

                else step(0);

                return isUndefined(res) && awaits.peek() ? result.peek() : res;
            }
        });

        result.async = function () {
            awaits(awaits.peek() + 1);
            let done;
            return function () {
                if (!done) {
                    done = true;
                    awaits(awaits.peek() - 1);
                }
            };
        };

        return result;
    };
}
