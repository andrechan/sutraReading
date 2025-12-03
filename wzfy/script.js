 
// script.js
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    let questions = [];
    let examQuestions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let correctHistory = {};
    const MAX_RECENT_CORRECT = 30; // 最近答对题目避免重复的天数
    
    // 初始化应用
    function init() {
        loadCorrectHistory();
        loadQuestions().then(() => {
            renderWelcomeScreen();
        });
    }
    
    // 从localStorage加载答题历史
    function loadCorrectHistory() {
        const savedHistory = localStorage.getItem('haauhei_correct_history');
        if (savedHistory) {
            correctHistory = JSON.parse(savedHistory);
        }
    }
    
    // 保存答题历史到localStorage
    function saveCorrectHistory() {
        localStorage.setItem('haauhei_correct_history', JSON.stringify(correctHistory));
    }
    
    // 从subjects目录加载所有题目
    async function loadQuestions() {
        let index = 1;
        questions = [];
        
        while (true) {
            const fileName = `subjects/${index.toString().padStart(4, '0')}.json`;
            try {
                const response = await fetch(fileName);
                if (!response.ok) break;
                
                const data = await response.json();
                data.questions.forEach((q, qIndex) => {
                    // 为每个问题生成唯一ID
                    const questionId = `${index.toString().padStart(4, '0')}_${qIndex}`;
                    questions.push({
                        ...q,
                        id: questionId,
                        subject: data.subjectName
                    });
                });
                index++;
            } catch (error) {
                break;
            }
        }
    }
    
    // 渲染欢迎界面
    function renderWelcomeScreen() {
        app.innerHTML = `
            <div class="screen">
                <h1>欢迎使用 HaauHei 考试系统</h1>
                <p>当前题库共有 ${questions.length} 道题目</p>
                <div class="setting-item">
                    <label for="questionCount">题目数量:</label>
                    <input type="number" id="questionCount" min="1" max="${Math.min(50, questions.length)}" value="10">
                </div>
                <button id="startExam">开始考试</button>
            </div>
        `;
        
        document.getElementById('startExam').addEventListener('click', startExam);
    }
    
    // 开始考试
    function startExam() {
        const questionCount = parseInt(document.getElementById('questionCount').value) || 10;
        generateExamQuestions(questionCount);
        currentQuestionIndex = 0;
        userAnswers = {};
        renderExamScreen();
    }
    
    // 生成考试题目
    function generateExamQuestions(count) {
        // 过滤掉最近答对的题目
        const now = Date.now();
        const recentCorrectThreshold = now - (MAX_RECENT_CORRECT * 24 * 60 * 60 * 1000);
        
        const availableQuestions = questions.filter(q => {
            const history = correctHistory[q.id];
            return !history || history.lastCorrect < recentCorrectThreshold;
        });
        
        // 如果可用题目不足，则使用所有题目
        const sourcePool = availableQuestions.length >= count ? 
            availableQuestions : questions;
        
        // 随机选择题目
        examQuestions = [];
        const tempPool = [...sourcePool];
        
        while (examQuestions.length < count && tempPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * tempPool.length);
            examQuestions.push(tempPool[randomIndex]);
            tempPool.splice(randomIndex, 1);
        }
    }
    
    // 渲染考试界面
    function renderExamScreen() {
        if (currentQuestionIndex >= examQuestions.length) {
            finishExam();
            return;
        }
        
        const question = examQuestions[currentQuestionIndex];
        const progress = ((currentQuestionIndex) / examQuestions.length) * 100;
        
        app.innerHTML = `
            <div class="screen">
                <h2>${question.subject} - 题目 ${currentQuestionIndex + 1}/${examQuestions.length}</h2>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
                
                <div class="question-container">
                    <div class="question-text">${question.question}</div>
                    <div class="options">
                        ${question.options.map((option, index) => `
                            <div class="option" data-index="${index}">
                                ${String.fromCharCode(65 + index)}. ${option}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <button id="nextQuestion" disabled>下一题</button>
            </div>
        `;
        
        // 添加选项选择事件
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', () => {
                // 移除之前的选择
                document.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // 设置当前选择
                option.classList.add('selected');
                document.getElementById('nextQuestion').disabled = false;
                
                // 保存答案
                userAnswers[question.id] = parseInt(option.dataset.index);
            });
        });
        
        // 添加下一题事件
        document.getElementById('nextQuestion').addEventListener('click', () => {
            currentQuestionIndex++;
            renderExamScreen();
        });
    }
    
    // 完成考试并显示结果
    function finishExam() {
        let correctCount = 0;
        const results = [];
        
        examQuestions.forEach(question => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            
            if (isCorrect) {
                correctCount++;
                // 更新答题历史
                correctHistory[question.id] = {
                    lastCorrect: Date.now(),
                    count: (correctHistory[question.id]?.count || 0) + 1
                };
            }
            
            results.push({
                question,
                userAnswer,
                isCorrect
            });
        });
        
        // 保存更新后的答题历史
        saveCorrectHistory();
        
        // 显示结果界面
        renderResultsScreen(results, correctCount);
    }
    
    // 渲染结果界面
    function renderResultsScreen(results, correctCount) {
        const accuracy = Math.round((correctCount / examQuestions.length) * 100);
        
        app.innerHTML = `
            <div class="screen">
                <h1>考试结果</h1>
                <h2>正确率: ${accuracy}% (${correctCount}/${examQuestions.length})</h2>
                
                <div class="results">
                    ${results.map((result, index) => `
                        <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                            <h3>题目 ${index + 1}: ${result.question.question}</h3>
                            <p>你的答案: ${String.fromCharCode(65 + result.userAnswer)}. ${result.question.options[result.userAnswer]}</p>
                            <p>正确答案: ${String.fromCharCode(65 + result.question.correctAnswer)}. ${result.question.options[result.question.correctAnswer]}</p>
                            <div class="explanation">
                                <strong>解析:</strong> ${result.question.explanation}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button id="restartExam">重新开始</button>
            </div>
        `;
        
        document.getElementById('restartExam').addEventListener('click', () => {
            renderWelcomeScreen();
        });
    }
    
    // 初始化应用
    init();
});
 