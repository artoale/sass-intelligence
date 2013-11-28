describe('parsing module', function () {
    'use strict';

    var chai = require('chai'),
        chaiAsPromised = require('chai-as-promised'),
        //        sinon = require('sinon'),
        expect,
        correctPath = __dirname + '/parsingFiles/correct.scss',
        expectedPath = __dirname + '/parsingFiles/correct.json',
        pathResolverFactory = require('../../src/pathResolver'),
        nodeMakerFactory = require('../../src/nodeMaker'),
        parserFactory = require('../../src/parser'),

        pathResolver = pathResolverFactory(correctPath),
        nodeMaker = nodeMakerFactory(pathResolver).make,
        parser = parserFactory(nodeMaker);

    chai.use(chaiAsPromised);

    expect = chai.expect;
    it('should build the correct tree', function (done) {
        this.timeout(0);
        var sassFile = require('fs').readFileSync(correctPath);
        var expected = JSON.parse(require('fs').readFileSync(expectedPath));
        var result = parser.parse(sassFile);
//        result.then(function (res) {
//            require('fs').writeFileSync(__dirname + '/out.json', JSON.stringify(res));
//        });
        expect(result).to.eventually.deep.equal(expected).and.notify(done);
    });
});
