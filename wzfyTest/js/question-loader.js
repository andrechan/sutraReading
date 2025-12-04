// 题目加载器
class QuestionLoader {
    constructor() {
        this.loadedSubjects = new Set();
    }
    
    // 加载题目
    async loadQuestions(requiredCount) {
        this.loadedSubjects.clear();
        const allQuestions = await this.loadAllQuestions();
        
        if (allQuestions.length === 0) {
            return [];
        }
        
        // 如果题目数量超过需求，则进行加权随机选择
        if (allQuestions.length > requiredCount) {
            return this.selectQuestionsByWeight(allQuestions, requiredCount);
        }
        
        // 打乱题目顺序
        return Utils.shuffleArray(allQuestions);
    }
    
    // 加载所有题目
    async loadAllQuestions() {
        let allQuestions = [];
        let subjectIndex = 1;
        
        // 循环加载所有题目文件
        while (true) {
            try {
                const subject = await this.loadSubjectFile(subjectIndex);
                if (!subject) break;
                
                this.loadedSubjects.add(subject.subjectName);
                allQuestions = allQuestions.concat(this.processSubjectQuestions(subject, subjectIndex));
                subjectIndex++;
            } catch (error) {
                console.error(`加载题目文件时出错:`, error);
                break;
            }
        }
        
        return allQuestions;
    }
    
    // 处理科目题目
    processSubjectQuestions(subject, subjectIndex) {
        const subjectId = subjectIndex.toString().padStart(4, '0');
        
        return subject.questions.map((question, index) => {
            return {
                ...question,
                id: `${subjectId}-${index}`,
                subjectName: subject.subjectName,
                weight: this.calculateQuestionWeight(`${subjectId}-${index}`)
            };
        });
    }
    
    // 加载科目文件
    async loadSubjectFile(subjectIndex) {
        const subjectId = subjectIndex.toString().padStart(4, '0');
        const response = await fetch(`subjects/${subjectId}.json`);
        
        if (!response.ok) return null;
        
        return await response.json();
    }
    
    // 计算题目权重
    calculateQuestionWeight(questionId) {
        const history = Utils.getFromStorage('haauhei_question_history', {});
        const questionHistory = history[questionId];
        
        if (!questionHistory) return 1.0;
        
        // 答对率越低，权重越高（更需要练习）
        const correctnessRate = questionHistory.correctCount / questionHistory.answerCount;
        return Math.max(0.1, 1 - correctnessRate);
    }
    
    // 根据权重选择题目
    selectQuestionsByWeight(allQuestions, count) {
        // 计算总权重
        const totalWeight = allQuestions.reduce((sum, q) => sum + q.weight, 0);
        const selectedQuestions = [];
        
        while (selectedQuestions.length < count && allQuestions.length > 0) {
            const random = Math.random() * totalWeight;
            let weightSum = 0;
            
            for (let i = 0; i < allQuestions.length; i++) {
                weightSum += allQuestions[i].weight;
                
                if (random <= weightSum) {
                    // 检查是否已选择此题目
                    if (!selectedQuestions.includes(allQuestions[i])) {
                        selectedQuestions.push(allQuestions[i]);
                        break;
                    }
                }
            }
        }
        
        return Utils.shuffleArray(selectedQuestions);
    }
    
    // 获取已加载的科目列表
    getLoadedSubjects() {
        return Array.from(this.loadedSubjects);
    }
}
