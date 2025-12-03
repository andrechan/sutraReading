// 显示考试结果
function showResults() {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    
    let correctCount = 0;
    
    currentExam.questions.forEach((question, index) => {
        const userAnswer = currentExam.answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) correctCount++;
        
        const questionElement = document.createElement('div');
        questionElement.className = `question-result ${isCorrect ? 'correct' : 'incorrect'}`;
        questionElement.innerHTML = `
            <h3>题目 ${index + 1}: ${question.question}</h3>
            <div class="options">
                ${question.options.map((opt, optIndex) => `
                    <div class="option ${optIndex === userAnswer ? 'user-answer' : ''} 
                                  ${optIndex === question.correctAnswer ? 'correct-answer' : ''}">
                        ${String.fromCharCode(65 + optIndex)}. ${opt}
                    </div>
                `).join('')}
            </div>
            <div class="explanation">
                <strong>解释:</strong> ${question.explanation}
            </div>
        `;
        
        resultsContainer.appendChild(questionElement);
        updateUserRecords(question.id, isCorrect);
    });
    
    const scoreElement = document.createElement('div');
    scoreElement.className = 'score-summary';
    scoreElement.innerHTML = `
        <h2>考试结果</h2>
        <p>正确率: ${correctCount}/${currentExam.questions.length} (${Math.round(correctCount/currentExam.questions.length*100)}%)</p>
        <p>用时: ${Math.floor((Date.now() - currentExam.startTime)/1000)} 秒</p>
        <button id="restart-exam">重新开始考试</button>
    `;
    
    resultsContainer.prepend(scoreElement);
    document.getElementById('restart-exam').addEventListener('click', initApp);
}
