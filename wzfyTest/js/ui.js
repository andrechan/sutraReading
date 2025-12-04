// 用户界面控制器
class UIController {
    constructor(examSystem) {
        this.examSystem = examSystem;
        this.initializeUIEvents();
    }
    
    // 初始化UI事件
    initializeUIEvents() {
        // 键盘快捷键支持
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // 触摸支持
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // 页面离开确认
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
    }
    
    // 处理键盘事件
    handleKeyboard(e) {
        if (this.examSystem.currentScreen !== 'exam-screen') return;
        
        // 数字键1-4选择答案
        if (e.key >= '1' && e.key <= '4') {
            const optionIndex = parseInt(e.key) - 1;
            this.selectOption(optionIndex);
        }
        
        // 左右箭头切换题目
        if (e.key === 'ArrowLeft') {
            this.previousQuestion();
        } else if (e.key === 'ArrowRight') {
            this.nextQuestion();
        }
        
        // Enter键提交考试
        if (e.key === 'Enter' && this.examSystem.examManager.isLastQuestion()) {
            this.submitExam();
        }
    }
    
    // 触摸开始处理
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }
    
    // 触摸结束处理
    handleTouchEnd(e) {
        if (this.examSystem.currentScreen !== 'exam-screen') return;
        
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    }
    
    // 处理滑动手势
    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) < swipeThreshold) return;
        
        if (swipeDistance > 0) {
            this.previousQuestion();
        } else {
            this.nextQuestion();
        }
    }
    
    // 页面离开确认
    handleBeforeUnload(e) {
        if (this.examSystem.currentScreen === 'exam-screen') {
            e.preventDefault();
            e.returnValue = '考试正在进行中，确定要离开吗？';
        }
    }
}
