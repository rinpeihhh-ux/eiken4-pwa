// Audio Utility for speech synthesis and playback

const AudioManager = {
    // Current speech synthesis instance
    synthesis: window.speechSynthesis,
    currentUtterance: null,
    speed: 1.0,

    // Simple sound effects (Web Audio)
    sfxCtx: null,

    // Initialize with settings
    init(speed = 1.0) {
        this.speed = speed;
    },

    // Ensure WebAudio context is created and resumed (iOS requires user gesture)
    ensureSfxContext() {
        try {
            if (!this.sfxCtx) {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return null;
                this.sfxCtx = new Ctx();
            }
            if (this.sfxCtx.state === 'suspended') {
                // Resume must be called from a user gesture; if not, it will silently fail.
                this.sfxCtx.resume().catch(() => {});
            }
            return this.sfxCtx;
        } catch (e) {
            console.warn('SFX context init failed:', e);
            return null;
        }
    },

    // Play a tiny feedback sound
    playSfx(type = 'correct') {
        const ctx = this.ensureSfxContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        gain.connect(ctx.destination);

        const osc = ctx.createOscillator();
        osc.type = type === 'incorrect' ? 'sawtooth' : 'sine';

        if (type === 'incorrect') {
            // Low descending buzz
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);
        } else {
            // Short two-tone chime
            osc.frequency.setValueAtTime(740, now);
            osc.frequency.setValueAtTime(880, now + 0.12);
        }

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.26);
    },

    // Speak text using Web Speech API
    speak(text, lang = 'en-US') {
        return new Promise((resolve, reject) => {
            // Cancel any ongoing speech
            this.stop();

            // Create new utterance
            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = lang;
            this.currentUtterance.rate = this.speed;
            this.currentUtterance.pitch = 1.0;
            this.currentUtterance.volume = 1.0;

            // Event handlers
            this.currentUtterance.onend = () => {
                resolve();
            };

            this.currentUtterance.onerror = (error) => {
                console.error('Speech error:', error);
                reject(error);
            };

            // Speak
            this.synthesis.speak(this.currentUtterance);
        });
    },

    // Stop current speech
    stop() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
    },

    // Set speech speed
    setSpeed(speed) {
        this.speed = speed;
    },

    // Get available voices
    getVoices() {
        return this.synthesis.getVoices();
    },

    // Speak English text
    speakEnglish(text) {
        return this.speak(text, 'en-US');
    },

    // Speak Japanese text
    speakJapanese(text) {
        return this.speak(text, 'ja-JP');
    },

    // Check if speech is supported
    isSupported() {
        return 'speechSynthesis' in window;
    }
};

// Wait for voices to be loaded
if (AudioManager.isSupported()) {
    window.speechSynthesis.onvoiceschanged = () => {
        console.log('Voices loaded:', AudioManager.getVoices().length);
    };
}
