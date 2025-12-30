// Mock Exam Module

const MockExamModule = {
    questions: [],
    currentIndex: 0,
    userAnswers: [],
    correctCount: 0,
    timeRemaining: 45 * 60, // 45 minutes in seconds
    timerInterval: null,

    async init() {
        this.currentIndex = 0;
        this.userAnswers = [];
        this.correctCount = 0;
        this.timeRemaining = 45 * 60;

        // Load mixed questions from all modules
        await this.loadQuestions();

        // Start timer
        this.startTimer();

        this.render();
    },

    async loadQuestions() {
        // Load from all data sources
        const [vocab, grammar, listening] = await Promise.all([
            fetch('data/vocabulary.json').then(r => r.json()),
            fetch('data/grammar.json').then(r => r.json()),
            fetch('data/listening.json').then(r => r.json())
        ]);

        // Select a mix of questions (total ~30 questions)
        const selectedVocab = vocab.slice(0, 10);
        const selectedGrammar = grammar.slice(0, 10);
        const selectedListening = listening.slice(0, 5);

        // Convert to unified format
        this.questions = [
            ...selectedGrammar.map(q => ({
                type: 'grammar',
                question: q.question,
                options: q.options,
                answer: q.answer,
                explanation: q.explanation
            })),
            ...selectedVocab.map(w => ({
                type: 'vocabulary',
                question: `"${w.english}" の意味は？`,
                options: this.generateVocabOptions(w.japanese, vocab),
                answer: 0, // Correct answer is always first before shuffle
                word: w
            })),
            ...selectedListening.map(q => ({
                type: 'listening',
                question: q.question,
                options: q.options,
                answer: q.answer,
                script: q.script
            }))
        ];

        // Shuffle all questions
        this.questions = this.questions.sort(() => Math.random() - 0.5);
    },

    generateVocabOptions(correctAnswer, allWords) {
        const options = [correctAnswer];
        while (options.length < 4) {
            const random = allWords[Math.floor(Math.random() * allWords.length)].japanese;
            if (!options.includes(random)) {
                options.push(random);
            }
        }
        return options.sort(() => Math.random() - 0.5);
    },

    startTimer() {
        const timerEl = document.getElementById('exam-timer');

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;

            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.showResults();
            }
        }, 1000);
    },

    render() {
        const container = document.getElementById('exam-content');

        if (this.currentIndex >= this.questions.length) {
            clearInterval(this.timerInterval);
            this.showResults();
            return;
        }

        const question = this.questions[this.currentIndex];

        container.innerHTML = `
            <div class="quiz-card">
                <div style="text-align: center; color: var(--text-secondary); margin-bottom: 1rem;">
                    問題 ${this.currentIndex + 1} / ${this.questions.length}
                </div>
                
                ${question.type === 'listening' ? `
                    <div class="audio-controls">
                        <button class="audio-btn" onclick="MockExamModule.playAudio()">
                            🔊 音声を再生
                        </button>
                    </div>
                ` : ''}
                
                <div class="quiz-question">
                    ${question.question}
                </div>
                
                <div class="options-grid">
                    ${question.options.map((opt, idx) => `
                        <button class="option-btn" onclick="MockExamModule.selectAnswer(${idx})" data-index="${idx}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    async playAudio() {
        const question = this.questions[this.currentIndex];
        if (question.type === 'listening') {
            await AudioManager.speakEnglish(question.script);
        }
    },

    selectAnswer(selectedIndex) {
        const question = this.questions[this.currentIndex];
        const isCorrect = selectedIndex === question.answer;

        if (isCorrect) {
            this.correctCount++;
        }

        this.userAnswers.push({
            question: question.question,
            selectedAnswer: selectedIndex,
            correctAnswer: question.answer,
            isCorrect
        });

        // Move to next immediately (exam mode - no feedback)
        this.currentIndex++;
        this.render();
    },

    showResults() {
        clearInterval(this.timerInterval);

        const container = document.getElementById('exam-content');
        const percentage = Math.round((this.correctCount / this.questions.length) * 100);

        // Simple pass/fail判定 (60% passing)
        const passed = percentage >= 60;
        const passMessage = passed ? '合格レベルです！' : 'もう少し復習が必要です';

        container.innerHTML = `
            <div class="result-content">
                <h2>模擬試験完了！</h2>
                <div class="result-score" style="background: ${passed ? 'linear-gradient(135deg, var(--success) 0%, #059669 100%)' : 'linear-gradient(135deg, var(--warning) 0%, #d97706 100%)'}">
                    <div class="result-score-value">${percentage}%</div>
                    <div class="result-score-label">${passMessage}</div>
                </div>
                <div class="result-stats">
                    <div class="result-stat">
                        <span class="result-stat-label">正解数</span>
                        <span class="result-stat-value">${this.correctCount}/${this.questions.length}</span>
                    </div>
                    <div class="result-stat">
                        <span class="result-stat-label">合格判定</span>
                        <span class="result-stat-value" style="color: ${passed ? 'var(--success)' : 'var(--warning)'}">
                            ${passed ? '合格レベル' : '要復習'}
                        </span>
                    </div>
                </div>
                <button class="primary-btn" onclick="MockExamModule.finish()">完了</button>
            </div>
        `;

        // Save exam result
        StorageManager.saveExamResult({
            score: percentage,
            correctCount: this.correctCount,
            totalQuestions: this.questions.length,
            passed
        });

        // Mark Day 10 as complete
        StorageManager.updateDaySection(10, 'exam', true, percentage);
    },

    finish() {
        // Return to home screen
        window.app.showScreen('home-screen');
    }
};
