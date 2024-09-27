
class SoundList {
    // The Web Audio Context.
    #audioContext = null;
    // Default sound duration.
    #noteLength = 0.05;
    #oscillator;
    // Paths to the audio files. 
    #files = ['samples/808snare.wav', 'samples/808hihat.wav', 'samples/808kick.wav'];
    // The audio buffers to store sounds.
    #audioBuffers = [];

    constructor() {
    }

    #getOscillator() {
        // Create an oscillator.
        const oscillator = this.#audioContext.createOscillator();
        oscillator.connect(this.#audioContext.destination);

        return oscillator;
    }

    #playOscillator(time, frequency) {
        // Set frequency (default 440 hz).
        frequency = frequency !== undefined ? frequency : 440.0;

        this.#oscillator = this.#getOscillator();
        this.#oscillator.frequency.value = frequency;

        // Play sound.
        this.#oscillator.start(time);
        // Stop sound after note length.
        this.#oscillator.stop(time + this.#noteLength);
    }

    /*
     * Asynchronous function that loads the given audio file and returns its decoded audio data.
     */
    async #getFile(file) {
        // Fetch audio file.
        const response = await fetch(file);
        // Put the audio data into a buffer.
        const arrayBuffer = await response.arrayBuffer();
        // Decode the audio data currently in the buffer.
        const audioBuffer = await this.#audioContext.decodeAudioData(arrayBuffer);

        return audioBuffer;
    }

    async setupSounds(audioContext) {
        this.#audioContext = audioContext;

        // Iterate each audio file.
        for (const file of this.#files) {
            // Get the sound (ie: the decoded audio data) from the audio file.
            const sound = await this.#getFile(file);
            // Store the sound.
            this.#audioBuffers.push(sound);
        }
    }

    /*
     * Play a given sound from the audio buffers.
     */
    play(index, time) {
        const audioBuffer = this.#audioBuffers[index];
        // Create a sound source.
        const soundSource = this.#audioContext.createBufferSource();
        // Tell the source which sound to play.
        soundSource.buffer = audioBuffer;
        // Connect the source to the context's destination (the speakers).
        soundSource.connect(this.#audioContext.destination);
        // Play the sound.
        soundSource.start(time);
    }
}
