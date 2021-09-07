import { Block, Task } from "./Task.js";
import { El, x } from "./esrc.js";
import { DateInput, DurationInput } from "./DateInput.js";
import { constant_icon, dynamic_icon, static_icon, task_icon, x_close_img } from "./SVGs.js";

const READ_WRITE_KEY = 'TSKTASK_TASK_STORAGE';

export class TaskManager extends El {
    /** @type {Task} */
    __first_task;


    /**
     * Create a new TaskManager container.
     * @param {HTMLElement} element Container root node.
     */
    constructor(element) {
        super(element);
        this.__first_task = undefined;
        this.read_storage();
    }

    /**
     * Add in a new Task. Trim the previous block if the times overlap.
     * Shift all the subsequent tasks down by the task's duration.
     * @param {String} name Name of the new task.
     * @param {Date} start_time Date object of starting time.
     * @param {Date} duration Date object of duration.
     */
    add(name, start_time, duration) {
        let curr_task = this.__first_task;
        const inserted_task = new Task(name, start_time, duration);
        this.dom_task(inserted_task);

        // Empty schedule.
        if (!curr_task) {
            this.__first_task = inserted_task;
            this.e.appendChild(inserted_task.e);
        } else {
            // DOM and list manipulations.
            if (start_time.getTime() < curr_task.start_time.getTime()) {
                this.__first_task = inserted_task;
                inserted_task.next = curr_task;
                curr_task.previous = inserted_task;
                curr_task.e.insertAdjacentElement('beforebegin', inserted_task.e);
            } else {
                // Navigate to next block.
                while (curr_task.next && curr_task.next.start_time.getTime() < start_time.getTime())
                    curr_task = curr_task.next;

                // Insert node.
                this.insert_between(curr_task, inserted_task);
                curr_task.e.insertAdjacentElement('afterend', inserted_task.e);

                // Trim block before.
                if (curr_task.end_time.getTime() >= start_time.getTime()) {
                    curr_task.end_time = start_time;
                }
            }

            // Shift blocks after.
            curr_task = inserted_task.next;

            if (curr_task && curr_task.start_time.getTime() < inserted_task.end_time.getTime()) {
                const delta = inserted_task.end_time.getTime() - curr_task.start_time.getTime();
                while (curr_task) {
                    curr_task.start_time = new Date(curr_task.start_time.getTime() + delta);
                    curr_task = curr_task.next;
                }
            }
        }

        this.write_storage();
    }

    /**
     * Delete a block, leaving a gap.
     * @param {Block} block block to be deleted.
     */
    remove_static(block) {
        this.pop(block);

        block.e.remove();
        this.write_storage();
    }

    /**
     * Delete a block, shifting all tasks afterwards up to either the start of the task or the current time.
     * @param {Block} block block to be deleted.
     */
    remove_constant_shift(block) {
        this.pop(block);
        const delta = block.end_time.getTime() - Math.max(block.start_time.getTime(), Date.now());

        if (delta > 0) {
            let curr_task = block.next;
            while (curr_task) {
                curr_task.start_time = new Date(curr_task.start_time.getTime() - delta);

                curr_task = curr_task.next;
            }
        }

        block.e.remove();
        this.write_storage();
    }

    /**
     * Delete a block, stretching all remaining tasks upwards.
     * @param {Block} block block to be deleted.
     */
    remove_dynamic_shift(block) {
        this.pop(block);

        // Start of tasks after the deleted task.
        const old_start = block.end_time.getTime();
        // Start of tasks after deletion event.
        const new_start = Math.max(block.start_time.getTime(), Date.now());

        let curr_task = block;
        while (curr_task.next) curr_task = curr_task.next;

        // End of task schedule.
        const old_end = curr_task.end_time.getTime();

        // Check for late completion.
        if (new_start < block.end_time.getTime()) {
            let curr_task = block.next;
            while (curr_task) {

                // Avoid multiple assignment logic error.
                let temp_end_time = curr_task.end_time.getTime();
                curr_task.start_time = this.t_lerp(old_start, old_end, new_start, curr_task.start_time.getTime());
                curr_task.end_time = this.t_lerp(old_start, old_end, new_start, temp_end_time);

                curr_task = curr_task.next;
            }
        }

        block.e.remove();
        this.write_storage();
    }

    /**
     * Show error message.
     * @param {String} msg Error message. 
     */
    warn_message(msg) {
        this.dom_overlay(x('div', { className: 'task-error', textContent: msg }));
    }

    /**
     * Open up the task edit/creation menu.
     * @param {Task} task task to be edited. Open up creation menu if task not provided.
     */
    popup_edit_task(task = undefined) {
        let last_task = this.__first_task;

        if (last_task)
            while (last_task.next) last_task = last_task.next;

        const in_date = new DateInput(task ? task.start_time : (last_task ? last_task.end_time : undefined));
        const in_duration = new DurationInput(task ? task.duration : undefined);
        const in_name = x('input', { className: 'textinput-selector task-create-centred', value: task ? task.name : '', placeholder: 'description', type: 'text' });
        const out_submit = x('div', {
            className: 'task-create-button task-create-centred', textContent: task ? 'Edit' : 'Add',
            events: {
                click: e => {
                    if (in_date.get_date())
                        if (task) this.remove_static(task);
                    this.add(in_name.value || '—', in_date.get_date(), in_duration.get_date());
                }
            }
        });

        this.dom_overlay(x('div', { className: 'task-create-wrapper' }, [
            x('div', { className: 'task-create-title task-create-centred', textContent: task ? 'Edit Task' : 'New Task' }),
            x('div', { className: 'task-create-label task-create-aligned', textContent: 'Starts at' },
                x('span', { className: 'task-create-small-label', textContent: '(24h time)' })),
            in_date.e,
            x('div', { className: 'task-create-label task-create-aligned', textContent: 'Lasts' },
                x('span', { className: 'task-create-small-label', textContent: '(minutes)' })),
            in_duration.e,
            in_name,
            out_submit
        ]), [out_submit]);
    }

    /**
     * Open up the task clear menu.
     * @param {Task} task task to be cleared.
     */
    popup_clear_task(task) {
        const _static = x('div', { className: 'task-close-wrapper', events: { click: () => { this.remove_static(task) } } },
            [
                x('div', { className: 'task-close-icon' }, static_icon),
                x('div', { className: 'task-close-text', textContent: 'Close and Leave Gap' })
            ]
        );
        const constant = x('div', { className: 'task-close-wrapper', events: { click: () => { this.remove_constant_shift(task) } } },
            [
                x('div', { className: 'task-close-icon' }, constant_icon),
                x('div', { className: 'task-close-text', textContent: 'Close the Gap' })
            ]
        );
        const dynamic = x('div', { className: 'task-close-wrapper', events: { click: () => { this.remove_dynamic_shift(task) } } },
            [
                x('div', { className: 'task-close-icon' }, dynamic_icon),
                x('div', { className: 'task-close-text', textContent: 'Close Proportionally' })
            ]
        );

        this.dom_overlay(
            x('div', { className: 'task-close-group' }, [
                _static, constant, dynamic
            ]),
            [_static, constant, dynamic]
        );
    }

    /**
     * Open up the task clear-all menu.
     */
    popup_empty_task() {
        const btn = x('div', { className: 'task-create-button task-clearall-button', events: { click: () => { this.clear_all() } }, textContent: 'Yes' });

        this.dom_overlay(
            x('div', { className: 'task-clearall-wrapper' }, [
                x('div', { className: 'task-clearall-text', textContent: 'Do you really want to delete all of the tasks?' }),
                btn
            ]),
            [btn]
        )
    }

    /**
     * Clear all tasks.
     */
    clear_all() {
        this.__first_task = undefined;
        this.children = undefined;
        this.write_storage();
    }

    /**
     * Generate the DOM for a task.
     * @param {Task} task 
     */
    dom_task(task) {
        // Terrible solution, but it works!
        const start_time_dom = x('div', { className: 'task-time-start', textContent: task.start_time_string });
        const duration_dom = x('div', { className: 'task-time-duration', textContent: task.duration_string });

        task.e = x('div', { className: 'task-task-wrapper', events: { click: e => { this.popup_edit_task(task); } } },
            [
                x('div', { className: 'task-details-wrapper' },
                    [
                        start_time_dom,
                        duration_dom,
                        x('div', { className: 'task-name', textContent: task.name })
                    ]),
                x('div', { className: 'task-button', events: { click: e => { e.stopPropagation(); this.popup_clear_task(task); } } }, task_icon())
            ]
        );

        task.start_time_dom = start_time_dom;
        task.duration_dom = duration_dom;
    }

    /**
     * Generate the DOM for an overlay.
     * @param {HTMLElement} inner_node Inner node html for the overlay.
     * @param {HTMLElement[]} closer_nodes Nodes which trigger closing of overlay, default=undefined.
     */
    dom_overlay(inner_node, closer_nodes = undefined) {
        const x_button = x_close_img;
        const overlay = x('div', { className: 'overlay-bg' },
            x('div', { className: 'overlay-wrapper' },
                [
                    x_button,
                    inner_node
                ])
        );

        x_button.onclick = e => { overlay.remove(); };

        // FIXME: buggable
        overlay.onclick = e => {
            if (e.target == overlay) overlay.remove();
        };

        if (closer_nodes)
            for (let i = 0; i < closer_nodes.length; i++)
                closer_nodes[i].addEventListener('click', e => { overlay.remove() });

        document.body.appendChild(overlay);
    }

    /**
     * Helper, Return a new interpolated date.
     * @param {Number} a the old starting time.
     * @param {Number} b the old ending time.
     * @param {Number} c the new starting time.
     * @param {Number} t the old time.
     * @returns {Date}
     */
    t_lerp(a, b, c, t) {
        return new Date(
            ((b - c) * t + (c - a) * b) / (b - a)
        );
    }

    /**
     * Insert a new block between 2.
     * @param {Block} start Start block.
     * @param {Block} insert Inserted block.
     * @param {Block} end End block, default=undefined.
     */
    insert_between(start, insert, end = undefined) {
        end = end || start.next;

        insert.previous = start;
        insert.next = end;

        start.next = insert;
        if (end) end.previous = insert;
    }

    /**
     * Remove and return the Block. Closes gaps in the list.
     * Reserves dangling previous and next pointers on popped item.
     * @param {Block} block Block to be removed.
     * @return {Block}
     */
    pop(block) {
        if (block == this.__first_task) {
            this.__first_task = block.next;
            return block;
        }

        block.previous.next = block.next;
        if (block.next) block.next.previous = block.previous;
        return block;
    }

    /**
     * Read the stored list of tasks (if it exists) and modify the 
     */
    read_storage() {
        let tasks = localStorage.getItem(READ_WRITE_KEY)

        if (tasks) {
            tasks = JSON.parse(tasks);
            for (let i = 0; i < tasks.length; i += 3) {
                this.add(tasks[i], new Date(tasks[i + 1]), new Date(tasks[i + 2]))
            }

        }
    }

    /**
     * Write the current list of tasks to local storage.
     */
    write_storage() {
        let curr_task = this.__first_task;
        const arr = [];

        while (curr_task) {
            arr.push(curr_task.name, curr_task.start_time.getTime(), curr_task.duration.getTime());
            curr_task = curr_task.next;
        }

        localStorage.setItem(READ_WRITE_KEY, JSON.stringify(arr));
    }
}