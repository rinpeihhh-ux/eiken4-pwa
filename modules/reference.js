// Reference Module (Frequent Words / Phrases)

const ReferenceModule = {
    type: null,
    allItems: [],
    categories: [],
    searchEl: null,
    categoryEl: null,
    contentEl: null,
    hideMemEl: null,
    memCountEl: null,

    async init(type) {
        this.type = type;
        this.allItems = [];
        this.categories = [];

        this.hideMemEl = null;
        this.memCountEl = null;

        if (type === 'words') {
            this.searchEl = document.getElementById('freq-words-search');
            this.categoryEl = document.getElementById('freq-words-category');
            this.contentEl = document.getElementById('freq-words-content');
            this.hideMemEl = document.getElementById('freq-words-hide-memorized');
            this.memCountEl = document.getElementById('freq-words-mem-count');
        } else {
            this.searchEl = document.getElementById('freq-phrases-search');
            this.categoryEl = document.getElementById('freq-phrases-category');
            this.contentEl = document.getElementById('freq-phrases-content');
            this.hideMemEl = document.getElementById('freq-phrases-hide-memorized');
            this.memCountEl = document.getElementById('freq-phrases-mem-count');
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
        if (this.hideMemEl) {
            this.hideMemEl.onchange = () => this.render();
        }

        // Event delegation for item actions (audio / memorize / flip)
        if (this.contentEl) {
            this.contentEl.onclick = (e) => {
                const t = e.target;
                if (!t) return;

                // Audio button
                const audioBtn = t.closest?.('[data-action="play-example"]');
                if (audioBtn) {
                    e.stopPropagation();
                    const text = audioBtn.getAttribute('data-text') || '';
                    if (text) AudioManager.speakEnglish(text);
                    return;
                }

                // Memorized checkbox or label
                const memEl = t.closest?.('[data-action="toggle-mem"]');
                if (memEl) {
                    e.stopPropagation();
                    const key = memEl.getAttribute('data-item-key');
                    const checked = memEl.checked;
                    if (key) {
                        StorageManager.setReferenceMemorized(this.type, key, !!checked);
                        this.render();
                    }
                    return;
                }

                // Flip (words only)
                if (this.type === 'words') {
                    const card = t.closest?.('.flip-card');
                    if (card) {
                        // Ignore clicks on inputs
                        if (t.tagName === 'INPUT' || t.tagName === 'BUTTON' || t.closest('label')) return;
                        card.classList.toggle('flipped');
                    }
                }
            };
        }
    },

    render() {
        if (!this.contentEl) return;

        // Update memorized counts
        const memMap = StorageManager.getReferenceMemorizedMap(this.type);
        const totalCount = this.allItems.length;
        const memCount = Object.keys(memMap).filter(k => memMap[k]).length;
        if (this.memCountEl) {
            this.memCountEl.textContent = `記憶済み ${memCount}/${totalCount}`;
        }

        const q = (this.searchEl?.value || '').trim().toLowerCase();
        const cat = this.categoryEl?.value || 'all';

        const hideMem = !!(this.hideMemEl && this.hideMemEl.checked);
        const filtered = this.allItems.filter(item => {
            const key = this.getItemKey(item);
            if (hideMem && key && StorageManager.isReferenceMemorized(this.type, key)) {
                return false;
            }
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

        const html = filtered.map((item, idx) => {
            const num = idx + 1;
            const key = this.getItemKey(item);
            const isMem = key ? StorageManager.isReferenceMemorized(this.type, key) : false;
            const catLabel = this.escape(item.category || '');

            if (this.type === 'words') {
                const supp = this.getWordSupplement(item);
                return `
                    <div class="ref-item card flip-card" data-item-key="${this.escape(key)}">
                        <div class="flip-inner">
                            <div class="flip-face flip-front">
                                <div class="ref-meta">
                                    <div class="ref-num">${num}</div>
                                    <div class="ref-badges">
                                        ${catLabel ? `<span class="ref-tag">${catLabel}</span>` : ''}
                                        <label class="mem-check" title="記憶済みにする">
                                            <input type="checkbox" data-action="toggle-mem" data-item-key="${this.escape(key)}" ${isMem ? 'checked' : ''}>
                                            <span>記憶</span>
                                        </label>
                                    </div>
                                </div>
                                <div class="ref-head">
                                    <div class="ref-main">${this.escape(item.word)}</div>
                                    <div class="ref-sub">${this.escape(item.meaning)}</div>
                                </div>
                                ${item.example ? `
                                <div class="ref-example">
                                    <div class="ref-example-head">
                                        <div class="muted">例文</div>
                                        <button class="example-audio-btn" data-action="play-example" data-text="${this.escape(item.example.en)}" type="button">🔊</button>
                                    </div>
                                    <div class="example-en">${this.escape(item.example.en)}</div>
                                    <div class="example-ja">${this.escape(item.example.ja)}</div>
                                </div>` : ''}
                            </div>

                            <div class="flip-face flip-back">
                                <div class="ref-back-title">補足情報</div>
                                <div class="ref-back-list">
                                    ${supp.map(r => `<div><strong>${this.escape(r.label)}:</strong> ${this.escape(r.value)}</div>`).join('')}
                                </div>
                                <div class="ref-back-hint">カードをタップすると表↔裏が切り替わります</div>
                            </div>
                        </div>
                    </div>
                `;
            }

            // phrases
            return `
                <div class="ref-item card" data-item-key="${this.escape(key)}">
                    <div class="ref-meta">
                        <div class="ref-num">${num}</div>
                        <div class="ref-badges">
                            ${catLabel ? `<span class="ref-tag">${catLabel}</span>` : ''}
                            <label class="mem-check" title="記憶済みにする">
                                <input type="checkbox" data-action="toggle-mem" data-item-key="${this.escape(key)}" ${isMem ? 'checked' : ''}>
                                <span>記憶</span>
                            </label>
                        </div>
                    </div>
                    <div class="ref-head">
                        <div class="ref-main">${this.escape(item.phrase)}</div>
                        <div class="ref-sub">${this.escape(item.meaning)}</div>
                    </div>
                    ${item.example ? `
                    <div class="ref-example">
                        <div class="ref-example-head">
                            <div class="muted">例文</div>
                            <button class="example-audio-btn" data-action="play-example" data-text="${this.escape(item.example.en)}" type="button">🔊</button>
                        </div>
                        <div class="example-en">${this.escape(item.example.en)}</div>
                        <div class="example-ja">${this.escape(item.example.ja)}</div>
                    </div>` : ''}
                </div>
            `;
        }).join('');

        this.contentEl.innerHTML = html;
    },

    getItemKey(item) {
        const key = this.type === 'words' ? item.word : item.phrase;
        return String(key || '').trim();
    },

    derivePos(category) {
        const c = String(category || '');
        if (c.includes('動詞')) return '動詞';
        if (c.includes('名詞')) return '名詞';
        if (c.includes('形容詞')) return '形容詞';
        if (c.includes('副詞')) return '副詞';
        if (c.includes('前置詞')) return '前置詞';
        if (c.includes('代名詞')) return '代名詞';
        if (c.includes('接続詞')) return '接続詞';
        return '（カテゴリから推定）';
    },

    // Provide light-weight supplemental info for the back side of word cards
    getWordSupplement(item) {
        const word = String(item.word || '').trim();
        const pos = this.derivePos(item.category);

        const rows = [];
        rows.push({ label: '品詞', value: pos });
        if (item.category) rows.push({ label: 'カテゴリ', value: String(item.category) });
        if (item.meaning) rows.push({ label: '意味', value: String(item.meaning) });

        // Simple conjugation hints for verbs
        if (pos === '動詞' && word) {
            const forms = this.deriveVerbForms(word);
            rows.push({ label: '三単現', value: forms.third });
            rows.push({ label: '進行形', value: forms.ing });
            rows.push({ label: '過去形', value: forms.past });
            rows.push({ label: '過去分詞', value: forms.pp });
            rows.push({ label: 'メモ', value: '不規則動詞は例外が多いので、必要なら例文と音声で確認しよう' });
        } else {
            rows.push({ label: '読み/発音', value: '🔊ボタンで確認できます' });
        }

        return rows;
    },

    deriveVerbForms(base) {
        const w = base.toLowerCase();

        const irregular = {
            be: { past: 'was / were', pp: 'been' },
            go: { past: 'went', pp: 'gone' },
            come: { past: 'came', pp: 'come' },
            get: { past: 'got', pp: 'got / gotten' },
            make: { past: 'made', pp: 'made' },
            do: { past: 'did', pp: 'done' },
            have: { past: 'had', pp: 'had' },
            take: { past: 'took', pp: 'taken' },
            give: { past: 'gave', pp: 'given' },
            see: { past: 'saw', pp: 'seen' },
            eat: { past: 'ate', pp: 'eaten' },
            drink: { past: 'drank', pp: 'drunk' },
            buy: { past: 'bought', pp: 'bought' },
            sell: { past: 'sold', pp: 'sold' },
            bring: { past: 'brought', pp: 'brought' },
            think: { past: 'thought', pp: 'thought' },
            know: { past: 'knew', pp: 'known' },
            speak: { past: 'spoke', pp: 'spoken' },
            write: { past: 'wrote', pp: 'written' },
            read: { past: 'read', pp: 'read' },
            run: { past: 'ran', pp: 'run' },
            swim: { past: 'swam', pp: 'swum' },
            begin: { past: 'began', pp: 'begun' },
            drive: { past: 'drove', pp: 'driven' },
            fall: { past: 'fell', pp: 'fallen' },
            feel: { past: 'felt', pp: 'felt' },
            find: { past: 'found', pp: 'found' },
            fly: { past: 'flew', pp: 'flown' },
            forget: { past: 'forgot', pp: 'forgotten' },
            grow: { past: 'grew', pp: 'grown' },
            hear: { past: 'heard', pp: 'heard' },
            keep: { past: 'kept', pp: 'kept' },
            leave: { past: 'left', pp: 'left' },
            meet: { past: 'met', pp: 'met' },
            pay: { past: 'paid', pp: 'paid' },
            put: { past: 'put', pp: 'put' },
            say: { past: 'said', pp: 'said' },
            send: { past: 'sent', pp: 'sent' },
            sit: { past: 'sat', pp: 'sat' },
            sleep: { past: 'slept', pp: 'slept' },
            stand: { past: 'stood', pp: 'stood' },
            teach: { past: 'taught', pp: 'taught' },
            tell: { past: 'told', pp: 'told' },
            understand: { past: 'understood', pp: 'understood' },
            wear: { past: 'wore', pp: 'worn' },
            win: { past: 'won', pp: 'won' }
        };

        const third = this.toThirdPerson(w);
        const ing = this.toIng(w);

        let past = this.toPast(w);
        let pp = past;
        if (irregular[w]) {
            past = irregular[w].past;
            pp = irregular[w].pp;
        }

        return { third, ing, past, pp };
    },

    toThirdPerson(w) {
        if (w.endsWith('s') || w.endsWith('x') || w.endsWith('z') || w.endsWith('ch') || w.endsWith('sh')) {
            return `${w}es`;
        }
        if (w.endsWith('y') && !'aeiou'.includes(w[w.length - 2] || '')) {
            return `${w.slice(0, -1)}ies`;
        }
        return `${w}s`;
    },

    toIng(w) {
        if (w.endsWith('ie')) return `${w.slice(0, -2)}ying`;
        if (w.endsWith('e') && !w.endsWith('ee')) return `${w.slice(0, -1)}ing`;
        return `${w}ing`;
    },

    toPast(w) {
        if (w.endsWith('e')) return `${w}d`;
        if (w.endsWith('y') && !'aeiou'.includes(w[w.length - 2] || '')) {
            return `${w.slice(0, -1)}ied`;
        }
        return `${w}ed`;
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
