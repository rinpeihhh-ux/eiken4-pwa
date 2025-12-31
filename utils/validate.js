// Validation Utility (non-blocking, single-pass)
//
// 目的:
// - 生成済みデータに対して“2重チェック”のうちUI側で確認できる要約を出す
// - 無限ループを避けるため、fetch→解析→表示の1回で終了する

const ValidationManager = {
  cache: null,

  async loadRankReport() {
    if (this.cache) return this.cache;
    try {
      const res = await fetch('data/validation_rank_words.json');
      if (!res.ok) throw new Error('validation file not found');
      const data = await res.json();
      this.cache = data;
      return data;
    } catch (e) {
      // If missing (older builds), just ignore
      console.warn('Validation report unavailable:', e);
      this.cache = null;
      return null;
    }
  },

  // For reference screens
  async getSummaryFor(type) {
    // Only rank lists have report entries
    const fileMap = {
      rankA: 'rankA_words.json',
      rankB: 'rankB_words.json',
      rankC: 'rankC_words.json'
    };
    const fname = fileMap[type];
    if (!fname) return null;

    const report = await this.loadRankReport();
    if (!report || !report.files || !report.files[fname]) return null;
    return report.files[fname];
  }
};
