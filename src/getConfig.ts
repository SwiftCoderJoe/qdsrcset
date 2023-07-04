import fs from "fs"
import *  as tsio from "io-ts"
import { isLeft } from "fp-ts/Either"
import path from "path";

export default function getConfig(rootPath: string): Config {
    console.log(`rootPath: ${rootPath}`)
    let config;
    if (fs.existsSync(rootPath + "/.qdsrcsetconfig.json")) {
        config = castToConfig(require(rootPath + "/.qdsrcsetconfig.json"))
    } else if (fs.existsSync(rootPath + "/config/.qdsrcsetconfig.json")) {
        config = castToConfig(require(rootPath + "/config/.qdsrcsetconfig.json"))
    } else {
        throw "Could not find config file."
    }

    if (config.inDir.endsWith("/")) {
        config.inDir = config.inDir.slice(0, config.inDir.length - 1)
    }
    if (config.outDir.endsWith("/")) {
        config.outDir = config.outDir.slice(0, config.outDir.length - 1)
    }

    if (config.inDir == config.outDir) {
        throw "inDir cannot be the same as outDir"
    }
    
    if (config.imgDir == undefined) {
        config.imgDir = ""
    }

    if (config.imgDir.endsWith("/")) {
        config.imgDir = config.imgDir.slice(0, config.imgDir.length - 1)
    }

    if (config.ignore == undefined) {
        config.ignore = []
    }

    for (const idx in config.ignore) {
        config.ignore[idx] = path.join(rootPath, config.outDir, config.ignore[idx])
        if (config.ignore[idx].endsWith("/")) {
            config.ignore[idx] = config.ignore[idx].slice(0, config.ignore[idx].length - 1)
        }
    }

    if (config.sizes == undefined) {
        config.sizes = [150, 200, 300, 400, 600, 800, 1000, 1500, 2000, 2500]
    }

    return config as Config

}

function castToConfig(untypedConfig: unknown): UnfinishedConfig {
    const downcastedConfig = ConfigDecoder.decode(untypedConfig)
    if (isLeft(downcastedConfig)) {
        throw "Could not read config file."
    } else {
        return downcastedConfig.right
    }
}

const ConfigDecoder = tsio.type({
    inDir: tsio.string,
    outDir: tsio.string,
    imgDir: tsio.union([tsio.string, tsio.undefined]),
    ignore: tsio.union([tsio.array(tsio.string), tsio.undefined]),
    sizes: tsio.union([tsio.array(tsio.number), tsio.undefined])
})
type UnfinishedConfig = tsio.TypeOf<typeof ConfigDecoder>;

type Config = {
    inDir: string,
    outDir: string,
    imgDir: string,
    ignore: string[],
    sizes: number[]
}
