// 考试系统核心逻辑
class HaauHeiExamSystem {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.examStartTime = null;
        this.examTimer = null;
        this.timeLimit = 60 * 60; // 默认60分钟
        this.timeRemaining = this.timeLimit;
        this.questionCount = 10;
        this.loadedSubjects = new Set();
        
        this.questionHistory = Utils.getFromStorage('haauhei_question_history', {});
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
        this.questionCount = parseInt(document.getElementById('question-count').value) || 10;
        
        if (this.questionCount < 5) {
            alert('题目数量不能少于5题');
            return;
        }
        
        if (this.questionCount > 50) {
            alert('题目数量不能超过50题');
            return;
        }
        
        // 显示加载状态
        document.getElementById('question-text').textContent = '正在加载题目，请稍候...';
        document.getElementById('options-container').innerHTML = '';
        
        // 切换到考试界面
        this.showScreen('exam-screen');
        
        // 加载题目
        await this.loadQuestions();
        
        if (this.questions.length === 0) {
            alert('无法加载题目，请检查题目文件是否存在');
            this.showScreen('start-screen');
            return;
        }
        
        // 初始化考试状态
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.examStartTime = new Date();
        this.timeRemaining = this.timeLimit;
        
        // 更新界面
        this.updateProgress();
        this.displayQuestion();
        this.startTimer();
    }
    
    // 加载题目
    async loadQuestions() {
        this.questions = [];
        this.loadedSubjects.clear();
        
        let subjectIndex = 1;
        let subjectData;
        
        // 循环加载所有题目文件
        do {
            try {
                const subjectId = subjectIndex.toString().padStart(4, '0');
                const response = await fetch(`subjects/${subjectId}.json`);
                
                if (!response.ok) break;
                
                subjectData = await response.json();
                this.loadedSubjects.add(subjectData.subjectName);
                
                // 为每个题目添加唯一标识符和来源信息
                subjectData.questions.forEach((question, index) => {
                    question.id = `${subjectId}-${index}`;
                    question.subjectName = subjectData.subjectName;
                    
                    // 根据历史记录计算题目权重（答对次数越少，权重越高）
                    const history = this.questionHistory[question.id];
                    question.weight = history ? 
                        Math.max(0.1, 1 - (history.correctCount / Math.max(history.answerCount, 1))) : 1;
                });
                
                this.questions.push(...subjectData.questions);
                subjectIndex++;
            } catch (error) {
                console.error(`加载题目文件 ${subjectIndex} 时出错:`, error);
                break;
            }
        } while (subjectData);
        
        // 如果题目数量超过需求，则进行加权随机选择
        if (this.questions.length > this.questionCount) {
            this.selectRandomQuestions();
        }
        
        // 打乱题目顺序
        this.shuffleQuestions();
    }
    
    // 根据权重随机选择题目
    selectRandomQuestions() {
        // 计算总权重
        const totalWeight = this.questions.reduce((sum, q) => sum + q.weight, 0);
        
        // 创建权重累积数组
        const cumulativeWeights = [];
        let cumulativeWeight = 0;
        
        for (const question of this.questions) {
            cumulativeWeight += question.weight;
            cumulativeWeights.push(cumulativeWeight);
        }
        
        // 选择题目
        const selectedQuestions = [];
        
        while (selectedQuestions.length < this.questionCount) {
            const random = Math.random() * totalWeight;
            let selected = false;
            
            for (let i = 0; i < cumulativeWeights.length && !selected; i++) {
                if (random < cumulativeWeights[i]) {
                    // 检查是否已选择此题目
                    if (!selectedQuestions.includes(this.questions[i])) {
                        selectedQuestions.push(this.questions[i]);
                        selected = true;
                    }
                }
            }
            
            // 防止无限循环
            if (!selected && selectedQuestions.length === 0) {
                selectedQuestions.push(this.questions[0]);
            }
        }
        
        this.questions = selectedQuestions;
    }
    
    // 打乱题目顺序
    shuffleQuestions() {
        this.questions = Utils.shuffleArray(this.questions);
    }
    
    // 显示题目
    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        document.getElementById('question-text').textContent = question.question;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                optionElement.classList.add('selected');
            }
            
            optionElement.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
            optionElement.addEventListener('click', () => this.selectOption(index));
            
            optionsContainer.appendChild(optionElement);
        });
        
        // 更新导航按钮状态
        this.updateNavigationButtons();
    }
    
    // 选择答案选项
    selectOption(optionIndex) {
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        // 更新选项样式
        const options = document.querySelectorAll('.option');
        options.forEach((option, index) => {
            option.classList.toggle('selected', index === optionIndex);
        });
        
        // 自动转到下一题（如果是最后一题则显示提交按钮）
        if (this.currentQuestionIndex === this.questions.length - 1) {
            document.getElementById('submit-exam').style.display = 'inline-block';
        } else {
            setTimeout(() => this.nextQuestion(), 500);
        }
    }
    
    // 上一题
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.updateProgress();
        }
    }
    
    // 下一题
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.updateProgress();
        }
        
        // 如果是最后一题，显示提交按钮
        if (this.currentQuestionIndex === this.questions.length - 1) {
            document.getElementById('submit-exam').style.display = 'inline-block';
            document.getElementById('next-question').disabled = true;
        }
    }
    
    // 更新进度显示
    updateProgress() {
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.questions.length;
        
        // 更新导航按钮状态
        this.updateNavigationButtons();
    }
    
    // 更新导航按钮状态
    updateNavigationButtons() {
        document.getElementById('prev-question').disabled = this.currentQuestionIndex === 0;
        document.getElementById('next-question').disabled = 
            this.currentQuestionIndex === this.questions.length - 1 || 
            this.userAnswers[this.currentQuestionIndex] === null;
    }
    
    // 开始计时器
    startTimer() {
        this.updateTimerDisplay();
        
        this.examTimer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.submitExam();
            }
        }, 1000);
    }
    
    // 更新计时器显示
    updateTimerDisplay() {
        document.getElementById('time-remaining').textContent = 
            Utils.formatTime(this.timeRemaining);
    }
    
    // 提交考试
    submitExam() {
        clearInterval(this.examTimer);
        
        // 计算得分
        const results = this.calculateResults();
        
        // 更新答题历史
        this.updateQuestionHistory(results);
        
        // 显示结果
        this.showResults(results);
    }
    
    // 计算考试结果
    calculateResults() {
        const results = {
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            details: []
        };
        
        this.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const isAnswered = userAnswer !== null;
            
            if (isAnswered && isCorrect) {
                results.correct++;
            } else if (isAnswered && !isCorrect) {
                results.incorrect++;
            } else {
                results.unanswered++;
            }
            
            resu