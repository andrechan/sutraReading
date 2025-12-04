// 历史记录管理器
class HistoryManager {
    constructor() {
        this.history = Utils.getFromStorage('haauhei_question_history', {});
    }
    
    // 更新答题历史
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
    
    // 清理过期记录
    cleanOldRecords(days) {
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        
        Object.keys(this.history).forEach(questionId => {
            if (this.history[questionId].lastAnswered < cutoffTime) {
                delete this.history[questionId];
            }
        });
    }
    
    // 保存历史记录
    saveHistory() {
        Utils.setToStorage('haauhei_question_history', this.history);
    }
    
    // 获取题目统计信息
    getQuestionStats(questionId) {
        return this.history[questionId] || null;
    }
    
    // 获取总体统计信息
    getOverallStats() {
        const totalQuestions = Object.keys(this.history).length;
        let totalAnswers = 0;
        let totalCorrect = 0;
        
        Object.values(this.history).forEach(stats => {
            totalAnswers += stats.answerCount;
            totalCorrect += stats.correctCount;
        });
        
        return {
            totalQuestions,
            totalAnswers,
            totalCorrect,
            overallAccuracy: totalAnswers > 0 ? (totalCorrect / totalAnswers * 100).toFixed(1) : 0
        };
    }
}
