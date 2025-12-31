// Listening Learning Module

const ListeningModule = {
    currentDay: 1,
    currentIndex: 0,
    questions: [],
    userAnswers: [],
    correctCount: 0,
    hasPlayedAudio: false,

    // Timer & lock
    timerId: null,
    timeLeft: 10,
    locked: false,
    timerStarted: false,
    currentCorrectIndex: null,
    currentQuestionId: null,

    async init(day) {
        this.currentDay = day;
        this.currentIndex = 0;
        this.userAnswers = [];
        this.correctCount = 0;
        this.stopTimer();
        this.locked = false;
        this.timerStarted = false;
        this.stopTimer();
        this.locked = false;
        this.timerStarted = false;

        // Load listening data
        const response = await fetch('data/listening.json');
        const allQuestions = await response.json();
        this.questions = allQuestions.filter(q => q.day === day);

        this.render();
    },

    render() {
        const container = document.getElementById('listening-content');
        const progressEl = document.getElementById('listening-progress');

        if (this.currentIndex >= this.questions.length) {
            this.showResults();
            return;
        }

        const question = this.questions[this.currentIndex];
        this.hasPlayedAudio = false;
        this.stopTimer();
        this.timerStarted = false;
        this.locked = false;
        this.currentCorrectIndex = question.answer;
        this.currentQuestionId = question.id;
        progressEl.textContent = `${this.currentIndex + 1}/${this.questions.length}`;

        container.innerHTML = `
            <div class="quiz-card">
                <div class="quiz-meta">
                    <div class="quiz-timer hidden" id="listening-timer">10</div>
                </div>
                <div class="audio-controls">
                    <button class="audio-btn" onclick="ListeningModule.playAudio()">
                        🔊 音声を再生
                    </button>
                </div>
                
                <div class="quiz-question">
                    ${question.question}
                </div>
                
                <div class="options-grid" id="listening-options">
                    ${question.options.map((opt, idx) => `
                        <button class="option-btn" onclick="ListeningModule.selectAnswer(${idx})" data-index="${idx}" disabled>
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                
                <div id="listening-script" class="explanation hidden">
                    <h4>スクリプト</h4>
                    <p><strong>${question.script}</strong></p>
                    <p>${question.translation}</p>
                </div>
            </div>
        `;
    },

    async playAudio() {
        const question = this.questions[this.currentIndex];

        // Enable options after playing
        if (!this.hasPlayedAudio) {
            await AudioManager.speakEnglish(question.script);
            const buttons = document.querySelectorAll('#listening-options .option-btn');
            buttons.forEach(btn => btn.disabled = false);
            this.hasPlayedAudio = true;

            // Start 10-second countdown after the first playback (when options become selectable)
            const timerEl = document.getElementById('listening-timer');
            if (timerEl) timerEl.classList.remove('hidden');
            if (!this.timerStarted) {
                this.timerStarted = true;
                this.startTimer('listening-timer');
            }
        } else {
            await AudioManager.speakEnglish(question.script);
        }
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
            StorageManager.addWrongAnswer('listening', question.id);
        }

        // Disable all buttons
        buttons.forEach(btn => btn.disabled = true);

        // Show script
        document.getElementById('listening-script').classList.remove('hidden');

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
        }, 3000);
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

        buttons.forEach(btn => (btn.disabled = true));
        if (buttons[question.answer]) {
            buttons[question.answer].classList.add('correct');
        }

        document.getElementById('listening-script')?.classList.remove('hidden');
        StorageManager.addWrongAnswer('listening', question.id);
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
        }, 3000);
    },

    showResults() {
        const container = document.getElementById('listening-content');
        const percentage = Math.round((this.correctCount / this.questions.length) * 100);

        container.innerHTML = `
            <div class="result-content">
                <h2>リスニング完了！</h2>
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
                <button class="primary-btn" onclick="ListeningModule.finish()">完了</button>
            </div>
        `;

        // Save progress
        StorageManager.updateDaySection(this.currentDay, 'listening', true, percentage);
    },

    finish() {
        // Return to day screen
        window.app.showScreen('day-screen');
        window.app.loadDay(this.currentDay);
    }
};
