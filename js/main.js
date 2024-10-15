document.addEventListener('DOMContentLoaded', () => {

    const trackList = new TrackList();
    const soundList = new SoundList();
    const sequencer = new Sequencer(soundList, trackList);

    const soundIndexes = soundList.getSoundIndexes();

    // Create a track for each sound index. 
    Object.keys(soundIndexes).forEach(function(key) {
        trackList.addTrack(key, soundIndexes[key]);
    });

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

    document.getElementById('volume').addEventListener('input', (e) => {
        sequencer.setVolume(e.target.value);
    });

    document.getElementById('resolution').addEventListener('change', (e) => {
        sequencer.setResolution(e.target.value);
    });

    // Check for track sliders.
    const sliders = document.querySelectorAll('.track-slider');

    for (let i = 0; i < sliders.length; i++) {
        sliders[i].addEventListener('input', (e) => {
            // Get the modified track.
            const track = sequencer.getTrackList().getTracks(e.target.dataset.trackId);
            // Set the new track parameter value.
            track[e.target.dataset.type] = e.target.value;
        });
    }

    // Check for track steps.
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
            label.setAttribute('class', 'col-2');
            label.innerHTML += trackList.getTracks()[i].id; 

        // Add the label to the track list.
        document.getElementById('track-list').append(label);

        document.getElementById('track-list').append(createSlider(trackList.getTracks()[i].id, 'delay'));
        document.getElementById('track-list').append(createSlider(trackList.getTracks()[i].id, 'feedback'));

        // Add the track to the track list.
        document.getElementById('track-list').append(track);
    }
}

function createSlider(trackId, type) {
    let col = document.createElement('div');
    col.setAttribute('class', 'col-4 border-top pt-2 pb-2');

    let slider = document.createElement('input');
    slider.setAttribute('id', type + '-' + trackId);
    slider.setAttribute('class', 'track-slider ms-2 me-2');
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '0.0');
    slider.setAttribute('max', '1.0');
    slider.setAttribute('step', '0.1');
    slider.setAttribute('value', '0');
    slider.setAttribute('data-track-id', trackId);
    slider.setAttribute('data-type', type);
    slider.setAttribute('oninput', 'this.nextElementSibling.value = this.value;');
    
    let label = document.createElement('label');
        label.setAttribute('for',  type + '-' + trackId);
        label.innerHTML += type; 

    col.append(label);
    col.append(slider);

    let output = document.createElement('output');
    output.innerHTML += '0'; 

    col.append(output);

    return col;
}

