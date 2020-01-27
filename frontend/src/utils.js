export const debounce = (func, timeout) => {
    let prevTimeout = null;
    return (...args) => {
        if (prevTimeout) {
            clearTimeout(prevTimeout);
        }
        prevTimeout = setTimeout(() => func(...args), timeout);
    };
};
