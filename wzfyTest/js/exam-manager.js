// 考试流程管理器
class ExamManager {
    constructor(questionLoader, resultCalculator, historyManager) {
        this.questionLoader = questionLoader;
        this.resultCalculator = resultCalculator;
        this.historyManager = historyManager;
        
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.examTimer = null;
        this.timeRemaining = 60 * 60;
        this.timeLimit = 60 * 60;
        this.questionCount = 10;
    }
    
    // 开始考试
    async startExam(questionCount) {
        this.questionCount = questionCount;
        this.questions = await this.questionLoader.loadQuestions(questionCount);
        
        if (this.questions.length === 0) {
            throw new Error('无法加载题目，请检查题目文件是否存在');
        }
        
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.timeRemaining = this.timeLimit;
        
        this.startTimer();
        return this.questions;
    }
    
    // 开始计时器
    startTimer() {
        this.updateTimerDisplay();
        
        this.examTimer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.finishExam();
            }
        }, 1000);
    }
    
    // 更新计时器显示
    updateTimerDisplay() {
        const timerElement = document.getElementById('time-remaining');
        if (timerElement) {
            timerElement.textContent = Utils.formatTime(this.timeRemaining);
        }
    }
    
    // 选择答案
    selectAnswer(questionIndex, answerIndex) {
        this.userAnswers[questionIndex] = answerIndex;
    }
    
    // 下一题
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    }
    
    // 上一题
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return true;
        }
        return false;
    }
    
    // 完成考试
    finishExam() {
        clearInterval(this.examTimer);
        
        const results = this.resultCalculator.calculateResults(
            this.questions, 
            this.userAnswers
        );
        
        this.historyManager.updateHistory(this.questions, results);
        
        return results;
    }
    
    // 获取当前题目
    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }
    
    // 获取进度信息
    getProgress() {
        return {
            current: this.currentQuestionIndex + 1,
            total: this.questions.length
        };
    }
    
    // 检查是否是最后一题
    isLastQuestion() {
        return this.currentQuestionIndex === this.questions.length - 1;
    }
    
    // 检查是否是第一题
    isFirstQuestion() {
        return this.currentQuestionIndex === 0;
    }
    
    // 获取用户答案
    getUserAnswer(questionIndex) {
        return this.userAnswers[questionIndex];
    }
    
    // 检查是否所有题目都已作答
    isExamCompleted() {
        return this.userAnswers.every(answer => answer !== null);
    }
    
    // 重置考试状态
    resetExam() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.timeRemaining = this.timeLimit;
        
        if (this.examTimer) {
            clearInterval(this.examTimer);
            this.examTimer = null;
        }
    }
}
