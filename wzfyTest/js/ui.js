// 用户界面交互逻辑
document.addEventListener('DOMContentLoaded', () => {
    window.haauheiExam = new HaauHeiExamSystem();
    
    // 添加键盘快捷键支持
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('exam-screen').classList.contains('active')) {
            // 数字键1-4选择答案
            if (e.key >= '1' && e.key <= '4') {
                const optionIndex = parseInt(e.key) - 1;
                window.haauheiExam.selectOption(optionIndex);
            }
            
            // 左右箭头切换题目
            if (e.key === 'ArrowLeft') {
                document.getElementById('prev-question').click();
            } else if (e.key === 'ArrowRight') {
                document.getElementById('next-question').click();
            }
            
            // Enter键提交考试（在最后一题时）
            if (e.key === 'Enter' && 
                window.haauheiExam.currentQuestionIndex === window.haauheiExam.questions.length - 1) {
                document.getElementById('submit-exam').click();
            }
        }
    });
    
    // 添加页面离开确认
    window.addEventListener('beforeunload', (e) => {
        if (document.getElementById('exam-screen').classList.contains('active')) {
            e.preventDefault();
            e.returnValue = '考试正在进行中，确定要离开吗？';
        }
    });
    
    // 添加响应式调整
    window.addEventListener('resize', Utils.debounce(() => {
        // 在窗口大小改变时调整布局
        if (window.innerWidth < 768) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }, 250));
});

// 移动端触摸支持
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    if (!document.getElementById('exam-screen').classList.contains('active')) return;
    
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) < swipeThreshold) return;
    
    if (swipeDistance > 0) {
        // 向右滑动，上一题
        document.getElementById('prev-question').click();
    } else {
        // 向左滑动，下一题
        document.getElementById('next-question').click();
    }
}
