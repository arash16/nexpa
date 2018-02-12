import { isUndefined, isObject, assert } from 'nxutils'
import valEqual from '../utils/valEqual'

export default function getStateFactory(wrapper) {
    let tracker = wrapper.tracker;
    return function (value, handlers) {
        assert(isUndefined(handlers) || isObject(handlers), "Handlers should be a object.");

        let currentValue = value,
            writeHandlerInstalled = false,
            backingNode = tracker.leaf(value, handlers),
            readingNode = tracker.middle(read),
            disposed = false;

        function read() {
            updateBackingNode();
            return backingNode.evaluate();
        }

        function updateBackingNode() {
            if (tracker.isSignaling)
                writeHandlerInstalled = false;

            backingNode.update(currentValue);
        }

        function NxState(newValue) {
            if (!arguments.length)
                return readingNode.evaluate();

            assert(!disposed, "Cannot write to a disposed state.");
            if (!disposed && !valEqual(currentValue, newValue)) {
                currentValue = newValue;

                // less backingNode.update calls
                if (tracker.isSignaling) updateBackingNode();
                else if (!writeHandlerInstalled) {
                    writeHandlerInstalled = true;
                    tracker.beforeSignal(updateBackingNode);
                }
            }
        }

        NxState.isNexable = 'W';
        NxState.peek = () => currentValue;
        NxState.dispose = function () {
            assert(!disposed, "Already disposed.");
            if (!disposed)
                if (!writeHandlerInstalled)
                    backingNode.dispose();
                else
                    tracker.beforeSignal(() => backingNode.dispose());
            disposed = true;
        };
        return NxState;
    }
}
