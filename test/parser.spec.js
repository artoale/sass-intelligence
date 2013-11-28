var parserMaker = require('../src/parser.js'),
    chai = require('chai'),
    expect,
    sinonChai = require('sinon-chai'),
    fs = require('fs'),
    chaiAsPromised = require('chai-as-promised'),
    Q = require('q'),
    correctFile,
    emptyFile = '',
    incorrectFile;

correctFile = fs.readFileSync(__dirname + '/fixtures/correct.scss'),
incorrectFile = fs.readFileSync(__dirname + '/fixtures/incorrect.scss'),

chai.use(sinonChai);
chai.use(chaiAsPromised);
expect = chai.expect;


describe('parser', function () {
    'use strict';
    var parser,
        callCount = 0,
        expectedCallCount = 0;

    beforeEach(function () {
        callCount = 0;
        expectedCallCount = 0;
        var stubNodeMaker = function (input) {
            callCount += 1;
//            console.log('input:', input);
            return input;
        };
        parser = parserMaker(stubNodeMaker);
    });

    afterEach(function () {
        expect(callCount).to.equal(expectedCallCount);
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

        it('should return an object', function (done) {
            expect(parser.parse(correctFile)).to.eventually.be.an('object').and.notify(done);
            expectedCallCount = 6;
        });

        it('should return an object that contains the properties start, end, directives in any case', function (done) {
            Q.all([parser.parse(emptyFile), parser.parse(correctFile), parser.parse(incorrectFile)]).done(function (results) {
                expect(results[0]).to.have.keys(['start', 'end', 'directives']);
                expect(results[1]).to.have.keys(['start', 'end', 'directives']);
                expect(results[2]).to.have.keys(['start', 'end', 'directives']);
                done();
            });
            expectedCallCount = 12;
        });

        // Empty scopes are not cleaned-up if empty...should they?
        //        it('should return an object with no directives for regular css', function () {
        //            expect(parser.parse(correctFile).directives).to.be.empty;
        //        });
        //
        it('should extract all the $variable declaration from a string', function (done) {
            var testString = ['bla bla bla',
                              '  $variable: var1;',
                              'bla bla  $var2: var2; ',
                              'oh, cristo  $variabl3: var3;'].join('\n'),
                result = parser.parse(testString);

            expect(Q.all([
                expect(result.get('directives').get(0)).to.eventually.equal('$variable: var1;'),
                expect(result.get('directives').get(1)).to.eventually.equal('$var2: var2;'),
                expect(result.get('directives').get(2)).to.eventually.equal('$variabl3: var3;')
            ])).to.notify(done);
            expectedCallCount = 3;
        });

        it('should extract all the $variable even if in the same line', function (done) {
            var testString = ['bla bla bla',
                              '  $variable: var1;',
                              'bla bla  $var2: var2; ',
                              'oh, cristo  $variabl3: var3;'].join(''),
                result = parser.parse(testString);

            expect(Q.all([
                expect(result.get('directives').get(0)).to.eventually.equal('$variable: var1;'),
                expect(result.get('directives').get(1)).to.eventually.equal('$var2: var2;'),
                expect(result.get('directives').get(2)).to.eventually.equal('$variabl3: var3;')
            ])).to.notify(done);
            expectedCallCount = 3;
        });

        it('should handle $variables in nested scopes', function (done) {
            var testArray = [
                '$var1: red;',
                'body {',
                '$var2: black;',
                '}',
                '$var3: yellow;'
            ];
            var testString = testArray.join('\n');
            var result = parser.parse(testString);
            expect(Q.all([
                expect(result.get('directives').get(0)).to.eventually.equal(testArray[0]),
                expect(result.get('directives').get(1).get('directives').get(0)).to.eventually.equal(testArray[2]),
                expect(result.get('directives').get(2)).to.eventually.equal(testArray[4])
            ])).to.notify(done);
            expectedCallCount = 3;
        });
        it('should handle $variables in nested scopes  even if in the same line', function (done) {
            var testArray = [
                '$var1: red;',
                'body {',
                '$var2: black;',
                '}',
                '$var3: yellow;'
            ];
            var testString = testArray.join('');
            var result = parser.parse(testString);
            expect(Q.all([
                expect(result.get('directives').get(0)).to.eventually.equal(testArray[0]),
                expect(result.get('directives').get(1).get('directives').get(0)).to.eventually.equal(testArray[2]),
                expect(result.get('directives').get(2)).to.eventually.equal(testArray[4])
            ])).to.notify(done);
            expectedCallCount = 3;
        });


        describe('@mixin handling', function () {
            it('should extract @mixin without arguments', function (done) {
                var testString = '  @mixin a-mixin {\n}',
                    result = parser.parse(testString);
                expect(result.get('directives').get(0)).to.eventually.equal('@mixin a-mixin ').and.notify(done);
                expectedCallCount = 1;
            });

            it('should extract @mixin with arguments', function (done) {
                var testString = '  @mixin aMixin ($arg1, $arg2: red, $arg3) {    }',
                    result = parser.parse(testString);
                expect(result.get('directives').get(0)).to.eventually.equal('@mixin aMixin ($arg1, $arg2: red, $arg3) ').and.notify(done);
                expectedCallCount = 1;
            });

            it('should extract @mixin inside a scope', function (done) {
                var testString = [
                        'html, body {',
                        '    @mixin () {',
                        '        border-width: 12px;',
                        '    }',
                        '}',
                    ].join('\n'),
                    result = parser.parse(testString);

                expect(result.get('directives').get(0).get('directives').get(0)).to.eventually.equal('@mixin () ').and.notify(done);
                expectedCallCount = 1;
            });
        });
        describe('@import handling', function () {
            it('should extract imports', function (done) {
                var testString = [
                        '@import \'something\';',
                        '@import\'something\' ;',
                        '@import something;',
                        '@import"something" ; ',
                        '@import "something";'
                    ].join('\n'),
                    result = parser.parse(testString);

                expect(Q.all([
                    expect(result.get('directives').get(0)).to.eventually.equal('@import \'something\';'),
                    expect(result.get('directives').get(1)).to.eventually.equal('@import\'something\' ;'),
                    expect(result.get('directives').get(2)).to.eventually.equal('@import something;'),
                    expect(result.get('directives').get(3)).to.eventually.equal('@import"something" ;'),
                    expect(result.get('directives').get(4)).to.eventually.equal('@import "something";')
                ])).to.notify(done);
                expectedCallCount = 5;
            });

            it('should extract @import inside a scope', function (done) {
                var testString = [
                        'html, body {',
                        '    @import main;',
                        '}',
                    ].join('\n'),
                    result = parser.parse(testString);

                expect(result.get('directives').get(0).get('directives').get(0)).to.eventually.equal('@import main;').and.notify(done);
                expectedCallCount = 1;
            });
            it('should remove imports to .css files', function (done) {
                var imports = [
                        '@import \'something.css\';',
                        '@import something.css ;',
                        '@import "something.css";',
                        '@import \'actualScss\' ;'
                    ].join('\n'),
                    result  = parser.parse(imports);

                expect(Q.all([
                    expect(result.get('directives').get('length')).to.eventually.equal(1),
                    expect(result.get('directives').get(0)).to.eventually.equal('@import \'actualScss\' ;')
                ])).to.notify(done);
                expectedCallCount = 1;
            });
            it('should remove imports with "url(...)"', function (done) {
                var imports = [
                        '@import url(\'something\') ;',
                        '@import  url(blabla) ;',
                        '@import    url("blalba") ;',
                        '@import \'actualScss\';'
                    ].join('\n'),
                    result  = parser.parse(imports);

                expect(Q.all([
                    expect(result.get('directives').get('length')).to.eventually.equal(1),
                    expect(result.get('directives').get(0)).to.eventually.equal('@import \'actualScss\';')
                ])).to.notify(done);
                expectedCallCount = 1;
            });
        });

        describe('@function handling', function () {

            it('should extract @function with arguments', function (done) {
                var testString = '@function grid-width($n) {/n @return $n * $grid-width + ($n - 1) * $gutter-width; \n}',
                    result = parser.parse(testString);
                expect(result.get('directives').get(0)).to.eventually.equal('@function grid-width($n) ').and.notify(done);
                expectedCallCount = 1;
            });
        });

        describe('nested scope', function () {
            it('should not return empty scopes', function (done) {
                var input = [
                        '@mixin blalba {',
                        ' @import  url(blabla) ;',
                        ' background-color: black;',
                        '}'
                    ].join('\n'),
                    result  = parser.parse(input);

                expect(result.get('directives').get('length')).to.eventually.equal(1).and.notify(done),
                expectedCallCount = 1;
            });
        });
    });
});
