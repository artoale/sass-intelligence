/*globals define:true, module:true, exports:true, require:true*/
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        'use strict';
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
    'use strict';
    var parserMaker = require('../src/parser.js');
    var expect = require('chai').expect;
    describe('parser', function () {

        it('should be a function', function () {
            expect(parserMaker).to.be.a('function');
        });
        it('should return an object', function () {
            expect(parserMaker()).to.be.an('object');
        });


        describe('extractImportDirectives', function () {
            it('should be a function', function () {
                var parser = parserMaker();
                expect(parser.extractImportDirectives).to.be.a('function');
            });

            it('should extract all the @import directives from a string', function () {
                var parser = parserMaker();
                var testString = ["bla bla bla",
                                  "   @import cazzitua;",
                                  "   @import url('cazzimia'); asdasd",
                                  "oh, cristo cristo"
                ].join('\n');
                var result = parser.extractImportDirectives(testString);
                expect(Array.isArray(result)).to.be.true;
                expect(result).to.have.length(2);
                expect(result[0]).to.equal('@import cazzitua');
                expect(result[1]).to.equal("@import url('cazzimia')");
            });
        });

        describe('filterCssImports', function () {
            var filterCssImports
            beforeEach(function () {
                filterCssImports = parserMaker().filterCssImports;
            });
            it('should remove imports to .css files', function () {
                var imports = [
                    "@import 'something.css'",
                    "@import 'something.css '",
                    "@import \"something.css\"",
                    "@import 'actualScss'"
                ];

                var filtered = filterCssImports(imports);
                expect(filtered).to.have.length(1);
                expect(filtered[0]).to.equal(imports[imports.length - 1]);
            });
            it('should remove imports with url', function () {
                var imports = [
                    "@import url('something')",
                    "@import    'url()'",
                    "@import    \" url() \"",
                    "@import url(\"something\")",
                    "@import 'actualScss'"
                ];

                var filtered = filterCssImports(imports);
                expect(filtered).to.have.length(1);
                expect(filtered[0]).to.equal(imports[imports.length - 1]);
            });
        });
    });
});
