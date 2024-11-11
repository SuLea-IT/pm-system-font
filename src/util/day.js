import dayjs from 'dayjs';

/**
 * 格式化日期
 * @param {string} date - 日期字符串，通常是 ISO 格式
 * @param {string} format - 自定义的格式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} - 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    return dayjs(date).format(format);
};
