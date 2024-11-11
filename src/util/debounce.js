// util/debounce.js

/**
 * 防抖函数
 * @param {Function} func - 需要防抖处理的函数
 * @param {number} wait - 延迟时间（毫秒）
 * @returns {Function} - 防抖处理后的函数
 */
export function debounce(func, wait = 300) {
    let timeout;

    return function (...args) {
        const context = this;

        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// util/throttle.js
/**
 * 节流函数（严格版）
 * @param {Function} func - 需要节流处理的函数
 * @param {number} wait - 时间间隔（毫秒）
 * @returns {Function} - 节流处理后的函数
 */
export function throttle(func, wait = 1000) {
    let lastTime = 0;

    return function (...args) {
        const now = Date.now();
        if (now - lastTime >= wait) {
            lastTime = now;
            func.apply(this, args);
        }
    };
}
