/*globals  require:true*/
/*jslint vars:true, node:true*/
var Q = require('q');
var Lexer = require('lex');

module.exports = function () {
    'use strict';


    var rules = [{
        regex: /\$\w+\s*:\s*\w+\s*;/,
        type: 'variable'
    }, {
        regex: /@import\s*['"]?[^'";]*['"]?\s*;/,
        type: 'import'
    }, {
        regex: /\@mixin\s*[^\s(]*\(?[^)]*\)?\s*(?=[\n{])/,
        type: 'mixin'
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
            if (currentScope.parentScope) {
                currentScope = currentScope.parentScope;
            }

            //this is to keep the object JSON-serializable by removing circular structure
            delete child.parentScope;
            cols += 1;
            return 'skip';
        });
        lexer.addRule(/./gm, function (lexeme) {
            cols += 1;
            return 'skip';
        });


        lexer.setInput(input || '');
        currentScope = stylesheet;

        (function lex() {
            retval = lexer.lex();
            if (retval) {
                if (retval !== 'skip') {
                    currentScope.directives.push(retval);
                    if (typeof retval === 'object' && retval.directives) {
                        currentScope = retval;
                    }
                }
                process.nextTick(lex);
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
