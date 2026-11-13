const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputDirectory = path.resolve(projectRoot, 'dist');

if (!outputDirectory.startsWith(projectRoot + path.sep) || outputDirectory === projectRoot) {
    throw new Error('Refusing to write build output outside the project dist directory.');
}

const siteFiles = [
    'index.html',
    'projects.html',
    'downloads.html',
    'css',
    'js',
    'images'
];

for (const siteFile of siteFiles) {
    const source = path.join(projectRoot, siteFile);
    if (!fs.existsSync(source)) {
        throw new Error(`Required site file is missing: ${siteFile}`);
    }
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const siteFile of siteFiles) {
    fs.cpSync(
        path.join(projectRoot, siteFile),
        path.join(outputDirectory, siteFile),
        { recursive: true }
    );
}

console.log(`Static site built successfully in ${path.relative(projectRoot, outputDirectory)}.`);
