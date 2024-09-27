
class TrackList {
    #tracks = [];
    #resolution = 16;
    #index = 0;

    constructor() {

    }

    addTrack(id) {
        let steps = [];

        for (let i = 0; i < this.#resolution; i++) {
            steps.push(0);
        }

        this.#index = this.#index + 1;

        const track = {id: id, steps: steps, index: this.#index};

        this.#tracks.push(track);
    }

    setTrack(id, steps) {
        let track = this.#tracks.find(track => track.id == id);

        for (let i = 0; i < track.steps.length; i++) {
            track.steps[i] = steps.includes(i) ? 1 : 0;
        }
    }

    deleteTrack(id) {

    }

    emptyTrack(id) {

    }

    getTracks(id) {
        if (id !== undefined) {
            return this.#tracks.find(track => track.id == id);
        }

        return this.#tracks;
    }

    getTrackByIndex(index) {

    } 

    getResolution() {
        return this.#resolution;
    }

    setStep(id, step) {
        let track = this.#tracks.find(track => track.id == id);
        track.steps[step] = track.steps[step] == 1 ? 0 : 1;
    }
}
