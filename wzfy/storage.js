 
// 加载所有题目数据
async function loadAllQuestions() {
    const questions = [];
    let index = 1;
    
    while (true) {
        const filename = `subjects/${index.toString().padStart(4, '0')}.json`;
        try {
            const response = await fetch(filename);
            if (!response.ok) break;
            
            const subject = await response.json();
            subject.questions.forEach(q => {
                q.subjectName = subject.subjectName;
                q.subjectId = index;
            });
            questions.push(...subject.questions);
            index++;
        } catch (error) {
            break;
        }
    }
    
    return questions;
}

// 获取用户答题记录
function getUserRecords() {
    return JSON.parse(localStorage.getItem('haauhei_records') || '{}');
}

// 更新用户答题记录
function updateUserRecords(questionId, isCorrect) {
    const records = getUserRecords();
    records[questionId] = {
        correct: isCorrect,
        timestamp: Date.now()
    };
    localStorage.setItem('haauhei_records', JSON.stringify(records));
}
 