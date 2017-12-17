/**
 * Common utilities.
 */
class Util {
    constructor() {
        this.isAlphaRegex = /[a-z]/;
    }

    isAlphabetic(text) {
        return this.isAlphaRegex.test(text);
    }
}

const util = new Util();

export {util as Util};
