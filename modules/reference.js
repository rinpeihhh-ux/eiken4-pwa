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
    validateEl: null,
    validateState: null,

    async init(type) {
        this.type = type;
        this.allItems = [];
        this.categories = [];

        this.hideMemEl = null;
        this.memCountEl = null;
        this.validateEl = null;
        this.validateState = null;

        if (type !== 'phrases') {
            this.searchEl = document.getElementById('freq-words-search');
            this.categoryEl = document.getElementById('freq-words-category');
            this.contentEl = document.getElementById('freq-words-content');
            this.hideMemEl = document.getElementById('freq-words-hide-memorized');
            this.memCountEl = document.getElementById('freq-words-mem-count');
            this.validateEl = document.getElementById('freq-words-validate');
        } else {
            this.searchEl = document.getElementById('freq-phrases-search');
            this.categoryEl = document.getElementById('freq-phrases-category');
            this.contentEl = document.getElementById('freq-phrases-content');
            this.hideMemEl = document.getElementById('freq-phrases-hide-memorized');
            this.memCountEl = document.getElementById('freq-phrases-mem-count');
            this.validateEl = document.getElementById('freq-phrases-validate');
        }

        // Update title & UI for word reference screen
        if (type !== 'phrases') {
            const titleEl = document.getElementById('freq-words-title');
            if (titleEl) {
                const titleMap = {
                    words: '単語（参照用）',
                    rankA: '最頻出単語（参照用）',
                    rankB: '頻出単語（参照用）',
                    rankC: 'よく出る単語（参照用）'
                };
                titleEl.textContent = titleMap[type] || '単語（参照用）';
            }

            // For rank lists, hide category dropdown (CSV-based words have no reliable POS categories)
            if (this.categoryEl) {
                if (type === 'rankA' || type === 'rankB' || type === 'rankC') {
                    this.categoryEl.classList.add('hidden');
                    this.categoryEl.value = 'all';
                } else {
                    this.categoryEl.classList.remove('hidden');
                }
            }

            // Update search placeholder per list
            if (this.searchEl) {
                this.searchEl.placeholder = '検索（例：go / 行く）';
                if (type === 'rankA') this.searchEl.placeholder = '検索（例：I / 私）';
                if (type === 'rankB') this.searchEl.placeholder = '検索（例：play / 遊ぶ）';
                if (type === 'rankC') this.searchEl.placeholder = '検索（例：mountain / 山）';
            }
        }

        if (!this.contentEl) return;

        this.contentEl.innerHTML = '<div class="loading">読み込み中...</div>';

        try {
            let dataFile = 'data/frequent_words.json';
            if (type === 'phrases') dataFile = 'data/frequent_phrases.json';
            if (type === 'rankA') dataFile = 'data/rankA_words.json';
            if (type === 'rankB') dataFile = 'data/rankB_words.json';
            if (type === 'rankC') dataFile = 'data/rankC_words.json';
            const response = await fetch(dataFile);
            const data = await response.json();
            this.allItems = (data.items || []).map((it, idx) => ({ ...it, _no: (it._no ?? (idx + 1)) }));
            this.categories = Array.from(new Set(this.allItems.map(i => i.category).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'ja'));

            this.populateCategories();
            this.bindEvents();

            // 2重チェック（検証レポートの要約表示）: rankA/B/Cのみ
            this.updateValidationBanner();
            this.render();
        } catch (e) {
            console.error(e);
            this.contentEl.innerHTML = '<div class="error">読み込みに失敗しました。オフラインの場合は一度オンラインで開いてください。</div>';
        }
    },

    async updateValidationBanner() {
        if (!this.validateEl) return;
        // phrases screen: nothing to validate here
        if (this.type === 'phrases') {
            this.validateEl.innerHTML = '';
            return;
        }
        // rank lists only
        if (!(this.type === 'rankA' || this.type === 'rankB' || this.type === 'rankC')) {
            this.validateEl.innerHTML = '';
            return;
        }

        // Non-blocking UI
        this.validateEl.textContent = '自動チェック: 読み込み中...';
        try {
            const sum = await ValidationManager.getSummaryFor(this.type);
            if (!sum || !sum.counts) {
                this.validateEl.textContent = '';
                return;
            }
            const total = sum.counts.total ?? 0;
            const issues = sum.counts.issues ?? 0;
            if (issues === 0) {
                this.validateEl.innerHTML = `<span class="ok">自動チェック: OK</span> <span class="muted">（${total}件）</span>`;
            } else {
                this.validateEl.innerHTML = `<span class="warn">自動チェック: 要確認 ${issues}件</span> <span class="muted">（${total}件中）</span>`;
            }
        } catch (e) {
            console.warn(e);
            this.validateEl.textContent = '';
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
                if (this.type !== 'phrases') {
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
        const memCount = this.allItems.filter(it => {
            const key = this.getItemKey(it);
            return key ? StorageManager.isReferenceMemorized(this.type, key) : false;
        }).length;
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

            const hay = this.type !== 'phrases'
                ? `${item.word} ${item.meaning} ${item.example?.en || ''} ${item.example?.ja || ''}`
                : `${item.phrase} ${item.meaning} ${item.example?.en || ''} ${item.example?.ja || ''}`;

            return hay.toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
            this.contentEl.innerHTML = '<div class="empty">該当する項目がありません。</div>';
            return;
        }

        const html = filtered.map((item, idx) => {
            const num = (item._no ?? (idx + 1));
            const key = this.getItemKey(item);
            const safeKey = key ? this.escape(key) : '';
            const isMem = key ? StorageManager.isReferenceMemorized(this.type, key) : false;
            const catLabel = this.escape(item.category || '');

            if (this.type !== 'phrases') {
                const posLabel = this.escape(item.pos || (item?.info?.pos || ''));
                const suppRows = this.getWordSupplement(item) || [];
                const suppHtml = suppRows.map(r => `
                    <div><strong>${this.escape(r.label)}:</strong> ${this.escape(r.value)}</div>
                `).join('');

return `
                    <div class="ref-item card flip-card" data-item-key="${safeKey}">
                        <div class="flip-inner">
                            <div class="flip-face flip-front">
                                <div class="ref-meta">
                                    <div class="ref-num">${num}</div>
                                    <div class="ref-badges">
                                        ${catLabel ? `<span class="ref-tag">${catLabel}</span>` : ''}
                                        ${posLabel ? `<span class="ref-tag">${posLabel}</span>` : ''}
                                        <label class="mem-check" title="記憶済みにする">
                                            <input type="checkbox" data-action="toggle-mem" data-item-key="${safeKey}" ${isMem ? 'checked' : ''}>
                                            <span>記憶</span>
                                        </label>
                                    </div>
                                </div>

                                <div class="ref-head">
                                    <div class="ref-main">${this.escape(item.word)}</div>
                                    <div class="ref-sub">${this.escape(item.meaning)}</div>
                                    ${posLabel ? `<div class="ref-sub ref-pos">品詞: ${posLabel}</div>` : ''}
                                </div>

                                ${item.example ? `
                                <div class="ref-example">
                                    <div class="ref-example-head">
                                        <div class="muted">例文</div>
                                        <button class="example-audio-btn" data-action="play-example" data-text="${this.escape(item.example.en)}" type="button" title="例文を再生">🔊</button>
                                    </div>
                                    <div class="example-en">${this.escape(item.example.en)}</div>
                                    <div class="example-ja">${this.escape(item.example.ja)}</div>
                                </div>` : ''}

                                <div class="ref-back-hint">カードをタップすると裏返ります</div>
                            </div>

                            <div class="flip-face flip-back">
                                <div class="ref-meta">
                                    <div class="ref-num">${num}</div>
                                    <div class="ref-badges">
                                        ${catLabel ? `<span class="ref-tag">${catLabel}</span>` : ''}
                                        <label class="mem-check" title="記憶済みにする">
                                            <input type="checkbox" data-action="toggle-mem" data-item-key="${safeKey}" ${isMem ? 'checked' : ''}>
                                            <span>記憶</span>
                                        </label>
                                    </div>
                                </div>

                                <div class="ref-back-title">補足情報</div>
                                <div class="ref-back-list">
                                    ${suppHtml || '<div class="muted">補足情報はありません。</div>'}
                                </div>

                                <div class="ref-back-hint">もう一度タップで表に戻ります</div>
                            </div>
                        </div>
                    </div>
                `;
            }

            // phrases
            return `
                <div class="ref-item card" data-item-key="${safeKey}">
                    <div class="ref-meta">
                        <div class="ref-num">${num}</div>
                        <div class="ref-badges">
                            ${catLabel ? `<span class="ref-tag">${catLabel}</span>` : ''}
                            <label class="mem-check" title="記憶済みにする">
                                <input type="checkbox" data-action="toggle-mem" data-item-key="${safeKey}" ${isMem ? 'checked' : ''}>
                                <span>記憶</span>
                            </label>
                        </div>
                    </div>
                    <div class="ref-head">
                        <div class="ref-main">${this.escape(item.phrase)}</div>
                        <div class="ref-sub">${this.escape(item.meaning)}</div>
                                    ${posLabel ? `<div class="ref-sub ref-pos">品詞: ${posLabel}</div>` : ''}
                    </div>
                    ${item.example ? `
                    <div class="ref-example">
                        <div class="ref-example-head">
                            <div class="muted">例文</div>
                            <button class="example-audio-btn" data-action="play-example" data-text="${this.escape(item.example.en)}" type="button" title="例文を再生">🔊</button>
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
        const key = (this.type === 'phrases') ? item.phrase : item.word;
        return String(key || '').trim();
    },

    derivePos(word, category) {
        const w = String(word || '').trim().toLowerCase();
        // Use safe POS from data when available
        // (rank lists generated from CSV may include item.info.pos)
        if (w) {
            const safe = (this._posSafeMap && this._posSafeMap[w]) ? this._posSafeMap[w] : null;
            if (safe) return safe;
        }

        const c = String(category || '');
        if (c.includes('動詞')) return '動詞';
        if (c.includes('名詞')) return '名詞';
        if (c.includes('形容詞')) return '形容詞';
        if (c.includes('副詞')) return '副詞';
        if (c.includes('前置詞')) return '前置詞';
        if (c.includes('代名詞')) return '代名詞';
        if (c.includes('接続詞')) return '接続詞';
        return '不明';
    },

    // Provide light-weight supplemental info for the back side of word cards
    getWordSupplement(item) {
        // 裏面には、Excelの列G/H/Iの情報をそのまま表示する（推測で生成しない）
        const info = item && item.info ? item.info : {};
        const rows = [];

        const inf = (info.inflections !== undefined) ? String(info.inflections).trim() : '';
        const syn = (info.syn_ant !== undefined) ? String(info.syn_ant).trim() : '';
        const adv = (info.advice !== undefined) ? String(info.advice).trim() : '';

        rows.push({ label: '活用変化', value: inf || '-' });
        rows.push({ label: '類義語・反意語', value: syn || '-' });
        rows.push({ label: '学習アドバイス/豆知識', value: adv || '-' });

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
        const base = String(w || '').toLowerCase();

        // Common irregular present forms
        const irregular = {
            be: 'is',
            have: 'has',
            do: 'does',
            go: 'goes'
        };
        if (irregular[base]) return irregular[base];

        // -s, -x, -ch, -sh -> -es
        if (base.endsWith('s') || base.endsWith('x') || base.endsWith('ch') || base.endsWith('sh')) {
            return `${base}es`;
        }

        // -z: quiz -> quizzes, buzz -> buzzes
        if (base.endsWith('z')) {
            if (base.endsWith('zz')) return `${base}es`;
            return `${base}zes`;
        }

        // consonant + y -> ies
        if (base.endsWith('y') && base.length >= 2 && !'aeiou'.includes(base[base.length - 2])) {
            return `${base.slice(0, -1)}ies`;
        }

        // verbs ending with -o typically take -es (go -> goes, do handled above)
        if (base.endsWith('o')) {
            return `${base}es`;
        }

        return `${base}s`;
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
