// core.js - 主协调文件
class HaauHeiExamSystem {
    constructor() {
        // 初始化各个管理器
        this.historyManager = new HistoryManager();
        this.questionLoader = new QuestionLoader();
        this.resultCalculator = new ResultCalculator();
        this.examManager = new ExamManager(
            this.questionLoader, 
            this.resultCalculator, 
            this.historyManager
        );
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        document.getElementById('start-exam').addEventListener('click', () => this.startExam());
        document.getElementById('prev-question').addEventListener('click', () => this.previousQuestion());
        document.getElementById('next-question').addEventListener('click', () => this.nextQuestion());
        document.getElementById('submit-exam').addEventListener('click', () => this.submitExam());
        document.getElementById('restart-exam').addEventListener('click', () => this.restartExam());
        
        document.getElementById('question-count').addEventListener('change', (e) => {
            this.questionCount = parseInt(e.target.value) || 10;
        });
    }
    
    async startExam() {
        try {
            const questions = await this.examManager.startExam(this.questionCount);
            this.showScreen('exam-screen');
            this.displayCurrentQuestion();
        } catch (error) {
            alert(error.message);
            this.showScreen('start-screen');
        }
    }
    
    // 其他协调方法...
}
