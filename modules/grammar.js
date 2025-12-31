// Grammar Learning Module

const GrammarModule = {
    currentDay: 1,
    currentIndex: 0,
    questions: [],
    userAnswers: [],
    correctCount: 0,

    // Timer & lock
    timerId: null,
    timeLeft: 10,
    locked: false,
    currentCorrectIndex: null,
    currentQuestionId: null,

    async init(day) {
        this.currentDay = day;
        this.currentIndex = 0;
        this.userAnswers = [];
        this.correctCount = 0;
        this.stopTimer();
        this.locked = false;

        // Load grammar data
        const response = await fetch('data/grammar.json');
        const allQuestions = await response.json();
        this.questions = allQuestions.filter(q => q.day === day);

        this.render();
    },

    render() {
        const container = document.getElementById('grammar-content');
        const progressEl = document.getElementById('grammar-progress');

        if (this.currentIndex >= this.questions.length) {
            this.showResults();
            return;
        }

        const question = this.questions[this.currentIndex];
        progressEl.textContent = `${this.currentIndex + 1}/${this.questions.length}`;

        // Store state for timer / timeout handling
        this.locked = false;
        this.currentCorrectIndex = question.answer;
        this.currentQuestionId = question.id;

        container.innerHTML = `
            <div class="quiz-card">
                <div class="quiz-meta">
                    <div class="quiz-timer" id="grammar-timer">10</div>
                </div>
                <div class="quiz-question">
                    ${question.question}
                </div>
                
                <div class="options-grid">
                    ${question.options.map((opt, idx) => `
                        <button class="option-btn" onclick="GrammarModule.selectAnswer(${idx})" data-index="${idx}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                
                <div id="grammar-explanation" class="explanation hidden">
                    <h4>解説</h4>
                    <p>${question.explanation}</p>
                </div>
            </div>
        `;

        // Start 10-second countdown
        this.startTimer('grammar-timer');
    },

    selectAnswer(selectedIndex) {
        if (this.locked) return;
        this.locked = true;
        this.stopTimer();
        const question = this.questions[this.currentIndex];
        const buttons = document.querySelectorAll('.option-btn');
        const selectedButton = buttons[selectedIndex];

        const isCorrect = selectedIndex === question.answer;

        if (isCorrect) {
            this.correctCount++;
            selectedButton.classList.add('correct');
            AudioManager.playSfx('correct');
        } else {
            selectedButton.classList.add('incorrect');
            AudioManager.playSfx('incorrect');
            // Highlight correct answer
            buttons[question.answer].classList.add('correct');
            // Record wrong answer
            StorageManager.addWrongAnswer('grammar', question.id);
        }

        // Disable all buttons
        buttons.forEach(btn => btn.disabled = true);

        // Show explanation
        document.getElementById('grammar-explanation').classList.remove('hidden');

        this.userAnswers.push({
            question: question.question,
            selectedAnswer: selectedIndex,
            correctAnswer: question.answer,
            isCorrect
        });

        // Move to next question after delay
        setTimeout(() => {
            this.currentIndex++;
            this.render();
        }, 2500);
    },

    startTimer(timerElId) {
        this.stopTimer();
        this.timeLeft = 10;
        this.updateTimerDisplay(timerElId);

        this.timerId = setInterval(() => {
            if (this.locked) {
                this.stopTimer();
                return;
            }
            this.timeLeft -= 1;
            this.updateTimerDisplay(timerElId);

            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.handleTimeout();
            }
        }, 1000);
    },

    stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    },

    updateTimerDisplay(timerElId) {
        const el = document.getElementById(timerElId);
        if (!el) return;
        el.textContent = `${Math.max(0, this.timeLeft)}秒`;
        if (this.timeLeft <= 3) el.classList.add('urgent');
        else el.classList.remove('urgent');
    },

    handleTimeout() {
        if (this.locked) return;
        this.locked = true;

        const question = this.questions[this.currentIndex];
        const buttons = document.querySelectorAll('.option-btn');

        buttons.forEach(btn => btn.disabled = true);
        if (buttons[question.answer]) {
            buttons[question.answer].classList.add('correct');
        }
        // Show explanation
        const exp = document.getElementById('grammar-explanation');
        if (exp) exp.classList.remove('hidden');

        StorageManager.addWrongAnswer('grammar', question.id);
        AudioManager.playSfx('incorrect');

        this.userAnswers.push({
            question: question.question,
            selectedAnswer: '時間切れ',
            correctAnswer: question.answer,
            isCorrect: false
        });

        setTimeout(() => {
            this.currentIndex++;
            this.render();
        }, 2500);
    },

    showResults() {
        const container = document.getElementById('grammar-content');
        const percentage = Math.round((this.correctCount / this.questions.length) * 100);

        container.innerHTML = `
            <div class="result-content">
                <h2>文法学習完了！</h2>
                <div class="result-score">
                    <div class="result-score-value">${percentage}%</div>
                    <div class="result-score-label">正答率</div>
                </div>
                <div class="result-stats">
                    <div class="result-stat">
                        <span class="result-stat-label">正解数</span>
                        <span class="result-stat-value">${this.correctCount}/${this.questions.length}</span>
                    </div>
                </div>
                <button class="primary-btn" onclick="GrammarModule.finish()">完了</button>
            </div>
        `;

        // Save progress
        StorageManager.updateDaySection(this.currentDay, 'grammar', true, percentage);
    },

    finish() {
        // Return to day screen
        window.app.showScreen('day-screen');
        window.app.loadDay(this.currentDay);
    }
};
