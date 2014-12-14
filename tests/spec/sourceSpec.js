describe('Source module', function() {

    var source

    beforeEach(function() {
        source = require('sonotone/stream/source');
    });

    afterEach(function() {
    });

    it('should return an array of available audio sources', function() {
        
        var audioSources;

        source.getAudioSources(function(sources) {
            audioSources = sources;
            expect(typeof audioSources).toBe('object');
        }, this);
    });

    it('should return an array of available video sources', function() {
        
        var videoSources;

        source.getVideoSources(function(sources) {
            videoSources = sources;
            expect(typeof videoSources).toBe('object');
        }, this);
    });


});