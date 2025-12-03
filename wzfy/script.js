// script.js
document.addEventListener('DOMContentLoaded', async () => {
  // 初始化变量
  let allSubjects = [];
  let selectedSubjects = [];
  let examQuestions = [];
  let userAnswers = [];
  
  // DOM元素
  const subjectSelection = document.getElementById('subject-selection');
  const examScreen = document.getElementById('exam-screen');
  const resultScreen = document.getElementById('result-screen');
  const subjectList = document.getElementById('subject-list');
  const examForm = document.getElementById('exam-form');
  const examTitle = document.getElementById('exam-title');
  
  // 加载科目数据
  allSubjects = await loadSubjects();
  renderSubjectSelection();
  
  // 渲染科目选择界面
  function renderSubjectSelection() {
    subjectList.innerHTML = '';
    allSubjects.forEach((subject, index) => {
      const subjectEl = document.createElement('div');
      subjectEl.className = 'subject-item selected';
      subjectEl.dataset.index = index;
      subjectEl.innerHTML = `
        <input type="checkbox" id="subject-${index}" checked>
        <label for="subject-${index}">${subject.subjectName}</label>
      `;
      subjectEl.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          const checkbox = subjectEl.querySelector('input');
          checkbox.checked = !checkbox.checked;
          subjectEl.classList.toggle('selected', checkbox.checked);
        }
      });
      subjectList.appendChild(subjectEl);
    });
  }
  
  // 开始考试
  document.getElementById('start-exam').addEventListener('click', startExam);
  
  async function startExam() {
    // 获取选中的科目
    const checkboxes = subjectList.querySelectorAll('input[type="checkbox"]');
    selectedSubjects = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => allSubjects[parseInt(cb.id.split('-')[1](@ref)]);
    
    if (selectedSubjects.length === 0) {
      alert('请至少选择一个科目');
      return;
    }
    
    // 获取题目数量
    const questionCount = parseInt(document.getElementById('question-count').value) || 5;
    
    // 合并所有题目
    let allQuestions = [];
    selectedSubjects.forEach(subject => {
      subject.questions.forEach(q => {
        allQuestions.push({ ...q, subjectName: subject.subjectName });
      });
    });
    
    // 过滤近期答对题目
    const filteredQuestions = getFilteredQuestions(allQuestions);
    
    // 随机选择题目
    examQuestions = selectRandomQuestions(
      filteredQuestions.length > 0 ? filteredQuestions : allQuestions,
      Math.min(questionCount, allQuestions.length)
    );
    
    // 初始化用户答案
    userAnswers = new Array(examQuestions.length).fill(null);
    
    // 显示考试界面
    renderExamScreen();
  }
  
  // 渲染考试界面
  function renderExamScreen() {
    // 显示科目名称
    const subjectNames = [...new Set(selectedSubjects.map(s => s.subjectName))];
    examTitle.textContent = subjectNames.length > 3 ? 
      `${subjectNames.slice(0, 3).join('、')}等${subjectNames.length}个科目` : 
      subjectNames.join('、');
    
    // 生成题目
    examForm.innerHTML = '';
    examQuestions.forEach((q, i) => {
      examForm.innerHTML += renderQuestion(q, i);
    });
    
    // 添加选项事件监听
    examQuestions.forEach((_, i) => {
      const options = examForm.querySelectorAll(`input[name="q${i}"]`);
      options.forEach(opt => {
        opt.addEventListener('change', () => {
          userAnswers[i] = parseInt(opt.value);
        });
      });
    });
    
    // 显示考试界面
    subjectSelection.classList.add('hidden');
    examScreen.classList.remove('hidden');
    
    // 启动计时器
    startTimer(10 * 60); // 10分钟
  }
  
  // 计时器功能
  function startTimer(seconds) {
    const timerElement = document.querySelector('#exam-timer span');
    let remaining = seconds;
    
    const timer = setInterval(() => {
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      timerElement.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      
      if (remaining <= 0) {
        clearInterval(timer);
        submitExam();
      }
      remaining--;
    }, 1000);
  }
  
  // 提交考试
  document.getElementById('submit-exam').addEventListener('click', submitExam);
  
  function submitExam() {
    // 计算得分
    const results = examQuestions.map((q, i) => ({
      question: q.question,
      options: q.options,
      userAnswer: userAnswers[i],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      subject: q.subjectName,
      isCorrect: userAnswers[i] === q.correctAnswer
    }));
    
    const correctCount = results.filter(r => r.isCorrect).length;
    
    // 记录答对题目
    const correctIds = results
      .filter(r => r.isCorrect)
      .map(r => examQuestions.find(q => q.question === r.question).id);
    
    recordResults(correctIds);
    
    // 显示结果
    showResults(results, correctCount);
  }
  
  // 显示考试结果
  function showResults(results, correctCount) {
    const total = results.length;
    
    // 显示摘要
    document.getElementById('result-summary').innerHTML = `
      <p>答对题目：${correctCount}/${total} (${Math.round((correctCount/total)*100)}%)</p>
      <p>科目：${[...new Set(results.map(r => r.subject))].join('、')}</p>
    `;
    
    // 显示详情
    const detailsContainer = document.getElementById('result-details');
    detailsContainer.innerHTML = '';
    
    results.forEach((result, i) => {
      const resultEl = document.createElement('div');
      resultEl.className = `result-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
      resultEl.innerHTML = `
        <h3>${i+1}. ${result.question} <small>(${result.subject})</small></h3>
        <p>你的答案：${result.options[result.userAnswer]} ${result.isCorrect ? '✓' : '✗'}</p>
        <p>正确答案：${result.options[result.correctAnswer]}</p>
        <p class="explanation">${result.explanation}</p>
      `;
      detailsContainer.appendChild(resultEl);
    });
    
    // 切换界面
    examScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
  }
  
  // 再考一次
  document.getElementById('retry-exam').addEventListener('click', () => {
    resultScreen.classList.add('hidden');
    subjectSelection.classList.remove('hidden');
  });
});
