module.exports = function () {
    'use strict';
    var pathResolver = function (currentAbsolute, relative) {
        var path = require('path');
        return path.resolve(path.dirname(currentAbsolute), relative);

    };

    return pathResolver;
};
