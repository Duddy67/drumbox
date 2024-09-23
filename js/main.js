document.addEventListener('DOMContentLoaded', () => {

    const tracks = new Track();
    const sound = new Sound();
    const sequencer = new Sequencer(sound, tracks);

    tracks.addTrack('snare');
    tracks.setTrack('snare', [4, 12]);
    tracks.addTrack('kick');
    tracks.setTrack('kick', [0, 7, 10]);
    tracks.addTrack('hihat');
    tracks.setTrack('hihat', [0, 2, 4, 6, 8, 10, 12, 14]);
//console.log(tracks.getTracks('snare'));
//console.log(tracks.getTracks('kick'));
//console.log(tracks.getTracks('hihat'));
    createTracks(tracks);

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
});


function createTracks(tracks) {

    for (let i = 0; i < tracks.getTracks().length; i++) {
        let track = document.createElement('div');
            track.setAttribute('id', 'track-' + i);
            track.setAttribute('class', 'row mb-4');

        for (let j = 0; j < tracks.getResolution(); j++) {
            let step = document.createElement('div');
            step.setAttribute('id', 'step-' + i + '-' + j);
            step.setAttribute('class', 'step d-flex justify-content-center me-3');

            let label = document.createElement('span');
            label.innerHTML += 'O'; 

            step.append(label);

            // Add the step to the track.
            track.append(step);
        }

        // Add the track to the track list.
        document.getElementById('track-list').append(track);
    }
}
