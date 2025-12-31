// Pre-study Module (Before Day1)

const PreStudyModule = {
    data: null,

    async init() {
        const container = document.getElementById('prestudy-content');
        if (!container) return;

        container.innerHTML = '<div class="loading">読み込み中...</div>';

        try {
            const response = await fetch('data/prestudy.json');
            this.data = await response.json();
            this.render();
        } catch (e) {
            console.error(e);
            container.innerHTML = '<div class="error">読み込みに失敗しました。オフラインの場合は一度オンラインで開いてください。</div>';
        }
    },

    render() {
        const container = document.getElementById('prestudy-content');
        if (!container || !this.data) return;

        const progress = StorageManager.getProgress();
        const done = !!progress?.preStudyCompleted;

        let html = `
            <div class="prestudy-intro card">
                <h3>${this.escape(this.data.title || '事前学習')}</h3>
                <p>ここを完了にすると、Day1を開始できます。</p>
                <div class="prestudy-badge ${done ? 'done' : ''}">
                    ${done ? '✓ 完了済み' : '未完了'}
                </div>
            </div>
        `;

        for (const section of (this.data.sections || [])) {
            if (section.grammar_topics) {
                html += this.renderGrammarSection(section);
            } else {
                html += this.renderTextSection(section);
            }
        }

        html += `
            <div class="prestudy-footer">
                <p class="muted">※「完了にする」は何度押してもOKです（学習データは消えません）。</p>
            </div>
        `;

        container.innerHTML = html;
    },

    renderTextSection(section) {
        const lines = (section.body || []).map(t => `<li>${this.escape(t)}</li>`).join('');
        return `
            <details class="details-card">
                <summary>${this.escape(section.title || '')}</summary>
                <div class="details-body">
                    <ul class="bullets">${lines}</ul>
                </div>
            </details>
        `;
    },

    renderGrammarSection(section) {
        const topics = section.grammar_topics || [];
        const topicsHtml = topics.map(t => {
            const exHtml = (t.examples || []).map(ex => `
                <div class="example">
                    <div class="example-en">${this.escape(ex.en)}</div>
                    <div class="example-ja">${this.escape(ex.ja)}</div>
                </div>
            `).join('');

            const mistakesHtml = (t.common_mistakes || []).map(m => `<li>${this.escape(m)}</li>`).join('');

            return `
                <details class="details-card nested">
                    <summary>${this.escape(t.title)}</summary>
                    <div class="details-body">
                        <p class="prep-explain">${this.escape(t.explain)}</p>
                        <div class="examples">${exHtml}</div>
                        ${mistakesHtml ? `<div class="mistakes"><div class="mistakes-title">よくあるミス</div><ul class="bullets">${mistakesHtml}</ul></div>` : ''}
                    </div>
                </details>
            `;
        }).join('');

        return `
            <details class="details-card">
                <summary>${this.escape(section.title || '')}</summary>
                <div class="details-body">
                    <p class="muted">むずかしい説明はしません。まずは「型（かた）」と例文を見てください。</p>
                    <div class="nested-list">
                        ${topicsHtml}
                    </div>
                </div>
            </details>
        `;
    },

    escape(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
};
