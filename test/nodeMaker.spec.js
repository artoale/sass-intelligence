describe('nodeMaker', function () {
    'use strict';
    var chai = require('chai'),
        sinonChai = require('sinon-chai'),
        sinon = require('sinon'),
        expect,
        nodeMakerFactory = require('../src/nodeMaker');
 
    chai.use(sinonChai);
    expect = chai.expect;

    it('should export a function', function () {
        expect(nodeMakerFactory).to.be.a('function');
        expect(nodeMakerFactory()).to.be.an('object');
    });

    describe('function make', function () {
        var make;
        beforeEach(function () {
            make = nodeMakerFactory().make;
        });

        it('should be a function', function () {
            expect(make).to.be.a('function');
        });

        it('should handle variables', function () {
            var inputString = '$varSomething: myValue;',
                node = {
                    type: 'variable',
                    id: '$varSomething',
                    value: 'myValue',
                    original: inputString
                };
            expect(make(inputString)).to.deep.equal(node);
        });

        it('should handle mixins w/o parameters', function () {
            var inputString = '@mixin mixinName',
                node = {
                    type: 'mixin',
                    id: 'mixinName',
                    params: false,
                    original: inputString
                };
            expect(make(inputString)).to.deep.equal(node);
        });

        it('should handle mixins w/ parameters', function () {
            var inputString = '@mixin mixinName($something, $somethingElse)',
                node = {
                    type: 'mixin',
                    id: 'mixinName',
                    params: true,
                    original: inputString
                };
            expect(make(inputString)).to.deep.equal(node);
        });

        it('should handle functions w/o parameters', function () {
            var inputString = '@function functionName ',
                node = {
                    type: 'function',
                    id: 'functionName',
                    params: false,
                    original: inputString
                };
            expect(make(inputString)).to.deep.equal(node);
        });


        it('should handle functions w/ parameters', function () {
            var inputString = '@function functionName($something, $somethingElse)',
                node = {
                    type: 'function',
                    id: 'functionName',
                    params: true,
                    original: inputString
                };
            expect(make(inputString)).to.deep.equal(node);
        });


        it('should throw if string is not known', function () {
            var inputString = 'something not recognised as directive';
            expect(make.bind(undefined, inputString)).to.throw(Error);
        });
        describe('@import directive', function () {
            var stub,
                make;

            beforeEach(function () {
                stub = sinon.stub().returns('/bla/bla/bla');
                make = nodeMakerFactory(stub).make;
            });

            it('should use the retval of pathResolver as id', function () {
                var inputStrings = [
                    '@import fileToImport;',
                    '@import "fileToImport";',
                    '@import"fileToImport";',
                    '@import \'fileToImport\';',
                    '@import\'fileToImport\';'
                ];
                var node = {
                    type: 'import',
                    id: '/bla/bla/bla',
                    //                        original:
                };
                inputStrings.forEach(function (inputString) {
                    node = {
                        type: 'import',
                        id: '/bla/bla/bla',
                        original: inputString
                    };
                    expect(make(inputString)).to.deep.equal(node);
                });
            });

            it('should pass actual relative path to pathResolver', function () {

                var inputStrings = [
                    '@import fileToImport;',
                    '@import "fileToImport";',
                    '@import \'fileToImport\';'
                ];
                inputStrings.forEach(function (inputString) {
                    make(inputString, 'currentFile');
                });
                expect(stub).to.have.always.been.calledWith('fileToImport');
            });
        });
    });
});
