// 考试系统核心协调器
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
        
        this.currentScreen = 'start-screen';
        this.initializeEventListeners();
    }
    
    // 初始化事件监听器
    initializeEventListeners() {
        document.getElementById('start-exam').addEventListener('click', () => this.startExam());
        document.getElementById('prev-question').addEventListener('click', () => this.previousQuestion());
        document.getElementById('next-question').addEventListener('click', () => this.nextQuestion());
        document.getElementById('submit-exam').addEventListener('click', () => this.submitExam());
        document.getElementById('restart-exam').addEventListener('click', () => this.restartExam());
        
        // 监听题目数量输入变化
        document.getElementById('question-count').addEventListener('change', (e) => {
            this.questionCount = parseInt(e.target.value) || 10;
        });
    }
    
    // 开始考试
    async startExam() {
        try {
            this.questionCount = parseInt(document.getElementById('question-count').value) || 10;
            
            if (this.questionCount < 5 || this.questionCount > 50) {
                alert('题目数量必须在5-50题之间');
                return;
            }
            
            const questions = await this.examManager.startExam(this.questionCount);
            this.showScreen('exam-screen');
            this.displayCurrentQuestion();
        } catch (error) {
            alert(error.message);
            this.showScreen('start-screen');
        }
    }
    
    // 显示指定屏幕
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }
    
    // 其他方法将在UI.js中实现
}
