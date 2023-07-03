import fs from "fs"
import path from "path"
import sharp from "sharp"

export default async function createResizedImagesInDirectory(imgDir: string, sizes: [number]): Promise<Map<string, number[]>> {
    const src = fs.readdirSync(imgDir)
    let outputMap = new Map<string, number[]>()

    for (const fileName of src) {
        const filepath = path.join(imgDir, fileName)
        if (fs.lstatSync(filepath).isDirectory()) {
            console.log(`Descending into directory ${fileName}`)
            const dirMap = await createResizedImagesInDirectory(filepath, sizes)
            dirMap.forEach((v, k) => {
                outputMap.set(k, v)
            })
            continue;
        }

        console.log(`checking if file ${fileName} is an image`)

        if (!isImage(filepath)) {
            continue;
        }

        console.log(`Found image file ${filepath}`)

        const generatedImageDir = path.join(imgDir, "/qdsrcset-generated")

        if (!fs.existsSync(generatedImageDir)) {
            console.log(`Generated image directory ${generatedImageDir} doesn't exist yet. Creating it...`)
            fs.mkdirSync(generatedImageDir)
        }

        const imgWidth = (await sharp(filepath).metadata()).width
        if (imgWidth == undefined) {
            throw `Could not read metadata for image ${filepath}`
        }

        let idx = 0

        for (const size of sizes) {
            if (size > imgWidth) {
                const newFilePath = createFilePath(generatedImageDir, fileName, imgWidth)
                sharp(filepath)
                    .resize(imgWidth)
                    .toFile(newFilePath)

                outputMap.set(filepath, sizes.slice(0, idx).concat([imgWidth]))
                break
            }
            const newFilePath = createFilePath(generatedImageDir, fileName, size)
            sharp(filepath)
                .resize(size)
                .toFile(newFilePath)

            idx++
        }

    }

    return outputMap
}

function isImage(file: string) {
    // Purposefully ignore SVGs here because it seems unnecessary to resize them.
    return [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tiff"]
        .some((extension) => {
            return file.toLowerCase().endsWith(extension)
        })
}

export function createFilePath(generatedImageDir: string, originalFile: string, size: number): string {
    const lastDot = originalFile.lastIndexOf(`.`)
    const fileWithNoExtension = originalFile.slice(0, lastDot)
    return path.join(generatedImageDir, fileWithNoExtension + "-generated-" + size + "px.webp")
}