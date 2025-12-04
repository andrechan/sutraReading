// 结果计算器
class ResultCalculator {
    // 计算考试结果
    calculateResults(questions, userAnswers) {
        const results = {
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            details: [],
            score: 0,
            totalQuestions: questions.length,
            startTime: new Date(),
            endTime: new Date()
        };
        
        questions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const isAnswered = userAnswer !== null;
            const isCorrect = isAnswered && userAnswer === question.correctAnswer;
            
            if (isCorrect) {
                results.correct++;
            } else if (isAnswered) {
                results.incorrect++;
            } else {
                results.unanswered++;
            }
            
            results.details.push({
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                userAnswer: userAnswer,
                explanation: question.explanation,
                subjectName: question.subjectName,
                isCorrect: isCorrect,
                isAnswered: isAnswered,
                questionNumber: index + 1
            });
        });
        
        results.score = (results.correct / results.totalQuestions) * 100;
        results.accuracy = Utils.calculateAccuracy(results.correct, results.totalQuestions);
        results.duration = Math.round((results.endTime - results.startTime) / 1000); // 考试时长（秒）
        
        return results;
    }
    
    // 生成结果显示HTML
    generateResultDisplay(results) {
        let html = '';
        
        results.details.forEach(detail => {
            const statusInfo = this.getStatusInfo(detail);
            
            html += `
                <div class="result-item">
                    <div class="result-question">${detail.questionNumber}. ${detail.question} 
                        <span class="${statusInfo.class}">(${statusInfo.text})</span>
                    </div>
                    <div class="result-answer">你的答案: ${this.formatUserAnswer(detail)}</div>
                    <div class="result-answer">正确答案: ${this.formatCorrectAnswer(detail)}</div>
                    <div class="result-explanation">解析: ${detail.explanation}</div>
                </div>
            `;
        });
        
        return html;
    }
    
    // 获取题目状态信息
    getStatusInfo(detail) {
        if (!detail.isAnswered) {
            return { text: '未作答', class: 'unanswered' };
        }
        return detail.isCorrect ? 
            { text: '正确', class: 'correct' } : 
            { text: '错误', class: 'incorrect' };
    }
    
    // 格式化用户答案显示
    formatUserAnswer(detail) {
        if (!detail.isAnswered) return '未作答';
        return `${String.fromCharCode(65 + detail.userAnswer)}. ${detail.options[detail.userAnswer]}`;
    }
    
    // 格式化正确答案显示
    formatCorrectAnswer(detail) {
        return `${String.fromCharCode(65 + detail.correctAnswer)}. ${detail.options[detail.correctAnswer]}`;
    }
}
