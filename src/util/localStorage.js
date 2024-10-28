// util.js

/**
 * 保存数据到localStorage
 * @param {string} key - 要存储的键名
 * @param {any} value - 要存储的值
 */
export function setLocalStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Error saving to localStorage", error);
    }
}

/**
 * 从localStorage清除指定键的数据
 * @param {string} key - 要删除的键名
 */
export function clearLocalStorageItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Error clearing from localStorage", error);
    }
}
