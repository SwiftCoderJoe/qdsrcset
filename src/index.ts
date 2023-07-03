import appRootPath from "app-root-path"
import { formatHTMLInDirectory } from "./formatter"
import fs from "fs"
import getConfig from "./getConfig"
import createResizedImagesInDirectory from "./imageResizer"

(async () => {

    const rootPath = appRootPath.path

    const config = getConfig(rootPath)

    console.log("=======")
    console.log("Removing out directory and copying input directory.")
    console.log("=======")
    
    const outDirPath = rootPath + "/" + config.outDir
    if (fs.existsSync(outDirPath)) {
        fs.rmSync(outDirPath, { recursive: true })
    }
    fs.mkdirSync(outDirPath)
    const inDirPath = rootPath + "/" + config.inDir
    if (!fs.existsSync(inDirPath)) {
        throw "Input directory does not exist."
    }
    if (!fs.lstatSync(inDirPath).isDirectory()) {
        throw "Input directory is not a directory."
    }
    fs.cpSync(inDirPath, outDirPath, { recursive: true })


    console.log("=======")
    console.log("Resizing images.")
    console.log("=======")

    const imgDirPath = rootPath + "/" + config.outDir + "/" + config.imgDir
    if (!fs.existsSync(imgDirPath)) {
        throw "Image input directory does not exist."
    }
    if (!fs.lstatSync(imgDirPath).isDirectory()) {
        throw "Image input directory is not a directory."
    }

    const imageSizesMap = await createResizedImagesInDirectory(imgDirPath, config.sizes)



    console.log("=======")
    console.log("Formatting HTML.")
    console.log("=======")
    formatHTMLInDirectory(outDirPath, imageSizesMap)

})()