// 生成随机试卷
async function generateExam(questionCount = 10) {
    const allQuestions = await loadAllQuestions();
    const records = getUserRecords();
    
    // 过滤近期答对的题目（30天内）
    const recentCorrectThreshold = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const availableQuestions = allQuestions.filter(q => {
        const record = records[q.id];
        return !record || !record.correct || record.timestamp < recentCorrectThreshold;
    });
    
    // 随机选择题目
    const selectedQuestions = [];
    const questionPool = [...availableQuestions];
    
    while (selectedQuestions.length < questionCount && questionPool.length > 0) {
        const randomIndex = Math.floor(Math.random() * questionPool.length);
        selectedQuestions.push(questionPool.splice(randomIndex, 1);
    }
    
    return selectedQuestions;
}

// 开始考试
function startExam() {
    const questionCount = parseInt(document.getElementById('question-count').value) || 10;
    
    generateExam(questionCount).then(examQuestions => {
        currentExam = {
            questions: examQuestions,
            answers: new Array(examQuestions.length).fill(null),
            startTime: Date.now()
        };
        
        renderQuestion(0);
    });
}
