// Reference Module (Frequent Words / Phrases)

const ReferenceModule = {
    type: null,
    allItems: [],
    categories: [],
    searchEl: null,
    categoryEl: null,
    contentEl: null,

    async init(type) {
        this.type = type;
        this.allItems = [];
        this.categories = [];

        if (type === 'words') {
            this.searchEl = document.getElementById('freq-words-search');
            this.categoryEl = document.getElementById('freq-words-category');
            this.contentEl = document.getElementById('freq-words-content');
        } else {
            this.searchEl = document.getElementById('freq-phrases-search');
            this.categoryEl = document.getElementById('freq-phrases-category');
            this.contentEl = document.getElementById('freq-phrases-content');
        }

        if (!this.contentEl) return;

        this.contentEl.innerHTML = '<div class="loading">読み込み中...</div>';

        try {
            const dataFile = type === 'words' ? 'data/frequent_words.json' : 'data/frequent_phrases.json';
            const response = await fetch(dataFile);
            const data = await response.json();
            this.allItems = data.items || [];
            this.categories = Array.from(new Set(this.allItems.map(i => i.category).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'ja'));

            this.populateCategories();
            this.bindEvents();
            this.render();
        } catch (e) {
            console.error(e);
            this.contentEl.innerHTML = '<div class="error">読み込みに失敗しました。オフラインの場合は一度オンラインで開いてください。</div>';
        }
    },

    populateCategories() {
        if (!this.categoryEl) return;

        // Reset options (keep "all")
        this.categoryEl.innerHTML = '<option value="all">すべて</option>';
        for (const c of this.categories) {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            this.categoryEl.appendChild(opt);
        }
    },

    bindEvents() {
        // Avoid duplicate listeners by reassigning handlers
        if (this.searchEl) {
            this.searchEl.oninput = () => this.render();
        }
        if (this.categoryEl) {
            this.categoryEl.onchange = () => this.render();
        }
    },

    render() {
        if (!this.contentEl) return;

        const q = (this.searchEl?.value || '').trim().toLowerCase();
        const cat = this.categoryEl?.value || 'all';

        const filtered = this.allItems.filter(item => {
            const inCat = (cat === 'all') || (item.category === cat);
            if (!inCat) return false;

            if (!q) return true;

            const hay = this.type === 'words'
                ? `${item.word} ${item.meaning} ${item.example?.en || ''} ${item.example?.ja || ''}`
                : `${item.phrase} ${item.meaning} ${item.example?.en || ''} ${item.example?.ja || ''}`;

            return hay.toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
            this.contentEl.innerHTML = '<div class="empty">該当する項目がありません。</div>';
            return;
        }

        const html = filtered.map(item => {
            if (this.type === 'words') {
                return `
                    <div class="ref-item card">
                        <div class="ref-head">
                            <div class="ref-main">${this.escape(item.word)}</div>
                            <div class="ref-sub">${this.escape(item.meaning)}</div>
                        </div>
                        ${item.example ? `
                        <div class="ref-example">
                            <div class="example-en">${this.escape(item.example.en)}</div>
                            <div class="example-ja">${this.escape(item.example.ja)}</div>
                        </div>` : ''}
                        <div class="ref-tag">${this.escape(item.category || '')}</div>
                    </div>
                `;
            } else {
                return `
                    <div class="ref-item card">
                        <div class="ref-head">
                            <div class="ref-main">${this.escape(item.phrase)}</div>
                            <div class="ref-sub">${this.escape(item.meaning)}</div>
                        </div>
                        ${item.example ? `
                        <div class="ref-example">
                            <div class="example-en">${this.escape(item.example.en)}</div>
                            <div class="example-ja">${this.escape(item.example.ja)}</div>
                        </div>` : ''}
                        <div class="ref-tag">${this.escape(item.category || '')}</div>
                    </div>
                `;
            }
        }).join('');

        this.contentEl.innerHTML = html;
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
