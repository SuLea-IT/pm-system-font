// util/localStorage.js

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

/**
 * 从localStorage获取数据
 * @param {string} key - 要获取的键名
 * @returns {any} - 存储的数据，若数据不存在或解析失败则返回null
 */
export function getLocalStorageItem(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error("Error retrieving from localStorage", error);
        return null;
    }
}
