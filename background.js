const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

// Ensure input and output directories exist
const inputDir = 'input';
const outputDir = 'output_png';

if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir);
}
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Set the threshold for how close to black a color should be
const blackThreshold = 50;

// Function to calculate the Euclidean distance from black
const isCloseToBlack = (r, g, b, threshold) => {
    return Math.sqrt(r * r + g * g + b * b) <= threshold;
};

// Function to process each image file
const processImage = async (inputFilePath, outputFilePath) => {
    try {
        const { data, info } = await sharp(inputFilePath)
            .ensureAlpha() // Ensure the image has an alpha channel
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height, channels } = info;

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
            const [r, g, b, a] = data.slice(i, i + 4);
            if (!isCloseToBlack(r, g, b, blackThreshold)) {
                // If the pixel is not close to black, set alpha to 0 (transparent)
                data[i + 3] = 0;
            }
        }

        // Create a new sharp instance with the modified data
        await sharp(data, {
            raw: {
                width,
                height,
                channels,
            },
        })
            .toFormat('png')
            .toFile(outputFilePath);

        console.log(`Processed: ${inputFilePath}`);
    } catch (err) {
        console.error(`Error processing image: ${inputFilePath}`, err);
    }
};

// Read all image files from the input directory
const imageExtensions = ['.jpeg', '.jpg', '.png', '.webp'];
fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error('Error reading input directory:', err);
        return;
    }

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
            const inputFilePath = path.join(inputDir, file);
            const outputFilePath = path.join(outputDir, `${path.parse(file).name}.png`);
            processImage(inputFilePath, outputFilePath);
        }
    });
});
