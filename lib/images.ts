import sharp from 'sharp';

const sharpOptions = {
    width: 500,
    height: 500,
    fit: sharp.fit.inside,
};

export async function resizeImage(inputPath: string, outputPath: string) {
    await sharp(inputPath).resize(sharpOptions).toFile(outputPath);
}
