document.addEventListener('DOMContentLoaded', () => {

    const trackList = new TrackList();
    const soundList = new SoundList();
    const sequencer = new Sequencer(soundList, trackList);

    trackList.addTrack('kick');
    trackList.addTrack('snare');
    trackList.addTrack('hihat');
    trackList.addTrack('cowbell');

    createBeatNumbers(trackList);
    createTracks(trackList);

    document.getElementById('start-stop').addEventListener('click', (e) => {
        if (sequencer.isPlaying()) {
            sequencer.stop();
            // Toggle the button text from Stop to Start.
            e.target.innerHTML = 'Start';
        }
        else {
            sequencer.start();
            // Toggle the button text from Start to Stop.
            e.target.innerHTML = 'Stop';
        }
    });

    document.getElementById('tempo').addEventListener('input', (e) => {
        if (sequencer.isPlaying()) {
            sequencer.tempoChange(e.target.value);
        }
        else {
            sequencer.setTempo(e.target.value);
        }
    });

    document.getElementById('resolution').addEventListener('change', (e) => {
        sequencer.setResolution(e.target.value);
    });

    const steps = document.querySelectorAll('.step');

    for (let i = 0; i < steps.length; i++) {
        // Listen to the clicked steps.
        steps[i].addEventListener('click', (e) => {
            // In case the span child (LED) has been clicked.
            const step = e.target.tagName == 'SPAN' ? e.target.parentNode : e.target;

            // The step is already selected.
            if (step.classList.contains('selected')) {
                step.classList.remove('selected');
            }
            // Select the step.
            else {
                step.classList.add('selected');
            }

            trackList.setStep(step.dataset.trackId, step.dataset.stepNumber)
        });
    }
});


function createBeatNumbers(trackList) {
    let beatNumbers = document.createElement('div');
    beatNumbers.setAttribute('class', 'row mb-4');

    // Create the beat numbers according to the track resolution.
    for (let i = 0; i < trackList.getResolution(); i++) {
        let beatNumber = document.createElement('div');
        beatNumber.setAttribute('class', 'beat-number text-center me-3');

        let label = document.createElement('span');
        label.innerHTML += i + 1; 

        beatNumber.append(label);

        // Add the beat number to the row.
        beatNumbers.append(beatNumber);
    }

    // Add the beat numbers to the drumbox.
    document.getElementById('16th-notes').append(beatNumbers);
}

function createTracks(trackList) {

    for (let i = 0; i < trackList.getTracks().length; i++) {
        let track = document.createElement('div');
            track.setAttribute('id', 'track-' + i);
            track.setAttribute('class', 'row mb-4');

        // Create the steps according to the track resolution.
        for (let j = 0; j < trackList.getResolution(); j++) {
            let step = document.createElement('div');
            step.setAttribute('id', 'step-' + i + '-' + j);
            step.setAttribute('class', 'step d-flex justify-content-center me-3');
            step.setAttribute('data-step-number', j);
            step.setAttribute('data-track-id', trackList.getTracks()[i].id);

            let LED = document.createElement('span');
            LED.setAttribute('class', 'LED');
            LED.setAttribute('id', 'LED-' + i + '-' + j);
            LED.innerHTML += '&nbsp;'; 

            step.append(LED);

            // Add the step to the track.
            track.append(step);
        }

        let label = document.createElement('div');
            label.setAttribute('class', 'col-12');
            label.innerHTML += 'Track ' + i; 

        // Add the label to the track list.
        document.getElementById('track-list').append(label);

        // Add the track to the track list.
        document.getElementById('track-list').append(track);
    }
}
