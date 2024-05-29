import fs from "fs"
import path from "path"
import sharp from "sharp"
import { isImage } from "./isImage"

export default async function createResizedImagesInDirectory(imgDir: string, ignore: string[], sizes: number[]): Promise<Map<string, number[]>> {
    const src = fs.readdirSync(imgDir)
    let outputMap = new Map<string, number[]>()
    let inProgressDirs: Promise<Map<string, number[]>>[] = [] 

    for (const fileName of src) {
        const filepath = path.join(imgDir, fileName)

        if (ignore.some((ignored) => { 
            return ignored == filepath 
        })) {
            console.log(`\x1b[33mSkipping ignored file or directory ${filepath}\x1b[0m`)
            continue
        }

        if (fs.lstatSync(filepath).isDirectory()) {
            console.log(`Descending into directory ${fileName}`)
            inProgressDirs.push(createResizedImagesInDirectory(filepath, ignore, sizes))
            continue
        }
        
        if (!isImage(filepath)) {
            continue
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
        let endedEarly = false

        for (const size of sizes) {
            if (size > imgWidth) {
                const newFilePath = createFilePath(generatedImageDir, fileName, imgWidth)
                sharp(filepath)
                    .resize(imgWidth)
                    .toFile(newFilePath)
                    .catch((err) => {
                        throw `Couldn't create resized image at ${newFilePath}`
                    })

                endedEarly = true
                
                break
            }
            const newFilePath = createFilePath(generatedImageDir, fileName, size)
            sharp(filepath)
                .resize(size)
                .toFile(newFilePath)
                .catch((err) => {
                    throw `Couldn't create resized image at ${newFilePath}`
                })

            idx++
        }

        outputMap.set(filepath, sizes.slice(0, idx).concat(endedEarly ? [imgWidth] : sizes[sizes.length - 1]))

    }

    (await Promise.all(inProgressDirs)).forEach((map) => {
        map.forEach((v, k) => {
            outputMap.set(k, v)
        })
    })

    return outputMap
}

export function createFilePath(generatedImageDir: string, originalFile: string, size: number): string {
    const lastDot = originalFile.lastIndexOf(`.`)
    const fileWithNoExtension = originalFile.slice(0, lastDot)
    return path.join(generatedImageDir, fileWithNoExtension + "-generated-" + size + "px.webp")
}