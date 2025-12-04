// 工具函数库
const Utils = {
    // 格式化时间显示（分:秒）
    formatTime: function(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 生成指定范围内的随机整数
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // 打乱数组顺序（Fisher-Yates洗牌算法）
    shuffleArray: function(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // 计算正确率百分比
    calculateAccuracy: function(correct, total) {
        if (total === 0) return 0;
        return ((correct / total) * 100).toFixed(1);
    },
    
    // 从localStorage安全获取数据
    getFromStorage: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return defaultValue;
        }
    },
    
    // 安全存储数据到localStorage
    setToStorage: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
            return false;
        }
    },
    
    // 防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 安全的动态属性访问（替代eval的场景）
    getProperty: function(obj, propertyPath) {
        return propertyPath.split('.').reduce((prev, curr) => prev && prev[curr], obj);
    },
    
    // 安全的表达式计算（替代简单数学表达式eval）
    safeCalculate: function(expression) {
        // 只允许数字、基本运算符和空格
        if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
            throw new Error("表达式包含不安全字符");
        }
        
        try {
            // 使用Function构造函数但限制在安全范围内
            const calculate = new Function('return ' + expression);
            return calculate();
        } catch (error) {
            console.error('计算表达式出错:', error);
            return null;
        }
    }
};
