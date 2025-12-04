// result-calculator.js
class ResultCalculator {
    calculateResults(questions, userAnswers) {
        const results = {
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            details: [],
            score: 0,
            totalQuestions: questions.length
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
                isAnswered: isAnswered
            });
        });
        
        results.score = (results.correct / results.totalQuestions) * 100;
        results.accuracy = Utils.calculateAccuracy(results.correct, results.totalQuestions);
        
        return results;
    }
    
    generateResultDisplay(results) {
        let html = '';
        
        results.details.forEach((detail, index) => {
            const statusInfo = this.getStatusInfo(detail);
            
            html += `
                <div class="result-item">
                    <div class="result-question">${index + 1}. ${detail.question} 
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
    
    getStatusInfo(detail) {
        if (!detail.isAnswered) {
            return { text: '未作答', class: 'unanswered' };
        }
        return detail.isCorrect ? 
            { text: '正确', class: 'correct' } : 
            { text: '错误', class: 'incorrect' };
    }
    
    formatUserAnswer(detail) {
        if (!detail.isAnswered) return '未作答';
        return `${String.fromCharCode(65 + detail.userAnswer)}. ${detail.options[detail.userAnswer]}`;
    }
    
    formatCorrectAnswer(detail) {
        return `${String.fromCharCode(65 + detail.correctAnswer)}. ${detail.options[detail.correctAnswer]}`;
    }
}
