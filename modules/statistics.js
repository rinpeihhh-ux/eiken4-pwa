// Statistics Module - 学習統計

const StatisticsModule = {
    init() {
        this.render();
    },

    render() {
        const container = document.getElementById('statistics-content');
        const progress = StorageManager.getProgress();
        const wrongAnswersStats = StorageManager.getWrongAnswersStats();
        const examResults = StorageManager.getExamResults();

        // Calculate statistics
        let totalSections = 0;
        let completedSections = 0;
        const categoryScores = {
            vocabulary: [],
            grammar: [],
            listening: [],
            reading: []
        };

        Object.values(progress.days).forEach(day => {
            Object.entries(day.sections).forEach(([section, completed]) => {
                totalSections++;
                if (completed) completedSections++;
            });

            // Collect scores
            Object.entries(day.scores).forEach(([section, score]) => {
                if (categoryScores[section]) {
                    categoryScores[section].push(score);
                }
            });
        });

        // Calculate average scores
        const avgScores = {};
        Object.entries(categoryScores).forEach(([category, scores]) => {
            if (scores.length > 0) {
                avgScores[category] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            } else {
                avgScores[category] = 0;
            }
        });

        // Total questions answered
        const totalAnswered = Object.values(categoryScores).reduce((sum, arr) => sum + arr.length, 0);

        container.innerHTML = `
            <div class="stat-card">
                <h3>📈 全体進捗</h3>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-value">${Math.round(progress.overallProgress)}%</div>
                        <div class="stat-label">完了率</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${completedSections}/${totalSections}</div>
                        <div class="stat-label">セクション</div>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <h3>📊 カテゴリー別正答率</h3>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-value">${avgScores.vocabulary}%</div>
                        <div class="stat-label">単語</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${avgScores.grammar}%</div>
                        <div class="stat-label">文法</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${avgScores.listening}%</div>
                        <div class="stat-label">リスニング</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${avgScores.reading}%</div>
                        <div class="stat-label">読解</div>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <h3>📝 復習が必要な問題</h3>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-value" style="color: var(--warning)">${wrongAnswersStats.vocabulary}</div>
                        <div class="stat-label">単語</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" style="color: var(--warning)">${wrongAnswersStats.grammar}</div>
                        <div class="stat-label">文法</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" style="color: var(--warning)">${wrongAnswersStats.listening}</div>
                        <div class="stat-label">リスニング</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" style="color: var(--warning)">${wrongAnswersStats.reading}</div>
                        <div class="stat-label">読解</div>
                    </div>
                </div>
                <p style="text-align: center; margin-top: var(--spacing-md); color: var(--text-secondary);">
                    合計 <strong>${wrongAnswersStats.total}問</strong> の復習が必要です
                </p>
            </div>

            ${examResults.length > 0 ? `
                <div class="stat-card">
                    <h3>🎯 模擬試験結果</h3>
                    ${examResults.slice(-3).reverse().map((result, index) => `
                        <div class="result-stat" style="margin-bottom: var(--spacing-sm);">
                            <span class="result-stat-label">${new Date(result.timestamp).toLocaleDateString('ja-JP')}</span>
                            <span class="result-stat-value">${result.score}%</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <button class="primary-btn" onclick="StatisticsModule.finish()">閉じる</button>
        `;
    },

    finish() {
        window.app.showScreen('home-screen');
    }
};
