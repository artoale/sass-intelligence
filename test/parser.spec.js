var parserMaker = require('../src/parser.js'),
    chai = require('chai'),
    expect,
    sinonChai = require('sinon-chai'),
//  fs = require('fs'),
    correctFile,
    emptyFile,
    incorrectFile;
//    correctFile = fs.readFileSync('mock/correctSASS.scss'),
//    emptyFile = fs.readFileSync('mock/empty.scss'),
//    incorrectFile = fs.readFileSync('mock/incorrectSASS.scss');

chai.use(sinonChai);
expect = chai.expect;


describe.skip('parser', function () {
    'use strict';
    var parser;
    beforeEach(function () {
        parser = parserMaker();
    });


    it('should be a function', function () {
        expect(parserMaker).to.be.a('function');
    });
    it('should return an object', function () {
        expect(parserMaker()).to.be.an('object');
    });


    describe('parse', function () {
        it('should be a function', function () {
            expect(parser.parse).to.be.a('function');
        });

        it('should return an object'),

        function () {
            expect(parser.parse(correctFile)).to.be.a('object');
        },

        it('should return an object that contains the properties start, end, directives in any case'),

        function () {
            expect(parser.parse(correctFile)).to.have.keys(['start', 'end', 'directives']);
            expect(parser.parse(emptyFile)).to.have.keys(['start', 'end', 'directives']);
            expect(parser.parse(incorrectFile)).to.have.keys(['start', 'end', 'directives']);


        },

        it('should return object without directives for a file without them', function () {
            expect(parser.parse(correctFile).directives).to.be.empty;
        });

        it('should extract all the @import directives from a string', function () {
            var parser = parserMaker();
            var testString = ['bla bla bla',
                              '  @import cazzitua;',
                              '@import url(\'cazzimia\'); asdasd',
                              'oh, cristo cristo'].join('\n');
            var result = parser.extractImportDirectives(testString);
            expect(Array.isArray(result)).to.be.true;
            expect(result).to.have.length(2);
            expect(result[0]).to.equal('@import cazzitua');
            expect(result[1]).to.equal('@import url(\'cazzimia\')');
        });
    });

    describe('filterCssImports', function () {
        var filterCssImports;
        beforeEach(function () {
            filterCssImports = parserMaker().filterCssImports;
        });
        it('should remove imports to .css files', function () {
            var imports = ['@import \'something.css',
                           '@import \'something.css ',
                           '@import "something.css"',
                           '@import \'actualScss\''
            ];

            var filtered = filterCssImports(imports);
            expect(filtered).to.have.length(1);
            expect(filtered[0]).to.equal(imports[imports.length - 1]);
        });
        it('should remove imports with url', function () {
            var imports = [
                '@import url(\'something\')',
                '@import    \'url()\'',
                '@import    " url() "',
                '@import url(\"something\")',
                '@import \'actualScss\''
            ];

            var filtered = filterCssImports(imports);
            expect(filtered).to.have.length(1);
            expect(filtered[0]).to.equal(imports[imports.length - 1]);
        });
    });
});