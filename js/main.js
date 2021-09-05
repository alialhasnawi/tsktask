import { x } from "./esrc.js";
import { TaskManager } from "./TaskManager.js";
import { check_storage } from "./Storage.js";
import { add_icon, clear_icon } from "./SVGs.js";

const manager = new TaskManager(x('main'));

const clock = x('div', { className: 'nav-clock', textContent: new Date().toLocaleTimeString('en-US').slice(0, 11).replace(/:\d\d(?!:)/, '').trim() });

window.setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString('en-US').slice(0, 11).replace(/:\d\d(?!:)/, '').trim();
}, 1000);

document.body.appendChild(x('header', [
    clock,
    x('div', { className: 'nav-add', events: { click: () => { manager.popup_edit_task() } } },
        add_icon),
    x('div', { className: 'nav-clear', events: { click: () => { manager.popup_empty_task() } } },
        clear_icon)

]));

document.body.appendChild(manager.e);

if (!check_storage()) manager.warn_message('This browser does not support storing tasks, functionality will be limited.')