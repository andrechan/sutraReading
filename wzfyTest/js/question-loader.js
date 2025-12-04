// question-loader.js
class QuestionLoader {
    constructor() {
        this.loadedSubjects = new Set();
    }
    
    async loadQuestions(requiredCount) {
        this.loadedSubjects.clear();
        let allQuestions = [];
        let subjectIndex = 1;
        
        // 加载所有题目文件
        while (true) {
            try {
                const subject = await this.loadSubjectFile(subjectIndex);
                if (!subject) break;
                
                allQuestions = allQuestions.concat(subject.questions);
                subjectIndex++;
            } catch (error) {
                break;
            }
        }
        
        // 应用权重并选择题目
        return this.selectQuestionsByWeight(allQuestions, requiredCount);
    }
    
    async loadSubjectFile(subjectIndex) {
        const subjectId = subjectIndex.toString().padStart(4, '0');
        const response = await fetch(`subjects/${subjectId}.json`);
        
        if (!response.ok) return null;
        
        const subjectData = await response.json();
        this.loadedSubjects.add(subjectData.subjectName);
        
        // 为题目添加元数据
        subjectData.questions.forEach((question, index) => {
            question.id = `${subjectId}-${index}`;
            question.subjectName = subjectData.subjectName;
        });
        
        return subjectData;
    }
    
    selectQuestionsByWeight(allQuestions, requiredCount) {
        if (allQuestions.length <= requiredCount) {
            return Utils.shuffleArray(allQuestions);
        }
        
        // 计算题目权重（基于历史表现）
        const weightedQuestions = allQuestions.map(q => ({
            question: q,
            weight: this.calculateQuestionWeight(q)
        }));
        
        // 加权随机选择
        return this.weightedRandomSelection(weightedQuestions, requiredCount);
    }
    
    calculateQuestionWeight(question) {
        const history = Utils.getFromStorage('haauhei_question_history', {});
        const questionHistory = history[question.id];
        
        if (!questionHistory) return 1.0;
        
        // 答对率越低，权重越高（更需要练习）
        const correctnessRate = questionHistory.correctCount / questionHistory.answerCount;
        return Math.max(0.1, 1 - correctnessRate);
    }
    
    weightedRandomSelection(weightedItems, count) {
        const totalWeight = weightedItems.reduce((sum, item) => sum + item.weight, 0);
        const selected = [];
        
        while (selected.length < count && weightedItems.length > 0) {
            const random = Math.random() * totalWeight;
            let weightSum = 0;
            
            for (let i = 0; i < weightedItems.length; i++) {
                weightSum += weightedItems[i].weight;
                
                if (random <= weightSum) {
                    selected.push(weightedItems[i].question);
                    weightedItems.splice(i, 1);
                    break;
                }
            }
        }
        
        return Utils.shuffleArray(selected);
    }
}
