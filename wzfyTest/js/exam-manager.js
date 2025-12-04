// exam-manager.js
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
    }
    
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
    
    updateTimerDisplay() {
        const timerElement = document.getElementById('time-remaining');
        if (timerElement) {
            timerElement.textContent = Utils.formatTime(this.timeRemaining);
        }
    }
    
    selectAnswer(questionIndex, answerIndex) {
        this.userAnswers[questionIndex] = answerIndex;
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return true;
        }
        return false;
    }
    
    finishExam() {
        clearInterval(this.examTimer);
        
        const results = this.resultCalculator.calculateResults(
            this.questions, 
            this.userAnswers
        );
        
        this.historyManager.updateHistory(this.questions, results);
        
        return results;
    }
    
    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }
    
    getProgress() {
        return {
            current: this.currentQuestionIndex + 1,
            total: this.questions.length
        };
    }
    
    isLastQuestion() {
        return this.currentQuestionIndex === this.questions.length - 1;
    }
    
    isFirstQuestion() {
        return this.currentQuestionIndex === 0;
    }
}
