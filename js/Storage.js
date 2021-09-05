
/**
 * Return true if this browser supports local storage.
 * @returns Boolean
 */
export function check_storage() {
    try {
        const TEST = '__test__';
        localStorage.setItem(TEST, TEST);
        localStorage.removeItem(TEST);
        return true;
    } catch (e) {
        return false;
    }
}