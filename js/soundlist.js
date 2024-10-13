
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
    play(index, time, volume) {
        const audioBuffer = this.#audioBuffers[index];
        // Create a sound source.
        const soundSource = this.#audioContext.createBufferSource();
        // Tell the source which sound to play.
        soundSource.buffer = audioBuffer;
        // Create a gain node.
        const gainNode = this.#audioContext.createGain();
        // Connect the source to the gain node.
        soundSource.connect(gainNode);
        // Connect the gain node to the context's destination (the speakers).
        gainNode.connect(this.#audioContext.destination);
        // Set the volume for this sound.
        gainNode.gain.value = volume;
        // Play the sound.
        soundSource.start(time);
    }

    playOscillator(time, volume, frequency) {
        // Set frequency (default 440 hz).
        frequency = frequency !== undefined ? frequency : 440.0;

        this.#oscillator = this.#getOscillator();
        this.#oscillator.frequency.value = frequency;

        const gainNode = this.#audioContext.createGain();
        this.#oscillator.connect(gainNode);
        gainNode.connect(this.#audioContext.destination);
        // Oscillator volume uses negative numbers, so the given volume value is converted accordingly.
        gainNode.gain.value = volume - 1;

        // Play sound.
        this.#oscillator.start(time);
        // Stop sound after note length.
        this.#oscillator.stop(time + this.#noteLength);
    }
}
