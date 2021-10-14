import Thing from './thing.js';

const UNDEFINED = -1;
const NOT_LOADED = 0;

const NUM_CHANNELS = 4;
const RED = 0;
const GREEN = 1;
const BLUE = 2;
const ALPHA = 3;

// Keep track of cross origin WebImage URLs that have already been loaded
// so we can take advantage of loading cross origin images from the browser cache
const cachedCrossOriginURLs = {};

/**
 * @constructor
 * @augments Thing
 * @param {string} filename - Filepath to the image
 */
export default class WebImage extends Thing {
    constructor(filename) {
        if (typeof filename !== 'string') {
            throw new TypeError(
                'You must pass a string to `' + "new WebImage(filename)` that has the image's URL.",
            );
        }

        this.image = new Image();
        // If the image is from a different origin, we need to request the image using
        // crossOrigin 'Anonymous', which allows WebImage to treat the image as
        // same origin and manipulate pixel data
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin
        var urlParser = document.createElement('a');
        urlParser.href = filename;
        var src = filename;
        if (urlParser.origin != window.location.origin) {
            this.image.crossOrigin = 'Anonymous';

            // If we've loaded this cross origin URL before, keep using the same URL
            if (cachedCrossOriginURLs.hasOwnProperty(filename)) {
                src = cachedCrossOriginURLs[filename];
            } else {
                // Otherwise we need to avoid the browser cache
                // Browser may have the image cached without the proper
                // Access-Control-Allow-Origin header on the resource
                // Ensure that we initiate a new crossOrigin 'anonymous' request for this
                // image, rather than pulling from browser cache, by making filename unique
                // We'll keep using this unique filename next time
                src = filename + '?time=' + Date.now();
                cachedCrossOriginURLs[filename] = src;
            }
        }
        this.imageLoaded = false;
        this.image.src = src;
        this.filename = filename;
        this.width = NOT_LOADED;
        this.height = NOT_LOADED;
        this.image.onload = () => {
            this.imageLoaded = true;
            this.checkDimensions();
            this.loadPixelData();
            if (this.loadfn) {
                this.loadfn();
            }
        };
        this.set = 0;

        this.displayFromData = false;
        this.dirtyHiddenCanvas = false;
        this.data = NOT_LOADED;
    }

    /**
     * Set a function to be called when the WebImage is loaded.
     *
     * @param {function} callback - A function
     */
    loaded(callback) {
        this.loadfn = callback;
    }

    /**
     * Set the image of the WebImage.
     *
     * @param {string} filename - Filepath to the image
     */
    setImage(filename) {
        if (typeof filename !== 'string') {
            throw new TypeError(
                'You must pass a string to `' + "new WebImage(filename)` that has the image's URL.",
            );
        }

        this.image = new Image();
        // If the image is from a different origin, we need to request the image using
        // crossOrigin 'Anonymous', which allows WebImage to treat the image as
        // same origin and manipulate pixel data
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin
        var urlParser = document.createElement('a');
        urlParser.href = filename;
        var src = filename;
        if (urlParser.origin != window.location.origin) {
            this.image.crossOrigin = 'Anonymous';

            // If we've loaded this cross origin URL before, keep using the same URL
            if (cachedCrossOriginURLs.hasOwnProperty(filename)) {
                src = cachedCrossOriginURLs[filename];
            } else {
                // Otherwise we need to avoid the browser cache
                // Browser may have the image cached without the proper
                // Access-Control-Allow-Origin header on the resource
                // Ensure that we initiate a new crossOrigin 'anonymous' request for this
                // image, rather than pulling from browser cache, by making filename unique
                // We'll keep using this unique filename next time
                src = filename + '?time=' + Date.now();
                cachedCrossOriginURLs[filename] = src;
            }
        }
        this.imageLoaded = false;
        this.image.src = src;
        this.filename = filename;
        this.width = NOT_LOADED;
        this.height = NOT_LOADED;
        this.image.onload = () => {
            this.imageLoaded = true;
            this.checkDimensions();
            this.loadPixelData();
            if (this.loadfn) {
                this.loadfn();
            }
        };
        this.set = 0;

        this.displayFromData = false;
        this.dirtyHiddenCanvas = false;
        this.data = NOT_LOADED;
    }

    /**
     * Reinforce the dimensions of the WebImage based on the image it displays.
     */
    checkDimensions() {
        if (this.width == NOT_LOADED && this.imageLoaded) {
            this.width = this.image.width;
            this.height = this.image.height;
        }
    }

    /**
     * Draws the WebImage in the canvas.
     *
     * @param {CodeHSGraphics} __graphics__ - Instance of the __graphics__ module.
     */
    draw(__graphics__) {
        this.checkDimensions();
        var context = __graphics__.getContext('2d');

        // Scale and translate
        // X scale, X scew, Y scew, Y scale, X position, Y position
        context.setTransform(1, 0, 0, 1, this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.rotation);

        // If we should be displaying the underlying pixel data, display that
        // Otherwise display the image
        var elemToDraw = this.image;
        if (this.displayFromData && this.data !== NOT_LOADED && this.hiddenCanvas) {
            // Update the in memory canvas with the latest pixel data if necessary
            if (this.dirtyHiddenCanvas) {
                var ctx = this.hiddenCanvas.getContext('2d');
                ctx.clearRect(0, 0, this.hiddenCanvas.width, this.hiddenCanvas.height);
                ctx.putImageData(this.data, 0, 0);
                this.dirtyHiddenCanvas = false;
            }
            elemToDraw = this.hiddenCanvas;
        }

        try {
            context.drawImage(
                elemToDraw,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height,
            );
        } catch (err) {
            throw new TypeError(
                'Unable to create a WebImage from `' +
                    this.filename +
                    '` ' +
                    'Make sure you have a valid image URL. ' +
                    'Hint: You can use More > Upload to upload your image and create a valid image URL.',
            );
        } finally {
            // Reset transformation matrix
            // X scale, X scew, Y scew, Y scale, X position, Y position
            context.setTransform(1, 0, 0, 1, 0, 0);
        }
    }

    /**
     * Return the underlying ImageData for this image.
     * Read more at https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
     */
    loadPixelData() {
        if (this.data === NOT_LOADED && this.imageLoaded) {
            try {
                // get the ImageData for this image
                this.hiddenCanvas = document.createElement('canvas');
                this.hiddenCanvas.width = this.width;
                this.hiddenCanvas.height = this.height;
                var ctx = this.hiddenCanvas.getContext('2d');
                ctx.drawImage(this.image, 0, 0, this.width, this.height);
                this.data = ctx.getImageData(0, 0, this.width, this.height);
                this.dirtyHiddenCanvas = false;
            } catch (err) {
                // NOTE: This should never happen now that we request images using
                // image.crossOrigin = 'Anonymous'
                // If the image was loaded, that means the external domain gave us CORS
                // access to the image and the browser will treat it as if it is same origin,
                // meaning we should be allowed to call 'getImageData'
                //
                // Just in case 'getImageData' fails,
                // Fail silently so we can still display the image from cross origin,
                // we just don't access the underlying image data
                this.data = NOT_LOADED;
            }
        }
        return this.data;
    }

    /**
     * Checks if the passed point is contained in the WebImage.
     *
     * @param {number} x - The x coordinate of the point being tested.
     * @param {number} y - The y coordinate of the point being tested.
     * @returns {boolean} Whether the passed point is contained in the WebImage.
     */
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }

    /**
     * Gets the width of the WebImage.
     *
     * @returns {number} Width of the WebImage.
     */
    getWidth() {
        return this.width;
    }

    /**
     * Gets the height of the WebImage.
     *
     * @returns {number} Height of the WebImage.
     */
    getHeight() {
        return this.height;
    }

    /**
     * Sets the size of the WebImage.
     *
     * @param {number} width - The desired width of the resulting WebImage.
     * @param {number} height - The desired height of the resulting WebImage.
     */
    setSize(width, height) {
        if (arguments.length !== 2) {
            throw new Error(
                'You should pass exactly 2 arguments to <span ' +
                    'class="code">setSize(width, height)`',
            );
        }
        if (typeof width !== 'number' || !isFinite(width)) {
            throw new TypeError(
                'Invalid value for `width' +
                    '`. Make sure you are passing finite numbers to <span ' +
                    'class="code">setSize(width, height)`. Did you ' +
                    'forget the parentheses in `getWidth()` ' +
                    'or `getHeight()`? Or did you perform a ' +
                    'calculation on a variable that is not a number?',
            );
        }
        if (typeof height !== 'number' || !isFinite(height)) {
            throw new TypeError(
                'Invalid value for `height' +
                    '`. Make sure you are passing finite numbers to <span ' +
                    'class="code">setSize(width, height)`. Did you ' +
                    'forget the parentheses in `getWidth()` ' +
                    'or `getHeight()`? Or did you perform a ' +
                    'calculation on a variable that is not a number?',
            );
        }
        this.width = Math.max(0, width);
        this.height = Math.max(0, height);
    }

    /* Get and set pixel functions */

    /**
     * Gets a pixel at the given x and y coordinates.
     * Read more here:
     * https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data
     *
     * @param {number} x - The x coordinate of the point being tested.
     * @param {number} y - The y coordinate of the point being tested.
     * @returns {array} An array of 4 numbers representing the (r,g,b,a) values
     *                     of the pixel at that coordinate.
     */
    getPixel(x, y) {
        if (this.data === NOT_LOADED || x > this.width || x < 0 || y > this.height || y < 0) {
            var noPixel = [UNDEFINED, UNDEFINED, UNDEFINED, UNDEFINED];
            return noPixel;
        } else {
            var index = NUM_CHANNELS * (y * this.width + x);
            var pixel = [
                this.data.data[index + RED],
                this.data.data[index + GREEN],
                this.data.data[index + BLUE],
                this.data.data[index + ALPHA],
            ];
            return pixel;
        }
    }

    /**
     * Get the red value at a given location in the image.
     *
     * @param {number} x - The x coordinate of the point being tested.
     * @param {number} y - The y coordinate of the point being tested.
     * @returns {integer} An integer between 0 and 255.
     */
    getRed(x, y) {
        return this.getPixel(x, y)[RED];
    }

    /**
     * Get the green value at a given location in the image.
     *
     * @param {number} x - The x coordinate of the point being tested.
     * @param {number} y - The y coordinate of the point being tested.
     * @returns {integer} An integer between 0 and 255.
     */
    getGreen(x, y) {
        return this.getPixel(x, y)[GREEN];
    }

    /**
     * Get the blue value at a given location in the image.
     *
     * @param {number} x - The x coordinate of the point being tested.
     * @param {number} y - The y coordinate of the point being tested.
     * @returns {integer} An integer between 0 and 255.
     */
    getBlue(x, y) {
        return this.getPixel(x, y)[BLUE];
    }

    /**
     * Get the alpha value at a given location in the image.
     *
     * @param {number} x - The x coordinate of the point being tested.
     * @param {number} y - The y coordinate of the point being tested.
     * @returns {integer} An integer between 0 and 255.
     */
    getAlpha(x, y) {
        return this.getPixel(x, y)[ALPHA];
    }

    /**
     * Set the `component` value at a given location in the image to `val`.
     *
     * @param {number} x - The x coordinate of the point being tested.
     * @param {number} y - The y coordinate of the point being tested.
     * @param {integer} component - Integer representing the color value to
     * be set. R, G, B = 0, 1, 2, respectively.
     * @param {integer} val - The desired value of the `component` at the pixel.
     * Must be between 0 and 255.
     */
    setPixel(x, y, component, val) {
        if (this.data !== NOT_LOADED && !(x < 0 || y < 0 || x > this.width || y > this.height)) {
            // Update the pixel value
            var index = NUM_CHANNELS * (y * this.width + x);
            this.data.data[index + component] = val;

            // Now that we have modified the image data, we need to display
            // the image based on the underlying image data rather than the
            // image url
            this.displayFromData = true;
            this.dirtyHiddenCanvas = true;
        }
    }

    /**
     * Set the red value at a given location in the image to `val`.
     *
     * @param {number} x - The x coordinate of the point being tested.
     * @param {number} y - The y coordinate of the point being tested.
     * @param {integer} val - The desired value of the red component at the pixel.
     * Must be between 0 and 255.
     */
    setRed(x, y, val) {
        this.setPixel(x, y, RED, val);
    }

    /**
     * Set the green value at a given location in the image to `val`.
     *
     * @param {number} x - The x coordinate of the point being tested.
     * @param {number} y - The y coordinate of the point being tested.
     * @param {integer} val - The desired value of the green component at the pixel.
     * Must be between 0 and 255.
     */
    setGreen(x, y, val) {
        this.setPixel(x, y, GREEN, val);
    }

    /**
     * Set the blue value at a given location in the image to `val`.
     *
     * @param {number} x - The x coordinate of the point being tested.
     * @param {number} y - The y coordinate of the point being tested.
     * @param {integer} val - The desired value of the blue component at the pixel.
     * Must be between 0 and 255.
     */
    setBlue(x, y, val) {
        this.setPixel(x, y, BLUE, val);
    }

    /**
     * Set the alpha value at a given location in the image to `val`.
     *
     * @param {number} x - The x coordinate of the point being tested.
     * @param {number} y - The y coordinate of the point being tested.
     * @param {integer} val - The desired value of the alpha component at the
     * pixel.
     * Must be between 0 and 255.
     */
    setAlpha(x, y, val) {
        this.setPixel(x, y, ALPHA, val);
    }
}
