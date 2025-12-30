// Vocabulary Learning Module

const VocabularyModule = {
    currentDay: 1,
    currentIndex: 0,
    words: [],
    userAnswers: [],
    correctCount: 0,

    async init(day) {
        this.currentDay = day;
        this.currentIndex = 0;
        this.userAnswers = [];
        this.correctCount = 0;

        // Load vocabulary data
        const response = await fetch('data/vocabulary.json');
        const allWords = await response.json();
        this.words = allWords.filter(w => w.day === day);

        this.render();
    },

    render() {
        const container = document.getElementById('vocab-content');
        const progressEl = document.getElementById('vocab-progress');

        if (this.currentIndex >= this.words.length) {
            this.showResults();
            return;
        }

        const word = this.words[this.currentIndex];
        progressEl.textContent = `${this.currentIndex + 1}/${this.words.length}`;

        // Randomly decide: English to Japanese or Japanese to English
        const mode = Math.random() > 0.5 ? 'en-to-ja' : 'ja-to-en';

        let question, correctAnswer;
        if (mode === 'en-to-ja') {
            question = word.english;
            correctAnswer = word.japanese;
        } else {
            question = word.japanese;
            correctAnswer = word.english;
        }

        // Generate options (wrong answers from other words)
        const options = this.generateOptions(correctAnswer, mode);

        container.innerHTML = `
            <div class="quiz-card">
                <div class="quiz-question">
                    ${question}
                </div>
                
                <div class="audio-controls">
                    <button class="audio-btn" onclick="VocabularyModule.playAudio('${word.english}')">
                        🔊 音声を再生
                    </button>
                </div>
                
                <div class="quiz-example">
                    例文: ${word.example.en}<br>
                    ${word.example.ja}
                </div>
                
                <div class="options-grid">
                    ${options.map((opt, idx) => `
                        <button class="option-btn" onclick="VocabularyModule.selectAnswer(${idx}, '${correctAnswer}')" data-answer="${opt}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    generateOptions(correctAnswer, mode) {
        const options = [correctAnswer];
        const allWords = this.words;

        while (options.length < 4) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            const option = mode === 'en-to-ja' ? randomWord.japanese : randomWord.english;

            if (!options.includes(option)) {
                options.push(option);
            }
        }

        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    },

    async playAudio(text) {
        await AudioManager.speakEnglish(text);
    },

    selectAnswer(selectedIndex, correctAnswer) {
        const buttons = document.querySelectorAll('.option-btn');
        const selectedButton = buttons[selectedIndex];
        const selectedAnswer = selectedButton.dataset.answer;

        const isCorrect = selectedAnswer === correctAnswer;

        if (isCorrect) {
            this.correctCount++;
            selectedButton.classList.add('correct');
        } else {
            selectedButton.classList.add('incorrect');
            // Highlight correct answer
            buttons.forEach(btn => {
                if (btn.dataset.answer === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
            // Record wrong answer
            const wordId = this.words[this.currentIndex].id;
            StorageManager.addWrongAnswer('vocabulary', wordId);
        }

        // Disable all buttons
        buttons.forEach(btn => btn.disabled = true);

        this.userAnswers.push({
            question: this.words[this.currentIndex],
            selectedAnswer,
            correctAnswer,
            isCorrect
        });

        // Move to next question after delay
        setTimeout(() => {
            this.currentIndex++;
            this.render();
        }, 1500);
    },

    showResults() {
        const container = document.getElementById('vocab-content');
        const percentage = Math.round((this.correctCount / this.words.length) * 100);

        container.innerHTML = `
            <div class="result-content">
                <h2>単語学習完了！</h2>
                <div class="result-score">
                    <div class="result-score-value">${percentage}%</div>
                    <div class="result-score-label">正答率</div>
                </div>
                <div class="result-stats">
                    <div class="result-stat">
                        <span class="result-stat-label">正解数</span>
                        <span class="result-stat-value">${this.correctCount}/${this.words.length}</span>
                    </div>
                </div>
                <button class="primary-btn" onclick="VocabularyModule.finish()">完了</button>
            </div>
        `;

        // Save progress
        StorageManager.updateDaySection(this.currentDay, 'vocabulary', true, percentage);
    },

    finish() {
        // Return to day screen
        window.app.showScreen('day-screen');
        window.app.loadDay(this.currentDay);
    }
};
