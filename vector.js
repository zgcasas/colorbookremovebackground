const fs = require('fs');
const path = require('path');
const potrace = require('potrace');
const { promisify } = require('util');

const inputDir = 'output_png';
const outputDir = 'output_svg';

// Promisify the potrace functions
const trace = promisify(potrace.trace);

// Ensure input and output directories exist
if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir);
}
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Function to process each image file
const processImage = async (inputFilePath, outputFilePath) => {
    try {
        const svg = await trace(inputFilePath, { color: 'black' });
        fs.writeFileSync(outputFilePath, svg);
        console.log(`Processed: ${inputFilePath}`);
    } catch (err) {
        console.error(`Error processing image: ${inputFilePath}`, err);
    }
};

// Read all PNG files from the input directory
const imageExtension = '.png';
fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error('Error reading input directory:', err);
        return;
    }

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (ext === imageExtension) {
            const inputFilePath = path.join(inputDir, file);
            const outputFilePath = path.join(outputDir, `${path.parse(file).name}.svg`);
            processImage(inputFilePath, outputFilePath);
        }
    });
});
