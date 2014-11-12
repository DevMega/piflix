
var
    WebTorrent = require('webtorrent'),
    proc = require('child_process'),
    fs = require('fs'),

    client = new WebTorrent(),
    thresholdPercentage = 2.00,
    tempPath = '/tmp/piflix',

    extractVideoFile = function (torrent, callback) {
        var videoFileData = {file: {}, length: 0};
        for (var i = 0; i < torrent.files.length; i++) {
            var file = torrent.files[i];
            if (file.length > videoFileData.length) {
                videoFileData.file = file;
                videoFileData.length = file.length;
            }

            if (i == (torrent.files.length - 1)) {
                callback(videoFileData.file);
            }
        }
    };

exports.play = function (magnet_uri) {

    client.destroy(function (data) { // destroy previous torrent downloads
        proc.exec('rm -rf ' + tempPath + ' ; mkdir ' + tempPath);

        client.download(magnet_uri, function (torrent) { // start new torrent download

            extractVideoFile(torrent, function (file) {
                console.log(file.name + ' => buffer started');
                var readStream = file.createReadStream();
                var destinationPath =  tempPath + '/' + file.name;

                var writeStream = fs.createWriteStream(destinationPath);
                readStream.pipe(writeStream);

                var bytesOnComplete = file.length;
                var bytesReceived = 0;
                var playerStarted = false;

                readStream.on('data', function (chunk) {
                    bytesReceived += chunk.length;
                    var percentage = ((bytesReceived / bytesOnComplete) * 100).toFixed(2);
                    var relativePercentage = ((percentage / thresholdPercentage) * 100).toFixed(2);

                    if (!playerStarted) {
                        if (relativePercentage < 100) {
                            console.log(file.name + ' => ' + relativePercentage + '% buffered (' + percentage + '% downloaded of complete video)');
                        } else {
                            console.log(file.name + ' => buffer complete!');
                            console.log(file.name + ' => starting video player ...');

                            //proc.exec('/opt/homebrew-cask/Caskroom/vlc/2.1.5/VLC.app/Contents/MacOS/VLC ' + destinationPath);
                            proc.exec('omxplayer -p -o hdmi ' + destinationPath);
                            playerStarted = true;
                        }
                    } else {
                        console.log(file.name + ' => ' + percentage + '% done of complete video');
                    }
                });
            });
        });
    });
}