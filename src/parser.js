/*globals  require:true*/
/*jslint vars:true, node:true*/
var Q = require('q');
var Lexer = require('lex');
if (typeof setImmediate !== 'function') {
    global.setImmediate = function(fn) {
        'use strict';
        setTimeout(fn,0);
    };
}
module.exports = function (nodeMaker) {
    'use strict';


    var rules = [{
        regex: /\$\S+\s*:\s*\$?[a-zA-Z0-9_-]+\s*;/,
        type: 'variable'
    }, {
        regex: /@import\s*['"]?[^'";]*['"]?\s*;/,
        type: 'import'
    }, {
        regex: /\@mixin\s*[^\s{(]*\(?[^){]*\)?\s*(?=[{\n])/, //positive lookahead to match everything expect the ending { or \n
        type: 'mixin'
    }, {
        regex: /\@function\s*[^\s(]*\(?[^)]*\)?\s*(?=[{\n])/,
        type: 'function'
    }];

    var filters = [{
        regex: /@import\s*['"]?[^'";]*\.css\s*['"]?\s*;/
    }, {
        regex: /@import\s+url\(['"]?[^'";]*['"]?\s*\)\s*;/
    }];

    var parse = function _parse(input) {
        var lexer = new Lexer(),
            cols = 1,
            deferred = Q.defer(),
            retval,
            row = 1,
            currentScope,
            stylesheet = {
                start: {
                    row: 1,
                    col: 1
                },
                end: null,
                directives: []
            };
        var filtersHandler = function (lexeme) {
            cols += lexeme.length;
            return 'skip';
        };
        filters.forEach(function (rule) {
            lexer.addRule(rule.regex, filtersHandler);
        });
        var directiveHandlers = function (lexeme) {
            cols += lexeme.length;
            return lexeme;
        };
        rules.forEach(function (rule) {
            lexer.addRule(rule.regex, directiveHandlers);
        });

        lexer.addRule(/\n/g, function (lexeme) {
            cols = 1;
            row += 1;
            return 'skip';
        });
        lexer.addRule(/{/gm, function (lexeme) {
            var newScope = {
                start: {
                    row: row,
                    col: cols
                },
                end: null,
                parentScope: currentScope,
                directives: []
            };
            cols += 1;
            return newScope;
        });
        lexer.addRule(/}/gm, function (lexeme) {
            var child = currentScope;

            currentScope.end = {
                row: row,
                col: cols,
            };
            if (currentScope.parentScope) { //there may be a missing {, we prefer a wrong tree than an exception :)
                currentScope = currentScope.parentScope;
            }

            //this is to keep the object JSON-serializable by removing circular structure
            delete child.parentScope;

            if (!child.directives || child.directives.length <= 0) {
                currentScope.directives.length -= 1;
            }

            cols += 1;
            return 'skip';
        });
        lexer.addRule(/./gm, function (lexeme) {
            cols += 1;
            return 'skip';
        });


        lexer.setInput(input || '');
        currentScope = stylesheet;
        var iterCount = 0;
        (function lex() {
            retval = lexer.lex();
            if (retval) {
                if (retval !== 'skip') {
                    if (typeof retval === 'object' && retval.directives) {
                        currentScope.directives.push(retval);
                        currentScope = retval;
                    } else {
                        retval = nodeMaker(retval);
                        currentScope.directives.push(retval);
                    }
                }
                iterCount += 1;
                if (iterCount < 100) {
                    lex();
                } else {
                    iterCount = 0;
                    setImmediate(lex);
                }
            } else {

//              if (currentScope != stylesheet) {
//                  TODO Implement missing close bracket
//              }
                stylesheet.end = {
                    row: row,
                    col: cols
                };
//                console.log(JSON.stringify(stylesheet.directives));
                deferred.resolve(stylesheet);
            }
        }());
        return deferred.promise;
    };

    return {
        parse: parse
    };

};
