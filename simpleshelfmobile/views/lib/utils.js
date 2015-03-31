/**
 * Return true if characters are alphabetic-only.
 * Courtesy http://stackoverflow.com/a/2450689/562978
 **/
function isLetter(s) {
    return s.match("^[a-zA-Z\(\)]+$");    
}

// Use CommonJS format, split into objects based on basic type of utility.
exports["strings"] = {
    isLetter: isLetter
};
