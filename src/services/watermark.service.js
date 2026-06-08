const sharp = require("sharp");
const { PDFDocument, rgb, degrees } = require("pdf-lib");

async function addImageWatermark(
    imageBuffer,
    watermarkText
) {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const svg = `
        <svg width="${metadata.width}" height="${metadata.height}">
            <defs>
                <pattern
                    id="watermark"
                    width="300"
                    height="100"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(-30)"
                >
                    <text
                        x="10"
                        y="70"
                        fill="red"
                        opacity="0.6"
                        font-size="15"
                    >
                        ${watermarkText}
                    </text>
                </pattern>
            </defs>

            <rect
                width="100%"
                height="100%"
                fill="url(#watermark)"
            />
        </svg>
    `;

    return await sharp(imageBuffer)
        .composite([
            {
                input: Buffer.from(svg),
                top: 0,
                left: 0
            }
        ])
        .toBuffer();
}

async function addPdfWatermark(
    pdfBuffer,
    watermarkText
) {

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
        const { width, height } = page.getSize();
        for (
            let y = -200;
            y < height + 200;
            y += 150
        ) {

            for (
                let x = -200;
                x < width + 200;
                x += 250
            ) {

                page.drawText(
                    watermarkText,
                    {
                        x,
                        y,
                        size: 18,
                        rotate: degrees(45),
                        opacity: 0.7,
                        color: rgb(0.7, 0.7, 0.7)
                    }
                );
            }
        }
    }

    return Buffer.from(
        await pdfDoc.save()
    );
}

module.exports = {
    addImageWatermark,
    addPdfWatermark
};