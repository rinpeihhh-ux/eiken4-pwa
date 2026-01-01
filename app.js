// Main Application Controller

const app = {
    currentScreen: 'splash-screen',
    curriculum: [],
    progress: null,
    settings: null,

    async init() {
        // Show splash screen
        this.showScreen('splash-screen');

        // Initialize storage
        this.progress = StorageManager.initProgress();
        this.settings = StorageManager.getSettings();

        // Apply settings
        this.applySettings();

        // Load curriculum
        await this.loadCurriculum();

        // Initialize audio
        AudioManager.init(this.settings.audioSpeed);

        // Set up event listeners
        this.setupEventListeners();

        // Wait a bit then show home screen
        setTimeout(() => {
            this.showScreen('home-screen');
            this.renderHome();
        }, 2000);
    },

    async loadCurriculum() {
        const response = await fetch('data/curriculum.json');
        this.curriculum = await response.json();
        // Pass curriculum toStorageManager for accurate completion checks
        StorageManager.setCurriculum(this.curriculum);
    },

    setupEventListeners() {
        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showScreen('settings-screen');
            this.renderSettings();
        });

        // Back buttons
        document.getElementById('day-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        document.getElementById('vocab-back-btn').addEventListener('click', () => {
            this.showScreen('day-screen');
            this.loadDay(VocabularyModule.currentDay);
        });

        document.getElementById('grammar-back-btn').addEventListener('click', () => {
            this.showScreen('day-screen');
            this.loadDay(GrammarModule.currentDay);
        });

        document.getElementById('listening-back-btn').addEventListener('click', () => {
            this.showScreen('day-screen');
            this.loadDay(ListeningModule.currentDay);
        });

        document.getElementById('reading-back-btn').addEventListener('click', () => {
            this.showScreen('day-screen');
            this.loadDay(ReadingModule.currentDay);
        });

        document.getElementById('exam-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        document.getElementById('settings-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        // Settings controls
        document.getElementById('audio-speed').addEventListener('change', (e) => {
            this.settings.audioSpeed = parseFloat(e.target.value);
            StorageManager.saveSettings(this.settings);
            AudioManager.setSpeed(this.settings.audioSpeed);
        });

        document.getElementById('font-size').addEventListener('change', (e) => {
            this.settings.fontSize = e.target.value;
            StorageManager.saveSettings(this.settings);
            this.applySettings();
        });

        document.getElementById('reset-data-btn').addEventListener('click', () => {
            if (confirm('本当にすべてのデータをリセットしますか？この操作は取り消せません。')) {
                StorageManager.resetAll();
                location.reload();
            }
        });

        // Review mode and statistics buttons
        document.getElementById('review-mode-btn').addEventListener('click', () => {
            this.showScreen('review-screen');
            ReviewModule.init('all');
        });

        document.getElementById('statistics-btn').addEventListener('click', () => {
            this.showScreen('statistics-screen');
            StatisticsModule.init();
        });

        // Pre-study and reference buttons
        document.getElementById('prestudy-btn').addEventListener('click', () => {
            this.showScreen('prestudy-screen');
            PreStudyModule.init();
        });

        // Word reference buttons (Rank A/B/C)
        const rankAButton = document.getElementById('rankA-words-btn');
        if (rankAButton) rankAButton.addEventListener('click', () => {
            this.showScreen('freq-words-screen');
            ReferenceModule.init('rankA');
        });

        const rankBButton = document.getElementById('rankB-words-btn');
        if (rankBButton) rankBButton.addEventListener('click', () => {
            this.showScreen('freq-words-screen');
            ReferenceModule.init('rankB');
        });

        const rankCButton = document.getElementById('rankC-words-btn');
        if (rankCButton) rankCButton.addEventListener('click', () => {
            this.showScreen('freq-words-screen');
            ReferenceModule.init('rankC');
        });

        const phrasesBtn = document.getElementById('freq-phrases-btn');
        if (phrasesBtn) phrasesBtn.addEventListener('click', () => {
            // Fallback: if phrases screen is missing (stale cached HTML), use the words reference screen.
            const phrasesScreen = document.getElementById('freq-phrases-screen');
            if (phrasesScreen) {
                this.showScreen('freq-phrases-screen');
            } else {
                this.showScreen('freq-words-screen');
            }
            ReferenceModule.init('phrases');
        });
document.getElementById('prestudy-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
            this.renderHome();
        });

        document.getElementById('freq-words-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        document.getElementById('freq-phrases-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        document.getElementById('prestudy-complete-btn').addEventListener('click', () => {
            StorageManager.setPreStudyCompleted(true);
            this.progress = StorageManager.getProgress();
            this.showScreen('home-screen');
            this.renderHome();
        });

        document.getElementById('review-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
            this.renderHome();
        });

        document.getElementById('statistics-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
        });
    },

    applySettings() {
        // Apply font size
        if (this.settings.fontSize === 'large') {
            document.body.classList.add('large-font');
        } else {
            document.body.classList.remove('large-font');
        }
    },

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    },

    renderHome() {
        // Update progress
        this.progress = StorageManager.getProgress();
        const progressBar = document.getElementById('overall-progress');
        const progressText = document.getElementById('progress-text');

        progressBar.style.width = `${this.progress.overallProgress}%`;
        progressText.textContent = `${Math.round(this.progress.overallProgress)}% 完了`;

        // Update review count
        const wrongAnswersStats = StorageManager.getWrongAnswersStats();
        const reviewCountEl = document.getElementById('review-count');
        if (reviewCountEl) {
            reviewCountEl.textContent = `${wrongAnswersStats.total}問`;
        }

                // Update pre-study status
        const prestudyStatusEl = document.getElementById('prestudy-status');
        const prestudySubtitleEl = document.getElementById('prestudy-subtitle');
        if (prestudyStatusEl) {
            if (this.progress.preStudyCompleted) {
                prestudyStatusEl.textContent = '事前学習：完了（Day1を開始できます）';
                prestudyStatusEl.classList.add('done');
            } else {
                prestudyStatusEl.textContent = '事前学習：未完了（Day1はロックされます）';
                prestudyStatusEl.classList.remove('done');
            }
        }
        if (prestudySubtitleEl) {
            prestudySubtitleEl.textContent = this.progress.preStudyCompleted ? '完了済み' : 'Day1を始める前に';
        }

// Render day cards
        const dayGrid = document.getElementById('day-grid');
        dayGrid.innerHTML = '';

        this.curriculum.forEach((day, index) => {
            const dayKey = `day${day.day}`;
            const dayProgress = this.progress.days[dayKey];
            const isCompleted = dayProgress.completed;
            // Day is locked if it's not Day 1 AND the previous day is not completed
            const isLocked = (day.day === 1 && !this.progress.preStudyCompleted) || (day.day > 1 && !this.progress.days[`day${day.day - 1}`].completed);

            const card = document.createElement('div');
            card.className = `day-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;

            card.innerHTML = `
                <div class="day-number">Day ${day.day}</div>
                <div class="day-title">${day.title}</div>
                <div class="day-status">
                    ${isCompleted ? '✓ 完了' : isLocked ? (day.day === 1 ? '🔒 事前学習を完了' : '🔒 ロック中') : '開始可能'}
                </div>
            `;

            if (!isLocked) {
                card.addEventListener('click', () => {
                    this.loadDay(day.day);
                });
            }

            dayGrid.appendChild(card);
        });
    },

    loadDay(dayNum) {
        const day = this.curriculum.find(d => d.day === dayNum);
        if (!day) return;

        this.progress = StorageManager.getProgress();
        if (dayNum === 1 && !this.progress.preStudyCompleted) {
            alert('Day1を始める前に、まず「事前学習」を完了してください。');
            this.showScreen('prestudy-screen');
            PreStudyModule.init();
            return;
        }

        this.showScreen('day-screen');

        // Update header
        document.getElementById('day-title').textContent = `Day ${day.day}`;
        document.getElementById('day-description').innerHTML = `
            <h3>${day.title}</h3>
            <p>${day.description}</p>
        `;

        // Render sections
        const sectionList = document.getElementById('section-list');
        sectionList.innerHTML = '';

        const dayKey = `day${dayNum}`;
        const dayProgress = this.progress.days[dayKey];

        day.sections.forEach(section => {
            const isCompleted = dayProgress.sections[section.id] === true;

            const card = document.createElement('div');
            card.className = `section-card ${isCompleted ? 'completed' : ''}`;

            card.innerHTML = `
                <div class="section-info">
                    <h3>${section.name}</h3>
                    <p>${section.description}</p>
                </div>
                <div class="section-status">
                    ${isCompleted ? '✓' : ''}
                </div>
            `;

            card.addEventListener('click', () => {
                this.startSection(dayNum, section.id);
            });

            sectionList.appendChild(card);
        });
    },

    startSection(dayNum, sectionId) {
        switch (sectionId) {
            case 'vocabulary':
                this.showScreen('vocabulary-screen');
                VocabularyModule.init(dayNum);
                break;
            case 'grammar':
                this.showScreen('grammar-screen');
                GrammarModule.init(dayNum);
                break;
            case 'listening':
                this.showScreen('listening-screen');
                ListeningModule.init(dayNum);
                break;
            case 'reading':
                this.showScreen('reading-screen');
                ReadingModule.init(dayNum);
                break;
            case 'exam':
                this.showScreen('exam-screen');
                MockExamModule.init();
                break;
        }
    },

    renderSettings() {
        // Set current values
        document.getElementById('audio-speed').value = this.settings.audioSpeed;
        document.getElementById('font-size').value = this.settings.fontSize;
    }
};

// Initialize app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.app = app;
    app.init();
});
