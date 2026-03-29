const fs = require('fs');
const mammoth = require('mammoth');

async function processFiles(files) {
    for (const file of files) {
        try {
            console.log(`\n\n--- Content of ${file} ---\n\n`);
            const result = await mammoth.extractRawText({path: file});
            console.log(result.value);
        } catch (e) {
            console.error(`Error reading ${file}:`, e);
        }
    }
}

const args = process.argv.slice(2);
if (args.length > 0) {
    processFiles(args);
} else {
    console.error("Please provide file paths.");
}
