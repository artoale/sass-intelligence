/*globals define:true, module:true, exports:true, require:true*/
/*jslint vars:true*/
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        'use strict';
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
    'use strict';
    //We immediately return a function so that we may inject dependencies if required
    return function parser() {
        var importRegExp = /(@import .*);/ig;

        var extractImportDirectives = function (string) {
            var result = [],
                currentMatch;
            while ((currentMatch = importRegExp.exec(string)) !== null) {
                result.push(currentMatch[1]);
            }
            return result;
        };


        var filterRules = [
            /\.css\s*['"]{0,1}\s*$/,
            /@import\s*['"]{0,1}\s*url/
        ];

        var filterCssImports = function (imports) {
            var filtered = imports.filter(function (imported) {
                return filterRules.every(function (regexp) {
                    return !imported.match(regexp);
                });
            });
            return filtered;
        };

        return {
            extractImportDirectives: extractImportDirectives,
            filterCssImports: filterCssImports
        };
    };
});
