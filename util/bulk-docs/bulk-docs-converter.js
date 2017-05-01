const _ = require('lodash');
const fs = require('fs');

// process.argv.forEach((val, index) => {
//   console.log(`${index}: ${val}`);
// });

let args = _.slice(process.argv, 2);

// console.log(args);
if (args.length !== 2) {
    console.warn("Need two, and only two, arguments.");
    // TODO: exit
}

const sourcePath = args[0],
    targetPath = args[1];

if (!fs.existsSync(sourcePath)) {
    console.warn(`Source path not found: ${sourcePath}`);
    // TODO: exit
}

let incoming = require(sourcePath);
console.info(_.keys(incoming));
// console.info(incoming);
// for each object in docs, pull the ``doc`` object into an array.
let outputDocs = _.map(incoming.docs, (bulkDoc) => {
    return bulkDoc.doc;
});

console.info(outputDocs.length);
const output = {"new_edits": false, docs: outputDocs};
fs.writeFileSync(targetPath, JSON.stringify(output));
