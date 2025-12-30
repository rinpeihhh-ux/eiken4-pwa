// Audio Utility for speech synthesis and playback

const AudioManager = {
    // Current speech synthesis instance
    synthesis: window.speechSynthesis,
    currentUtterance: null,
    speed: 1.0,

    // Initialize with settings
    init(speed = 1.0) {
        this.speed = speed;
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
