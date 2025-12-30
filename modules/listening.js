// Listening Learning Module

const ListeningModule = {
    currentDay: 1,
    currentIndex: 0,
    questions: [],
    userAnswers: [],
    correctCount: 0,
    hasPlayedAudio: false,

    async init(day) {
        this.currentDay = day;
        this.currentIndex = 0;
        this.userAnswers = [];
        this.correctCount = 0;

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
        progressEl.textContent = `${this.currentIndex + 1}/${this.questions.length}`;

        container.innerHTML = `
            <div class="quiz-card">
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
        } else {
            await AudioManager.speakEnglish(question.script);
        }
    },

    selectAnswer(selectedIndex) {
        const question = this.questions[this.currentIndex];
        const buttons = document.querySelectorAll('.option-btn');
        const selectedButton = buttons[selectedIndex];

        const isCorrect = selectedIndex === question.answer;

        if (isCorrect) {
            this.correctCount++;
            selectedButton.classList.add('correct');
        } else {
            selectedButton.classList.add('incorrect');
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
