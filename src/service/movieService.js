var yts = require('../lib/yts/yts');
var configService = require('./configService');

exports.fetchOverview = function (options, callback) {

    configService.load(function (config) {
        options.quality = config.quality;
        yts.getMovies(options, function (ytsresponse) {
            var overview = {
                items: []
            };

            if(typeof ytsresponse.MovieList != "undefined") {
                ytsresponse.MovieList.forEach(function (item) {
                    overview.items.push({
                        "id": item.MovieID,
                        "title": item.MovieTitleClean,
                        "cover": item.CoverImage
                    });
                });
            }

            callback(overview);
        });
    });
};

exports.fetchDetails = function (id, callback) {
    yts.getMovieDetails(id, function (ytsresponse) {
        return  callback({
            "id": id,
            "imdbCode": ytsresponse.ImdbCode,
            "title": ytsresponse.MovieTitleClean,
            "descriptionLong": ytsresponse.LongDescription,
            "year": ytsresponse.MovieYear,
            "runtime": ytsresponse.MovieRuntime,
            "coverLarge": ytsresponse.LargeCover,
            "coverMedium": ytsresponse.MediumCover,
            "torrentUrl": ytsresponse.TorrentUrl,
            "magnetUrl": ytsresponse.TorrentMagnetUrl
        });
    });
};