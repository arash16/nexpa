var activeNode = null;

import "./gc";
import "./link";
import "./unlink";

import "./node";
import "./isDirty";
import "./evaluate";
import "./update";


tracker.trNode = function (initial, read, dispose) {
    return new Node(initial, read, dispose);
};
