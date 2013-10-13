var nodeMaker = function (pathResolver) {
    'use strict';

    var _makeVar = function (directive) {
        var id = '',
            value = '',
            matches;
        matches = directive.match(/^(\$\w+)\s*:\s*(\S*);$/);
        id = matches[1];
        value = matches[2];

        return {
            type: 'variable',
            id: id,
            value: value,
            original: directive,
        };
    };


    var _makeMixin = function (directive) {
        var matches = directive.match(/^@mixin\s*([^\s(]*)(\({0,1}).*$/),
            id = matches[1],
            params = !! matches[2];

        return {
            type: 'mixin',
            id: id,
            params: params,
            original: directive
        };
    };

    var _makeFunction = function (directive) {
        var matches = directive.match(/^@function\s*([^\s(]*)(\({0,1}).*$/),
            id = matches[1],
            params = !! matches[2];

        return {
            type: 'function',
            id: id,
            params: params,
            original: directive
        };
    };

    var _makeImport = function (directive, currentFilePath) {
        var relativePath = directive.match(/@import\s+['"]{0,1}([^'"]*)['"]{0,1}\s*;$/)[1];
        return {
            type: 'import',
            id: pathResolver(relativePath, currentFilePath),
            original: directive
        };
    };

    var switcher = {
        variable: _makeVar,
        import: _makeImport,
        mixin: _makeMixin,

        function: _makeFunction
    };



    /**
     * Transform the input string into an object
     * rapresting the SCSS-specific directive
     *
     * @param {string} directive The full directive, semicolon inlcuded
     */
    var make = function (directive, currentFilePath) {
        var type;
        if (directive.match(/^\$\w+:.*;$/)) {
            type = 'variable';
        } else if (directive.indexOf('@mixin') === 0) {
            type = 'mixin';
        } else if (directive.indexOf('@import') === 0) {
            type = 'import';
        } else if (directive.indexOf('@function') === 0) {
            type = 'function';
        } else {
            throw new Error('String "' + directive + '" not recognised as a valid directive');
        }
        return switcher[type](directive, currentFilePath);
    };
    return {
        make: make
    };
};

module.exports = nodeMaker;
//    {
//    nodeMaker: ['factory', nodeMaker]
//};
