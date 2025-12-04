// history-manager.js
class HistoryManager {
    constructor() {
        this.history = Utils.getFromStorage('haauhei_question_history', {});
    }
    
    updateHistory(questions, results) {
        const now = Date.now();
        this.cleanOldRecords(30); // 清理30天前的记录
        
        results.details.forEach((detail, index) => {
            const questionId = questions[index].id;
            
            if (!this.history[questionId]) {
                this.history[questionId] = {
                    correctCount: 0,
                    answerCount: 0,
                    lastAnswered: now
                };
            }
            
            this.history[questionId].answerCount++;
            
            if (detail.isCorrect) {
                this.history[questionId].correctCount++;
            }
            
            this.history[questionId].lastAnswered = now;
        });
        
        this.saveHistory();
    }
    
    cleanOldRecords(days) {
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        
        Object.keys(this.history).forEach(questionId => {
            if (this.history[questionId].lastAnswered < cutoffTime) {
                delete this.history[questionId];
            }
        });
    }
    
    saveHistory() {
        Utils.setToStorage('haauhei_question_history', this.history);
    }
    
    getQuestionStats(questionId) {
        return this.history[questionId] || null;
    }
}
