 
let currentExam = null;
let currentQuestionIndex = 0;

// 初始化应用
function initApp() {
    document.getElementById('start-section').style.display = 'block';
    document.getElementById('exam-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';
    
    document.getElementById('start-exam').addEventListener('click', startExam);
}

// 渲染题目
function renderQuestion(index) {
    if (index < 0 || index >= currentExam.questions.length) return;
    
    currentQuestionIndex = index;
    const question = currentExam.questions[index];
    const questionContainer = document.getElementById('question-container');
    
    questionContainer.innerHTML = `
        <div class="question-meta">
            <span>题目 ${index + 1}/${currentExam.questions.length}</span>
            <span>科目: ${question.subjectName}</span>
        </div>
        <div class="question-text">${question.question}</div>
        <div class="options-container">
            ${question.options.map((option, i) => `
                <div class="option ${currentExam.answers[index] === i ? 'selected' : ''}" 
                     data-index="${i}">
                    ${String.fromCharCode(65 + i)}. ${option}
                </div>
            `).join('')}
        </div>
    `;
    
    // 添加选项选择事件
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => {
            currentExam.answers[index] = parseInt(option.dataset.index);
            renderQuestion(index);
        });
    });
    
    // 更新进度条
    const progress = ((index + 1) / currentExam.questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    
    // 考试控制按钮
    document.getElementById('prev-question').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            renderQuestion(currentQuestionIndex - 1);
        }
    });
    
    document.getElementById('next-question').addEventListener('click', () => {
        if (currentQuestionIndex < currentExam.questions.length - 1) {
            renderQuestion(currentQuestionIndex + 1);
        }
    });
    
    document.getElementById('submit-exam').addEventListener('click', () => {
        if (confirm('确定要提交试卷吗？')) {
            document.getElementById('exam-section').style.display = 'none';
            document.getElementById('results-section').style.display = 'block';
            showResults();
        }
    });
});
 