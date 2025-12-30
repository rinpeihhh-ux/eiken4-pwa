// Review Mode Module - 間違えた問題の復習

const ReviewModule = {
    currentIndex: 0,
    wrongQuestions: [],
    currentCategory: 'all', // 'all', 'vocabulary', 'grammar', 'listening', 'reading'
    correctCount: 0,

    async init(category = 'all') {
        this.currentIndex = 0;
        this.correctCount = 0;
        this.currentCategory = category;

        // Load wrong answers from storage
        const wrongAnswers = StorageManager.getWrongAnswers();

        // Filter by category if needed
        if (category === 'all') {
            this.wrongQuestions = [
                ...wrongAnswers.vocabulary.map(id => ({ type: 'vocabulary', id })),
                ...wrongAnswers.grammar.map(id => ({ type: 'grammar', id })),
                ...wrongAnswers.listening.map(id => ({ type: 'listening', id })),
                ...wrongAnswers.reading.map(id => ({ type: 'reading', id }))
            ];
        } else {
            this.wrongQuestions = wrongAnswers[category].map(id => ({ type: category, id }));
        }

        // Shuffle questions
        this.wrongQuestions = this.wrongQuestions.sort(() => Math.random() - 0.5);

        if (this.wrongQuestions.length === 0) {
            this.showNoQuestions();
            return;
        }

        await this.loadQuestion();
    },

    async loadQuestion() {
        if (this.currentIndex >= this.wrongQuestions.length) {
            this.showResults();
            return;
        }

        const question = this.wrongQuestions[this.currentIndex];
        const container = document.getElementById('review-content');
        const progressEl = document.getElementById('review-progress');

        progressEl.textContent = `${this.currentIndex + 1}/${this.wrongQuestions.length}`;

        // Load question based on type
        switch (question.type) {
            case 'vocabulary':
                await this.renderVocabularyQuestion(container, question.id);
                break;
            case 'grammar':
                await this.renderGrammarQuestion(container, question.id);
                break;
            case 'listening':
                await this.renderListeningQuestion(container, question.id);
                break;
            case 'reading':
                await this.renderReadingQuestion(container, question.id);
                break;
        }
    },

    async renderVocabularyQuestion(container, wordId) {
        const response = await fetch('data/vocabulary.json');
        const words = await response.json();
        const word = words.find(w => w.id === wordId);

        if (!word) {
            this.currentIndex++;
            this.loadQuestion();
            return;
        }

        const mode = Math.random() > 0.5 ? 'en-to-ja' : 'ja-to-en';
        const question = mode === 'en-to-ja' ? word.english : word.japanese;
        const correctAnswer = mode === 'en-to-ja' ? word.japanese : word.english;

        // Generate options
        const options = [correctAnswer];
        while (options.length < 4) {
            const random = words[Math.floor(Math.random() * words.length)];
            const option = mode === 'en-to-ja' ? random.japanese : random.english;
            if (!options.includes(option)) options.push(option);
        }
        options.sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="quiz-card">
                <div class="review-badge">復習問題</div>
                <div class="quiz-question">${question}</div>
                <div class="audio-controls">
                    <button class="audio-btn" onclick="ReviewModule.playAudio('${word.english}')">
                        🔊 音声を再生
                    </button>
                </div>
                <div class="quiz-example">
                    例文: ${word.example.en}<br>
                    ${word.example.ja}
                </div>
                <div class="options-grid">
                    ${options.map((opt, idx) => `
                        <button class="option-btn" onclick="ReviewModule.selectAnswer(${idx}, '${correctAnswer}')" data-answer="${opt}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    async renderGrammarQuestion(container, questionId) {
        const response = await fetch('data/grammar.json');
        const questions = await response.json();
        const question = questions.find(q => q.id === questionId);

        if (!question) {
            this.currentIndex++;
            this.loadQuestion();
            return;
        }

        container.innerHTML = `
            <div class="quiz-card">
                <div class="review-badge">復習問題</div>
                <div class="quiz-question">${question.question}</div>
                <div class="options-grid">
                    ${question.options.map((opt, idx) => `
                        <button class="option-btn" onclick="ReviewModule.selectAnswerGrammar(${idx}, ${question.answer})" data-index="${idx}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                <div id="review-explanation" class="explanation hidden">
                    <h4>解説</h4>
                    <p>${question.explanation}</p>
                </div>
            </div>
        `;
    },

    async renderListeningQuestion(container, questionId) {
        const response = await fetch('data/listening.json');
        const questions = await response.json();
        const question = questions.find(q => q.id === questionId);

        if (!question) {
            this.currentIndex++;
            this.loadQuestion();
            return;
        }

        container.innerHTML = `
            <div class="quiz-card">
                <div class="review-badge">復習問題</div>
                <div class="audio-controls">
                    <button class="audio-btn" onclick="ReviewModule.playListeningAudio('${question.script.replace(/'/g, "\\'")}')">
                        🔊 音声を再生
                    </button>
                </div>
                <div class="quiz-question">${question.question}</div>
                <div class="options-grid">
                    ${question.options.map((opt, idx) => `
                        <button class="option-btn" onclick="ReviewModule.selectAnswerGrammar(${idx}, ${question.answer})" data-index="${idx}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                <div id="review-script" class="explanation hidden">
                    <h4>スクリプト</h4>
                    <p><strong>${question.script}</strong></p>
                    <p>${question.translation}</p>
                </div>
            </div>
        `;
    },

    async renderReadingQuestion(container, passageId) {
        const response = await fetch('data/reading.json');
        const passages = await response.json();
        const passage = passages.find(p => p.id === passageId);

        if (!passage || !passage.questions || passage.questions.length === 0) {
            this.currentIndex++;
            this.loadQuestion();
            return;
        }

        const question = passage.questions[0]; // Use first question

        container.innerHTML = `
            <div class="quiz-card">
                <div class="review-badge">復習問題</div>
                <div class="quiz-example" style="max-height: 200px; overflow-y: auto; text-align: left;">
                    ${passage.passage.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
                <div class="quiz-question">${question.question}</div>
                <div class="options-grid">
                    ${question.options.map((opt, idx) => `
                        <button class="option-btn" onclick="ReviewModule.selectAnswerGrammar(${idx}, ${question.answer})" data-index="${idx}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                <div id="review-translation" class="explanation hidden">
                    <h4>和訳</h4>
                    <p>${passage.translation}</p>
                </div>
            </div>
        `;
    },

    async playAudio(text) {
        await AudioManager.speakEnglish(text);
    },

    async playListeningAudio(text) {
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
            // Remove from wrong answers if correct
            const currentQuestion = this.wrongQuestions[this.currentIndex];
            StorageManager.removeWrongAnswer(currentQuestion.type, currentQuestion.id);
        } else {
            selectedButton.classList.add('incorrect');
            buttons.forEach(btn => {
                if (btn.dataset.answer === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }

        buttons.forEach(btn => btn.disabled = true);

        setTimeout(() => {
            this.currentIndex++;
            this.loadQuestion();
        }, 2000);
    },

    selectAnswerGrammar(selectedIndex, correctIndex) {
        const buttons = document.querySelectorAll('.option-btn');
        const isCorrect = selectedIndex === correctIndex;

        if (isCorrect) {
            this.correctCount++;
            buttons[selectedIndex].classList.add('correct');
            // Remove from wrong answers if correct
            const currentQuestion = this.wrongQuestions[this.currentIndex];
            StorageManager.removeWrongAnswer(currentQuestion.type, currentQuestion.id);
        } else {
            buttons[selectedIndex].classList.add('incorrect');
            buttons[correctIndex].classList.add('correct');
        }

        buttons.forEach(btn => btn.disabled = true);

        // Show explanation if available
        const explanation = document.getElementById('review-explanation') ||
            document.getElementById('review-script') ||
            document.getElementById('review-translation');
        if (explanation) {
            explanation.classList.remove('hidden');
        }

        setTimeout(() => {
            this.currentIndex++;
            this.loadQuestion();
        }, 2500);
    },

    showNoQuestions() {
        const container = document.getElementById('review-content');
        container.innerHTML = `
            <div class="result-content">
                <h2>🎉 完璧です！</h2>
                <p style="margin: 2rem 0; font-size: 1.125rem; color: var(--text-secondary);">
                    復習が必要な問題はありません。<br>
                    すべて正解しています！
                </p>
                <button class="primary-btn" onclick="ReviewModule.finish()">ホームに戻る</button>
            </div>
        `;
    },

    showResults() {
        const container = document.getElementById('review-content');
        const percentage = Math.round((this.correctCount / this.wrongQuestions.length) * 100);

        container.innerHTML = `
            <div class="result-content">
                <h2>復習完了！</h2>
                <div class="result-score">
                    <div class="result-score-value">${percentage}%</div>
                    <div class="result-score-label">正答率</div>
                </div>
                <div class="result-stats">
                    <div class="result-stat">
                        <span class="result-stat-label">正解数</span>
                        <span class="result-stat-value">${this.correctCount}/${this.wrongQuestions.length}</span>
                    </div>
                    <div class="result-stat">
                        <span class="result-stat-label">残り復習問題</span>
                        <span class="result-stat-value">${this.wrongQuestions.length - this.correctCount}問</span>
                    </div>
                </div>
                <button class="primary-btn" onclick="ReviewModule.finish()">完了</button>
            </div>
        `;
    },

    finish() {
        window.app.showScreen('home-screen');
        window.app.renderHome();
    }
};
