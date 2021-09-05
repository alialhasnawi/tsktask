import { El, x } from "./esrc.js";

/**
 * A DateInput component.
 */
export class DateInput extends El {
    /** @type HTMLElement */
    __hour;
    /** @type HTMLElement */
    __minute;

    /**
     * Create a new DateInput.
     * @param {Date} date default date, undefined=set to current time.
     */
    constructor(date = undefined) {
        super();

        const now = date || new Date();

        this.__hour = x('input', {
            className: 'date-hour', type: 'text',
            value: now.getHours(), size: '2',
            pattern: '[0-9]*', placeholder: 'hh',
            maxLength: 2
        });
        this.__minute = x('input', {
            className: 'date-minute', type: 'text',
            value: now.getMinutes(), size: '2',
            pattern: '[0-9]*', placeholder: 'mm',
            maxLength: 2
        });

        if (this.__hour.value.length == 1)
            this.__hour.value = '0' + this.__hour.value;
        if (this.__minute.value.length == 1)
            this.__minute.value = '0' + this.__minute.value;

        this.e = x('div', { className: 'dateinput-selector', events: { input: () => { this.validate_date() } } },
            [this.__hour, x('div', { className: 'dateinput-spacer', textContent: ':' }), this.__minute]);
    }

    /**
     * Fix invalid dates.
     */
    validate_date() {
        this.__hour.value = this.__hour.value.replace(/\D/g, '');
        this.__minute.value = this.__minute.value.replace(/\D/g, '');
    }

    /**
     * Return the date object from this selector.
     * @returns Date
     */
    get_date() {
        const d = new Date();
        d.setHours(this.__hour.value || 0);
        d.setMinutes(this.__minute.value || 0);
        return d;
    }
}


/**
 * A Duration component.
 */
export class DurationInput extends El {
    __duration;

    /**
     * Create a new DurationInput.
     * @param {Date} date default date, undefined=set to current time.
     */
    constructor(date = undefined) {
        super();

        const now = date || new Date(600000);

        this.__duration = x('input', {
            className: 'date-duration', type: 'text',
            value: Math.floor(now.getTime() / 60000), size: '4',
            pattern: '[0-9]*', placeholder: 'mm'
        });

        this.e = x('div', {
            className: 'durationinput-selector',
            events: { input: () => { this.validate_date() } }
        }, this.__duration);
    }

    /**
     * Fix invalid dates.
     */
    validate_date() {
        this.__duration.value = this.__duration.value.replace(/\D/g, '');
    }

    /**
     * Return the date object from this selector.
     * @returns Date
     */
    get_date() {
        return new Date(this.__duration.value * 60000);
    }
}