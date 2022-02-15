var expect = require('chai').expect;

describe('Array-expect', function() {

  describe('#indexOf()-expect', function () {

    var arrayUnderTest = [1, 2, 3];

    it('should be the correct length', function () {
        expect(arrayUnderTest).to.have.lengthOf(3);
    });
    
    it('should return -1 when the value is not present', function () {
        expect(arrayUnderTest.indexOf(5)).to.equal(-1);
        expect(arrayUnderTest.indexOf(0)).to.equal(-1);
    });

    it('should not return -1 when the value is present', function () {
        expect(arrayUnderTest.indexOf(2)).to.be.above(-1);
    });

  });

});
