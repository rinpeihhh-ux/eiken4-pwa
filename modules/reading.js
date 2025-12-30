// Reading Comprehension Module

const ReadingModule = {
    currentDay: 1,
    currentIndex: 0,
    currentQuestionIndex: 0,
    passages: [],
    userAnswers: [],
    correctCount: 0,
    totalQuestions: 0,

    async init(day) {
        this.currentDay = day;
        this.currentIndex = 0;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.correctCount = 0;

        // Load reading data
        const response = await fetch('data/reading.json');
        const allPassages = await response.json();
        this.passages = allPassages.filter(p => p.day === day);

        // Calculate total questions
        this.totalQuestions = this.passages.reduce((sum, p) => sum + p.questions.length, 0);

        this.render();
    },

    render() {
        const container = document.getElementById('reading-content');
        const progressEl = document.getElementById('reading-progress');

        if (this.currentIndex >= this.passages.length) {
            this.showResults();
            return;
        }

        const passage = this.passages[this.currentIndex];
        const question = passage.questions[this.currentQuestionIndex];

        const answeredQuestions = this.userAnswers.length;
        progressEl.textContent = `${answeredQuestions + 1}/${this.totalQuestions}`;

        container.innerHTML = `
            <div class="quiz-card">
                <div class="quiz-example" style="max-height: 200px; overflow-y: auto; text-align: left; line-height: 1.8;">
                    ${passage.passage.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
                
                <div class="quiz-question" style="margin-top: 1rem;">
                    ${question.question}
                </div>
                
                <div class="options-grid">
                    ${question.options.map((opt, idx) => `
                        <button class="option-btn" onclick="ReadingModule.selectAnswer(${idx})" data-index="${idx}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                
                <div id="reading-translation" class="explanation hidden">
                    <h4>和訳</h4>
                    <p>${passage.translation}</p>
                </div>
            </div>
        `;
    },

    selectAnswer(selectedIndex) {
        const passage = this.passages[this.currentIndex];
        const question = passage.questions[this.currentQuestionIndex];
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
            const passage = this.passages[this.currentIndex];
            StorageManager.addWrongAnswer('reading', passage.id);
        }

        // Disable all buttons
        buttons.forEach(btn => btn.disabled = true);

        // Show translation on last question of passage
        if (this.currentQuestionIndex === passage.questions.length - 1) {
            document.getElementById('reading-translation').classList.remove('hidden');
        }

        this.userAnswers.push({
            passage: passage.passage,
            question: question.question,
            selectedAnswer: selectedIndex,
            correctAnswer: question.answer,
            isCorrect
        });

        // Move to next question
        setTimeout(() => {
            this.currentQuestionIndex++;

            // Check if all questions for this passage are done
            if (this.currentQuestionIndex >= passage.questions.length) {
                this.currentIndex++;
                this.currentQuestionIndex = 0;
            }

            this.render();
        }, 2500);
    },

    showResults() {
        const container = document.getElementById('reading-content');
        const percentage = Math.round((this.correctCount / this.totalQuestions) * 100);

        container.innerHTML = `
            <div class="result-content">
                <h2>読解完了！</h2>
                <div class="result-score">
                    <div class="result-score-value">${percentage}%</div>
                    <div class="result-score-label">正答率</div>
                </div>
                <div class="result-stats">
                    <div class="result-stat">
                        <span class="result-stat-label">正解数</span>
                        <span class="result-stat-value">${this.correctCount}/${this.totalQuestions}</span>
                    </div>
                </div>
                <button class="primary-btn" onclick="ReadingModule.finish()">完了</button>
            </div>
        `;

        // Save progress
        StorageManager.updateDaySection(this.currentDay, 'reading', true, percentage);
    },

    finish() {
        // Return to day screen
        window.app.showScreen('day-screen');
        window.app.loadDay(this.currentDay);
    }
};
