import fs from "fs"
import path from "path"
import parser from "node-html-parser"
import { createFilePath } from "./imageResizer"

export function formatHTMLInDirectory(inDir: string, imageSizesMap: Map<string, number[]>) {
    const src = fs.readdirSync(inDir)

    for (const file of src) {
        const filepath = path.join(inDir, file)
        if (fs.lstatSync(filepath).isDirectory()) {
            console.log(`Descending into directory ${file}`)
            formatHTMLInDirectory(filepath, imageSizesMap)
            continue;
        }

        if (!file.endsWith(".html")) {
            continue
        }

        console.log(`Found HTML file ${filepath}`)

        let content = parser.parse(fs.readFileSync(filepath, {encoding: "utf-8"}))

        content.querySelectorAll("img").forEach((img) => {
            const imagePath = path.join(inDir, img.attributes.src)
            const sizes = imageSizesMap.get(imagePath)
            if (sizes == undefined) {
                throw `Could not find image ${imagePath} in internal database. Did you ignore a folder where the image is located?`
            }


            const lastFolderIndex = img.attributes.src.lastIndexOf("/")
            const imageFolder = path.join(img.attributes.src.slice(0, lastFolderIndex), "qdsrcset-generated")
            const imageName = img.attributes.src.slice(lastFolderIndex, img.attributes.src.length)

            let srcset = ""

            for (const size of sizes) {
                srcset = srcset + createFilePath(imageFolder, imageName, size) + " " + size + "w, "
            }

            img.setAttribute("srcset", srcset)
            img.setAttribute("src", "")
        })

        fs.rmSync(filepath)
        fs.writeFileSync(filepath, content.toString())

    }

}