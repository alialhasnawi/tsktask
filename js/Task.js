import { El } from "./esrc.js";


/**
 * A Block interface for Tasks and Breaks. Does not directly create HTML.
 * Inherits the El element interface.
 */
export class Block extends El {
    __start_time;
    __duration;
    __previous;
    __next;
    __start_time_dom;
    __duration_dom;


    /**
     * Create a new block.
     * @param {Date} start_time Start time date object.
     * @param {Date} duration Duration date object (default 0).
     */
    constructor(start_time, duration = new Date(0)) {
        super();
        this.__start_time = start_time;
        this.__duration = duration;

        this.__previous;
        this.__next;
        this.__start_time_dom;
        this.__duration_dom;
    }

    /**
     * Return true if a task overlaps with another.
     * @param {Block} other Another task.
     */
    overlaps(other) {
        return (this.start_time <= other.end_time) && (this.end_time >= other.start_time);
    }

    /**
     * Start time parent node which holds the start time text node.
     * @param {HTMLElement} node Start time node.
     */
    set start_time_dom (node) {
        this.__start_time_dom = node;
    }

    /**
     * Duration parent node which holds the duration text node.
     * @param {HTMLElement} node Duration node.
     */
    set duration_dom (node) {
        this.__duration_dom = node;
    }

    /**
     * Set task's previous Block node.
     * @param {Block} previous_task Previous Block node.
     */
    set previous(previous_task) {
        this.__previous = previous_task;
    }

    /**
     * Previous Block node.
     */
    get previous() {
        return this.__previous;
    }

    /**
     * Set task's next Block node.
     * @param {Block} next_task Next Block node.
     */
    set next(next_task) {
        this.__next = next_task;
    }

    /**
     * Next Block node.
     */
    get next() {
        return this.__next;
    }

    /**
     * Set task's start time.
     * @param {Date} new_value
     */
    set start_time(new_value) {
        this.__start_time = new_value;
        this.__start_time_dom.textContent = this.start_time_string;
    }

    /**
     * Task's start time.
     */
    get start_time() {
        return this.__start_time;
    }

    /**
     * Set task's duration.
     * @param {Date} new_value
     */
    set duration(new_value) {
        this.__duration = new_value;
        this.__duration_dom.textContent = this.duration_string;
    }

    /**
     * Task's duration.
     */
    get duration() {
        return this.__duration;
    }

    /**
     * Set task's end time.
     * @param {Date} new_value
     */
    set end_time(new_value) {
        this.__duration = new Date(new_value.getTime() - this.__start_time.getTime());
        this.__duration_dom.textContent = this.duration_string;
    }

    /**
     * Task's end time.
     */
    get end_time() {
        return new Date(this.__start_time.getTime() + this.__duration.getTime());
    }

    /**
     * Task duration string. Prefer whole number days, hours, or minutes.
     */
    get duration_string() {
        const minutes = Math.floor(this.__duration.getTime() / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 1) {
            return `${days} d`;
        } else if (hours > 1) {
            return `${hours} h`;
        } else if (minutes > 0) {
            return `${minutes} m`;
        } else {
            return '--';
        }
    }

    /**
     * Task start time string as h?h:mm:ss PM/AM.
     */
    get start_time_string() {
        return this.__start_time.toLocaleTimeString('en-US').slice(0, 11).replace(/:\d\d(?!:)/, '').trim();
    }
}

/**
 * A Task for the TaskManager. Does not directly create HTML.
 * Inherits the El element interface.
 */
export class Task extends Block {
    __name;

    /**
     * Create a new task.
     * @param {String} name Name of the task.
     * @param {Date} start_time Start time in millisecond epoch time.
     * @param {Date} duration Millisecond duration of task.
     */
    constructor(name, start_time, duration = new Date(0)) {
        super(start_time, duration);
        this.__name = name;
    }

    /**
     * Set task's name.
     * @param {String} new_value
     */
    set name(new_value) {
        this.__name = new_value;
    }

    /**
     * Task's name.
     */
    get name() {
        return this.__name;
    }
}