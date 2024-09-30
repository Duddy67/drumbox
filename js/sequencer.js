/*
 * The Chris Wilson's program slighly modified and reshaped in OOP.
 * https://web.dev/articles/audio-scheduling
 */

class Sequencer {
    // The Web Audio Context.
    #audioContext = null;
    // Used by iOS devices. 
    #unlocked = false;
    // The worker used to manage the timing system. 
    #timeWorker;
    // Start/Stop flag.
    #isPlaying = false;
    // Default tempo in beat per minute (bpm).
    #tempo = 120.0; 
    // When the next note is due (sec).
    #nextNoteTime = 0.0; 
    // What note is currently last scheduled ?
    #current16thNote; 
    // The notes that have been put into the web audio and may or may not have played yet. {note, time}
    #notesInQueue = []; 
    // 0 == 16th, 1 == 8th, 2 == quarter note
    #noteResolution = 0; 
    // How far ahead to schedule audio (sec)
    #scheduleAheadTime = 0.1;
    // Length of "beep" (in seconds).
    #noteLength = 0.05; 
    // How frequently to call scheduling function (in milliseconds).
    #lookahead = 25.0;
    // The last "box" drawn on the screen.
    #last16thNoteDrawn = -1;
    #soundList;
    #trackList;

    constructor(soundList, trackList) {
        // Start the drawing loop.
        window.requestAnimationFrame(this.#draw);
        // Create a worker.
        this.#setupTimeWorker();

        this.#soundList = soundList;
        this.#trackList = trackList;
    }

    #setupTimeWorker() {
        // Check first the Worker class is available.
        if (window.Worker) {
            this.#timeWorker = new Worker('js/timeworker.js');
        }
        else {
            console.log('Web Worker not available.');
        }

        const app = this;

        // Listen to the messages sent by the worker. 
        this.#timeWorker.onmessage = function(e) {
            console.log('Message received from Worker: ' + e.data);

            if (app.#isPlaying) {
                app.#scheduler();
            }
        }
    }

    /*
     * Advance current note and time by a 16th note.
     */
    #nextNote() {
        // Picks up the CURRENT tempo value to calculate beat length.
        const secondsPerBeat = 60.0 / this.#tempo; 
        // Add 1/4 of quarter-note beat length to time.
        this.#nextNoteTime += 0.25 * secondsPerBeat; 
        // Advance the beat number.
        this.#current16thNote++; 

        // Reset to zero once the 16th note is reached.
        if (this.#current16thNote == 16) {
            this.#current16thNote = 0;
        }
    }

    #scheduleNote(beatNumber, time) {
        // Push the note on the queue, even if we're not playing.
        this.#notesInQueue.push({note: beatNumber, time: time});

        if (this.#noteResolution == 1 && beatNumber % 2) {
            // Don't play non-8th 16th notes.
            return;
        }

        if (this.#noteResolution == 2 && beatNumber % 4) {
            // Don't play non-quarter 8th notes.
            return;
        }

        // Check the beat number for each track step. 

        if (this.#trackList.getTracks('snare').steps[beatNumber]) {
            this.#soundList.play(0, time);
        }

        if (this.#trackList.getTracks('kick').steps[beatNumber]) {
            this.#soundList.play(2, time);
        }

        if (this.#trackList.getTracks('hihat').steps[beatNumber]) {
            this.#soundList.play(1, time);
        }

        if (this.#trackList.getTracks('cowbell').steps[beatNumber]) {
            this.#soundList.playOscillator(time);
        }
    }

    #scheduler() {
      // While there are notes that will need to play before the next interval,
      // schedule them and advance the pointer.
      while (this.#nextNoteTime < this.#audioContext.currentTime + this.#scheduleAheadTime) {
          this.#scheduleNote(this.#current16thNote, this.#nextNoteTime);
          this.#nextNote();
      }
    }

    // Declare draw() as an arrow function or 'this' won't be available. 
    // Note: The requestAnimationFrame's timestamp parameter is not used here. 
    //       Instead, the audio system clock (currentTime) is used to keep track of time.  
    #draw = (timestamp) => {
        let currentNote = this.#last16thNoteDrawn;

        if (this.#audioContext) {
            let currentTime = this.#audioContext.currentTime;

            while (this.#notesInQueue.length && this.#notesInQueue[0].time < currentTime) {
                currentNote = this.#notesInQueue[0].note;
                // Remove note from queue.
                this.#notesInQueue.splice(0, 1);
            }

            // Draw only if the note has moved.
            if (this.#last16thNoteDrawn != currentNote) {
                const noteValue = currentNote % 4 ? '16th' : '4th';
                // Turn off the previous step button.
                this.#resetStepButtons();

                for (let i = 0; i < this.#trackList.getTracks().length; i++) {
                    const track = this.#trackList.getTracks()[i];
                    if (track.steps[currentNote]) {
                        //document.getElementById('step-' + i + '-' + currentNote).classList.add('blink-' + noteValue);
                        document.getElementById('LED-' + i + '-' + currentNote).classList.add('blinking');
                    }
                }

                this.#last16thNoteDrawn = currentNote;
            }
        }

        // The box is not playing and one or more LEDs are on.
        if (!this.#isPlaying && document.querySelectorAll('.blinking').length) {
            this.#resetStepButtons();
        }

        window.requestAnimationFrame(this.#draw);
    }

    /*
     * Turns off step buttons. 
     */
    #resetStepButtons() {
        const blinkingLEDs = document.querySelectorAll('.blinking');

        for (let i = 0; i < blinkingLEDs.length; i++) {
            blinkingLEDs[i].classList.remove('blinking');
        }
    }

    start() {
        // Create an audio context if it doesn't exist.
        if (!this.#audioContext) {
            this.#audioContext = new AudioContext();

            // Load the audio files asynchronously.
            this.#soundList.setupSounds(this.#audioContext).then((response) => {
                console.log('Loading sound files...');
                // Start again once all the audio files are loaded.
                this.start();
            });

            return;
        }

        // iOS devices lock the audio context for sake of security.
        // It has to be unlocked first in order to use it.
        if (!this.#unlocked) {
            // Play silent buffer to unlock the audio
            let buffer = this.#audioContext.createBuffer(1, 1, 22050);
            let node = this.#audioContext.createBufferSource();
            node.buffer = buffer;
            node.start(0);
            this.#unlocked = true;
        }

        this.#isPlaying = true;
        this.#current16thNote = 0;
        this.#nextNoteTime = this.#audioContext.currentTime;
        this.#timeWorker.postMessage('start');
    }

    stop() {
        this.#isPlaying = false;
        this.#timeWorker.postMessage('stop');
    }

    getTempo() {
        return this.#tempo;
    }

    setTempo(tempo) {
        this.#tempo = tempo;   
    }

    tempoChange(tempo) {
        this.#tempo = tempo;
        this.#timeWorker.postMessage({'interval': this.#lookahead});
    }

    setResolution(resolution) {
        this.#noteResolution = resolution;   
    }

    isPlaying() {
        return this.#isPlaying;
    }
}
