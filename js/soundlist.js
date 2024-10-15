
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
    #source;
    // The general volume.
    #master;
    // The sound indexes in the audio buffer array.
    #soundIndexes = {kick: 2, snare: 0, hihat: 1};

    constructor() {
    }

    #getOscillator() {
        // Create an oscillator.
        const oscillator = this.#audioContext.createOscillator();
        oscillator.connect(this.#audioContext.destination);

        return oscillator;
    }

    #delay(time, feedbackValue) {
        const delay =  this.#audioContext.createDelay();
        this.#source.connect(delay);
        delay.delayTime.value = time;
        const feedback = this.#audioContext.createGain();
        feedback.gain.value = feedbackValue;
        feedback.connect(delay);
        delay.connect(feedback);
        delay.connect(this.#master);
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
    play(index, time, parameters) {
        const audioBuffer = this.#audioBuffers[index];
        // Create a sound source.
        this.#source = this.#audioContext.createBufferSource();
        // Tell the source which sound to play.
        this.#source.buffer = audioBuffer;
        // Create a gain node.
        this.#master = this.#audioContext.createGain();
        // Connect the source to the gain node.
        this.#source.connect(this.#master);
        // Connect the gain node to the context's destination (the speakers).
        this.#master.connect(this.#audioContext.destination);
        // Set the volume for this sound.
        this.#master.gain.value = parameters.volume;

        this.#delay(parameters.delay, parameters.feedback);

        // Play the sound.
        this.#source.start(time);
    }

    playOscillator(time, parameters, frequency) {
        // Set frequency (default 440 hz).
        frequency = frequency !== undefined ? frequency : 440.0;

        this.#oscillator = this.#getOscillator();
        this.#oscillator.frequency.value = frequency;

        const gainNode = this.#audioContext.createGain();
        this.#oscillator.connect(gainNode);
        gainNode.connect(this.#audioContext.destination);
        // Oscillator volume uses negative numbers, so the given volume value is converted accordingly.
        gainNode.gain.value = parameters.volume - 1;

        // Play sound.
        this.#oscillator.start(time);
        // Stop sound after note length.
        this.#oscillator.stop(time + this.#noteLength);
    }

    getSoundIndexes() {
        return this.#soundIndexes;
    }
}
