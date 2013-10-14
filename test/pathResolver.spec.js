/* globals window:true */
describe('pathResolver module', function () {
    'use strict';
    var chai = require('chai'),
        sinonChai = require('sinon-chai'),
//        sinon = require('sinon'),
        expect,
        pathResolverFactory = require('../src/pathResolver');

    chai.use(sinonChai);
    expect = chai.expect;

    it('should export a factory', function () {
        expect(pathResolverFactory).to.be.a('function');
    });

    it('should make a function', function () {
        expect(pathResolverFactory()).to.be.a('function');
    });

    describe('pathResolver', function () {
        var pathResolver;
        var pathSeparator = '/';
        beforeEach(function () {
            pathResolver = pathResolverFactory();
            if (typeof window === 'undefined') {
                //Not in the browser
                pathSeparator = require('path').sep;
            }
        });

        it('should work for sibling', function() {
            var current = '/bla/bla/something.scss'.replace('/', pathSeparator),
                relative = 'somethingElse.scss'.replace('/', pathSeparator),
                resolved =  pathResolver(current, relative);

            expect(resolved).to.be.a('string');
            expect(resolved).to.equal('/bla/bla/somethingElse.scss'.replace('/', pathSeparator));
        });

        it('should work for nephew', function() {
            var current = '/bla/bla/something.scss'.replace('/', pathSeparator),
                relative = 'siblingDir/nephew.scss'.replace('/', pathSeparator),
                resolved =  pathResolver(current, relative);

            expect(resolved).to.be.a('string');
            expect(resolved).to.equal('/bla/bla/siblingDir/nephew.scss'.replace('/', pathSeparator));
        });

        it('should work for ancestors', function() {
            var current = '/bla/bla/something.scss'.replace('/', pathSeparator),
                relative = '../uncle.scss'.replace('/', pathSeparator),
                resolved =  pathResolver(current, relative);

            expect(resolved).to.be.a('string');
            expect(resolved).to.equal('/bla/uncle.scss'.replace('/', pathSeparator));
        });
    });

});
