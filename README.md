# QDsrcset

A Quick and Dirty automatic responsive image generator for plain HTML sites. 

## What is it for?

So you've made a website, but all the images are *huge*. Obviously it doesn't make sense to load the huge images on every person's iPhone 4 and 480p monitor, so most people will recommend that you create a set of images at different sizes that will load depending on the image's final size. Just one problem: it's just so *annoying*. 

QDsrcset will automatically create a set of responsive images at a variety of sizes and implement them in your HTML. It's easy to install and configure, and can be run with a single command.

## Installation & Usage

First, add `qdsrcset` to your website using NPM or Yarn:

`npm install --save-dev qdsrcset`

Next, create a configuration file in either your project's root or in a `config/` folder named `.qdsrcsetconfig.json`. Here's an example:

```json
{
    "inDir": "src/",
    "outDir": "out/"
}
```

Then, tell NPM to run the program:

`npx qdsrcset`

This will format a site located in `inDir` and place the formatted site in `outDir`. Don't make these the same folder. 

That's it! It's certainly quick, hopefully not *too* dirty (and getting less dirty) srcset for each of your website's images!

## Configuration

The json configuration file can be located in either `/.qdsrcsetconfig.json` or `/config/qdsrcsetconfig.json`.

It contains the following fields:
 - `inDir`: This is where your website is located. QDsrcset will scan here for HTML files (and images, if `imgDir` is not set.)
 - `outDir`: This is where your final, formatted website is located. It cannot be the same as inDir.
 - `imgDir` (Optional): This is where qdsrcset will search for images. It is relative to `inDir`. For example, if `inDir` is `src/` and `imgDir` is `img/`, qdsrcset will look in `src/img/` for images.
 - `ignore` (Optional): An array of paths to directories or files for QDsrcset to ignore. It is relative to `inDir`. For example, if `inDir` is `src/` and `ignore` contains `img/favicon/`, qdsrcset will ignore `src/img/favicon/`.
 - `sizes` (Optional): An array of integer widths that each image will be resized to. If an image is smaller than some of the specified sizes, QDsrcset will simply compress the image at its original size. Defaults to: `[150, 200, 300, 400, 600, 800, 1000, 1500, 2000, 2500]`

### Example

Let's say your website is structured like this: 

```
myWebsite/
├── src/
│   ├── img/
│   │   ├── favicon/
│   │   │   └── favicon.ico
│   │   ├── img1.png
│   │   ├── img2.jpeg
│   │   └── img3.webp
│   ├── index.html
│   ├── stylesheet.css
│   └── page/
│       ├── index.html
│       └── stylesheet.css
└── .qdsrcsetconfig.json
```

Your config file might be set up like this:

```json
{
    "inDir": "src/",
    "outDir": "out/",
    "imgDir": "img",
    "ignore": [
        "img/favicon/"
    ]
}
```

If, for whatever reason, you wanted a specific set of sizes for your respnsive images, the config could look like this:

```json
{
    "inDir": "src/",
    "outDir": "out/",
    "imgDir": "img",
    "ignore": [
        "img/favicon/"
    ],
    "sizes": [
        100,
        200,
        500,
        1000,
        2000,
        4000
    ]
}
```
