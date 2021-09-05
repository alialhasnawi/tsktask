/**
 * Create element with tag, class, props.
 * @param {String} tag Element tag.
 * @param {Object} props Props.
 * @param {HTMLElement[]} children Children.
 * @returns HTMLElement
 * Props:
 *      style: {attribute: value},
 *      events: {event: function},
 */
export function x(tag, props_or_children, children) {
    const e = document.createElement(tag);

    if (props_or_children) {
        if (Array.isArray(props_or_children)) { addAll(e, props_or_children) }
        else { p(e, props_or_children) }
    }

    addAll(e, children);

    return e;
}

/**
 * Apply props to an element.
 * @param {HTMLElement} element Element node.
 * @param {Object} props Props (including style).
 * Props:
 *      style: {attribute: value},
 *      events: {event: function},
 */
function p(element, props) {
    for (const k in props) {
        switch (k) {
            case 'style':
                const s = props[k];
                for (const j in s) {
                    if (!(j in element.style)) console.warn(`${j} is not a style property!`);
                    element.style[j] = s[j];
                }
                break;

            case 'events':
                for (const event in props[k]) {
                    element.addEventListener(event, props[k][event]);
                }
                break;

            default:
                if (!(k in element)) console.warn(`${k} is not a valid property of an element!`);
                element[k] = props[k];
        }
    }
}

/**
 * Add all children to element.
 * @param {HTMLElement} parent_node Parent node.
 * @param {HTMLElement[] | HTMLElement} children children.
 */
export function addAll(parent_node, children) {
    if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) parent_node.append(children[i]);
    } else if (children) {
        parent_node.append(children);
    }
}

/**
 * Clear all children in parent
 * @param {HTMLElement} parent_node parent
 */
export function clearAll(parent_node) {
    while (parent_node.firstElementChild) {
        parent_node.removeChild(parent_node.firstElementChild);
    }
}

/**
 * Return tag-free sanitized markup.
 * @param {String} html markup
 * @returns string
 */
export function wash(html) {
    return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 * Return node from template.
 * @returns ChildNode
 */
export function h(t, ...m) {
    let l = document.createElement('template');
    l.innerHTML = String.raw(t, ...m);
    return l.content.firstChild;
}

/**
 * An element abstractor built for polyfilled Web Componenets.
 */
export class El {
    e;

    /**
     * Create El element wrapper.
     * @param {HTMLElement} element Element node, default=undefined.
     */
    constructor(element = undefined) {
        this.e = element;
    }

    /**
     * Children of this element.
     * @returns HTMLElement[]
     */
    get children() {
        return this.e.children;
    }

    /**
     * Set the children of this element.
     * @param {HTMLElement[]} children children.
     */
    set children(children) {
        clearAll(this.e);
        addAll(this.e, children);
    }

    /**
     * Set additional props.
     * @param {Object} props_obj Props (including style).
     */
    set props(props_obj) {
        p(this.e, props_obj);
    }
}