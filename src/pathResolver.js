module.exports = function (currentAbsolute) {
    'use strict';
    var pathResolver = function (relative) {
        var path = require('path');
        return path.resolve(path.dirname(currentAbsolute), relative);

    };

    return pathResolver;
};
