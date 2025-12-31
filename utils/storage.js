// Storage Utility for managing user progress and settings

const StorageManager = {
    // Keys
    KEYS: {
        PROGRESS: 'eiken4_progress',
        SETTINGS: 'eiken4_settings',
        EXAM_RESULTS: 'eiken4_exam_results',
        WRONG_ANSWERS: 'eiken4_wrong_answers',
        REF_WORDS_MEM: 'eiken4_ref_words_mem',
        REF_PHRASES_MEM: 'eiken4_ref_phrases_mem'
    },

    // Curriculum reference (set by app.js)
    curriculum: null,

    setCurriculum(curriculum) {
        this.curriculum = curriculum;
    },

    // Initialize default progress structure
    initProgress() {
        const progress = this.getProgress();
        if (!progress) {
            const defaultProgress = {
                days: {},
                overallProgress: 0,
                preStudyCompleted: false,
                lastAccessed: new Date().toISOString()
            };

            // Initialize all days
            for (let i = 1; i <= 10; i++) {
                defaultProgress.days[`day${i}`] = {
                    completed: false,
                    sections: {
                        vocabulary: false,
                        grammar: false,
                        listening: false,
                        reading: false
                    },
                    scores: {}
                };
            }

            this.saveProgress(defaultProgress);
            return defaultProgress;
        }
        // Migration for older saved data
        if (progress.preStudyCompleted === undefined) {
            progress.preStudyCompleted = false;
            this.saveProgress(progress);
        }
        return progress;
    },

    // Get progress from localStorage
    getProgress() {
        try {
            const data = localStorage.getItem(this.KEYS.PROGRESS);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading progress:', error);
            return null;
        }
    },

    // Save progress to localStorage
    saveProgress(progress) {
        try {
            progress.lastAccessed = new Date().toISOString();
            localStorage.setItem(this.KEYS.PROGRESS, JSON.stringify(progress));
            return true;
        } catch (error) {
            console.error('Error saving progress:', error);
            return false;
        }
    },

    // Set pre-study completion flag
    setPreStudyCompleted(isCompleted) {
        const progress = this.getProgress() || this.initProgress();
        progress.preStudyCompleted = !!isCompleted;
        this.saveProgress(progress);
        return true;
    },



    // Update a specific day's section
    updateDaySection(dayNum, section, completed = true, score = null) {
        // Ensure progress object exists (Safari/PWA can occasionally return null)
        const progress = this.getProgress() || this.initProgress();
        const dayKey = `day${dayNum}`;

        try {

        if (progress.days[dayKey]) {
            progress.days[dayKey].sections[section] = completed;

            if (score !== null) {
                progress.days[dayKey].scores[section] = score;
            }

            // Check if all sections defined in curriculum for this day are completed
            if (this.curriculum) {
                const dayData = this.curriculum.find(d => d.day === dayNum);

                if (dayData) {
                    const requiredSections = dayData.sections.map(s => s.id);
                    const allRequiredCompleted = requiredSections.every(
                        sectionId => progress.days[dayKey].sections[sectionId] === true
                    );
                    progress.days[dayKey].completed = allRequiredCompleted;
                }
            } else {
                // Fallback: check all sections
                const sections = progress.days[dayKey].sections;
                progress.days[dayKey].completed = Object.values(sections).every(s => s === true);
            }

            // Update overall progress
            const completedDays = Object.values(progress.days).filter(d => d.completed).length;
            progress.overallProgress = (completedDays / 10) * 100;

            this.saveProgress(progress);
        }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    },

    // Get settings
    getSettings() {
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (error) {
            console.error('Error reading settings:', error);
            return this.getDefaultSettings();
        }
    },

    // Get default settings
    getDefaultSettings() {
        return {
            audioSpeed: 1.0,
            fontSize: 'normal'
        };
    },

    // Save settings
    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    },

    // Save exam results
    saveExamResult(result) {
        try {
            const results = this.getExamResults();
            results.push({
                ...result,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem(this.KEYS.EXAM_RESULTS, JSON.stringify(results));
            return true;
        } catch (error) {
            console.error('Error saving exam result:', error);
            return false;
        }
    },

    // Get exam results
    getExamResults() {
        try {
            const data = localStorage.getItem(this.KEYS.EXAM_RESULTS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading exam results:', error);
            return [];
        }
    },

    // Reset all data
    resetAll() {
        try {
            localStorage.removeItem(this.KEYS.PROGRESS);
            localStorage.removeItem(this.KEYS.SETTINGS);
            localStorage.removeItem(this.KEYS.EXAM_RESULTS);
            localStorage.removeItem(this.KEYS.WRONG_ANSWERS);
            localStorage.removeItem(this.KEYS.REF_WORDS_MEM);
            localStorage.removeItem(this.KEYS.REF_PHRASES_MEM);
            return true;
        } catch (error) {
            console.error('Error resetting data:', error);
            return false;
        }
    },

    // ------------------------------
    // Reference memorized helpers
    // ------------------------------
    getReferenceMemorizedMap(type) {
        const key = type === 'phrases' ? this.KEYS.REF_PHRASES_MEM : this.KEYS.REF_WORDS_MEM;
        try {
            const raw = localStorage.getItem(key);
            const obj = raw ? JSON.parse(raw) : {};
            return (obj && typeof obj === 'object') ? obj : {};
        } catch (e) {
            console.error('Error reading reference memorized map:', e);
            return {};
        }
    },

    setReferenceMemorizedMap(type, mapObj) {
        const key = type === 'phrases' ? this.KEYS.REF_PHRASES_MEM : this.KEYS.REF_WORDS_MEM;
        try {
            localStorage.setItem(key, JSON.stringify(mapObj || {}));
            return true;
        } catch (e) {
            console.error('Error saving reference memorized map:', e);
            return false;
        }
    },

    setReferenceMemorized(type, itemKey, isMemorized) {
        const map = this.getReferenceMemorizedMap(type);
        if (isMemorized) {
            map[itemKey] = true;
        } else {
            delete map[itemKey];
        }
        return this.setReferenceMemorizedMap(type, map);
    },

    isReferenceMemorized(type, itemKey) {
        const map = this.getReferenceMemorizedMap(type);
        return !!map[itemKey];
    },

    // Get wrong answers
    getWrongAnswers() {
        try {
            const data = localStorage.getItem(this.KEYS.WRONG_ANSWERS);
            return data ? JSON.parse(data) : {
                vocabulary: [],
                grammar: [],
                listening: [],
                reading: []
            };
        } catch (error) {
            console.error('Error reading wrong answers:', error);
            return {
                vocabulary: [],
                grammar: [],
                listening: [],
                reading: []
            };
        }
    },

    // Add wrong answer
    addWrongAnswer(type, questionId) {
        try {
            const wrongAnswers = this.getWrongAnswers();
            if (!wrongAnswers[type].includes(questionId)) {
                wrongAnswers[type].push(questionId);
                localStorage.setItem(this.KEYS.WRONG_ANSWERS, JSON.stringify(wrongAnswers));
            }
            return true;
        } catch (error) {
            console.error('Error adding wrong answer:', error);
            return false;
        }
    },

    // Remove wrong answer (when answered correctly in review)
    removeWrongAnswer(type, questionId) {
        try {
            const wrongAnswers = this.getWrongAnswers();
            wrongAnswers[type] = wrongAnswers[type].filter(id => id !== questionId);
            localStorage.setItem(this.KEYS.WRONG_ANSWERS, JSON.stringify(wrongAnswers));
            return true;
        } catch (error) {
            console.error('Error removing wrong answer:', error);
            return false;
        }
    },

    // Get statistics for wrong answers
    getWrongAnswersStats() {
        const wrongAnswers = this.getWrongAnswers();
        return {
            vocabulary: wrongAnswers.vocabulary.length,
            grammar: wrongAnswers.grammar.length,
            listening: wrongAnswers.listening.length,
            reading: wrongAnswers.reading.length,
            total: wrongAnswers.vocabulary.length + wrongAnswers.grammar.length +
                wrongAnswers.listening.length + wrongAnswers.reading.length
        };
    }
};
