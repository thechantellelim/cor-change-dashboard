import AppConfig from "./AppConfig";

/** Collection of type checking utilities. */
export const is = {
    /** Checks if this is a *pure* object, it is not a function, array, or other object derived typed. */
    object(arg) {
        return arg != null && Object.prototype.toString.call(arg) === '[object Object]';
    },
    function(arg) {
        return arg != null && Object.prototype.toString.call(arg) === '[object Function]';
    },
    promise(arg) {
        return arg != null && Object.prototype.toString.call(arg) === '[object Promise]';
    },
    string(arg) {
        return arg != null && Object.prototype.toString.call(arg) === '[object String]';
    },
    number(arg) {
        return arg != null && Object.prototype.toString.call(arg) === '[object Number]';
    },
    bool(arg) {
        return arg != null && Object.prototype.toString.call(arg) === '[object Boolean]';
    },
    date(arg) {
        return arg != null && Object.prototype.toString.call(arg) === '[object Date]';
    },
    array(arg) {
        return arg != null && Array.isArray(arg);
    },
    /**
     * Checks if value is or can be converted to a Date and that the Date is valid (non-NaN).
     * @param {string|number|Date|null} date
     */
    validDate(date) {
        if (this.string(date) || this.number(date)) {
            date = new Date(date);
        }

        return this.date(date) && !isNaN(date.getTime());
    },
    /**
     * Checks if value is a string, and that string is a valid date.
     * @param str
     */
    stringDate(str) {
        return this.string(str) && this.validDate(str);
    }
}

/** Collection of type conversion utilities. */
export const to = {
    /**
     * Converts string to integer. If NaN, returns 0.
     * @param {string} arg 
     * @param {number} [defaultVal=0] Default value to use if arg fails to parse, defaults to 0.
     */
    int(arg, defaultVal = 0) {
        const number = parseInt(arg, 10);
        return Number.isNaN(number) ? defaultVal : number;
    },
    /**
     * Converts string to float. If NaN, returns 0.
     * @param {string} arg 
     * @param {number} [defaultVal=0] Default value to use if arg fails to parse, defaults to 0.
     */
    float(arg, defaultVal = 0) {
        const number = parseFloat(arg, 10);
        return Number.isNaN(number) ? defaultVal : number;
    },
    // NOTE: this isn't trying to coerce a string into a boolean, rather it's checking if the value is the literal toString() result, IE if you'd written a boolean to localStorage.
    //       If necessary for a more general boolean conversion, create a boolLike method instead.
    /**
     * Converts string to bool if "true" or "false". If it is not a valid result, returns false.
     * @param {string} arg
     * @param {number} [defaultVal=false] Default value to use if arg fails to parse, defaults to false.
     */
    bool(arg, defaultVal = false) {
        arg = arg?.toLocaleLowerCase();

        // We don't simply use `return arg === 'true'` because a non-value should 
        if (arg === 'true') {
            return true;
        }
        if (arg === 'false') {
            return false;
        }

        return defaultVal;
    },
    /**
     * Ensures that the value passed will be a Date object if it can become one, or otherwise null.
     * @param {string|number|Date|null} date A date object or value that can be converted to a date.
     * @returns {Date|null}
     */
    date(date) {
        if (is.string(date) || is.number(date)) {
            date = new Date(date);
        }

        return date;
    }
}

/** Collection of type asserting utilities. Used to ensure a variable is the type, or immediately throw an error if it is not. assert methods are checked only in development mode. */
export const assert = {
    /**
    * Throws an Error if arg is not a object.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    object(arg, errStr = undefined) {
        if (!AppConfig.isDevelopment) {
            return;
        }

        assertAlways.object(arg, errStr);
    },
    /**
    * Throws an Error if arg is not a function.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    function(arg, errStr = undefined) {
        if (!AppConfig.isDevelopment) {
            return;
        }

        assertAlways.function(arg, errStr);
    },
    /**
    * Throws an Error if arg is not a string.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    string(arg, errStr = undefined) {
        if (!AppConfig.isDevelopment) {
            return;
        }

        assertAlways.string(arg, errStr);
    },
    /**
    * Throws an Error if arg is not a number.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    number(arg, errStr = undefined) {
        if (!AppConfig.isDevelopment) {
            return;
        }

        assertAlways.number(arg, errStr);
    },
    /**
    * Throws an Error if arg is not a bool.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    bool(arg, errStr = undefined) {
        if (!AppConfig.isDevelopment) {
            return;
        }

        assertAlways.bool(arg, errStr);
    },
    /**
    * Throws an Error if arg is not a date.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    date(arg, errStr = undefined) {
        if (!AppConfig.isDevelopment) {
            return;
        }

        assertAlways.date(arg, errStr);
    },
    /**
    * Throws an Error if arg is not an array.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    array(arg, errStr = undefined) {
        if (!AppConfig.isDevelopment) {
            return;
        }

        assertAlways.array(arg, errStr);
    },
    /**
    * Throws an Error if arg is falsey. Used as a general purpose check method.
    * @param {any} arg 
    * @param {string} [errStr] 
    * @example
    * assert.check(someObj != null, 'Object must not be null.');
    * assert.check(someObj.prop !== undefined, 'Object must have property "prop".');
    * assert.check(someArray.length > 0, 'Array Length must be greater than zero.');
    */
    check(arg, errStr = undefined) {
        if (!AppConfig.isDevelopment) {
            return;
        }

        assertAlways.check(arg, errStr);
    }
};

/** Collection of type asserting utilities. Used to ensure a variable is the type, or immediately throw an error if it is not. assertAlways methods are checked in both development and production mode. */
export const assertAlways = {
    /**
    * Throws an Error if arg is not a object.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    object(arg, errStr = undefined) {
        if (!is.object(arg)) {
            throw new Error(errStr);
        }
    },
    /**
    * Throws an Error if arg is not a function.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    function(arg, errStr = undefined) {
        if (!is.function(arg)) {
            throw new Error(errStr);
        }
    },
    /**
    * Throws an Error if arg is not a string.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    string(arg, errStr = undefined) {
        if (!is.string(arg)) {
            throw new Error(errStr);
        }
    },
    /**
    * Throws an Error if arg is not a number.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    number(arg, errStr = undefined) {
        if (!is.number(arg)) {
            throw new Error(errStr);
        }
    },
    /**
    * Throws an Error if arg is not a bool.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    bool(arg, errStr = undefined) {
        if (!is.bool(arg)) {
            throw new Error(errStr);
        }
    },
    /**
    * Throws an Error if arg is not a date.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    date(arg, errStr = undefined) {
        if (!is.date(arg)) {
            throw new Error(errStr);
        }
    },
    /**
    * Throws an Error if arg is not an array.
    * @param {any} arg 
    * @param {string} [errStr] 
    */
    array(arg, errStr = undefined) {
        if (!is.array(arg)) {
            throw new Error(errStr);
        }
    },
    /**
    * Throws an Error if arg is falsey. Used as a general purpose check method.
    * @param {any} arg 
    * @param {string} [errStr] 
    * @example
    * assertAlways.check(someObj != null, 'Object must not be null.');
    * assertAlways.check(someObj.prop !== undefined, 'Object must have property "prop".');
    * assertAlways.check(someArray.length > 0, 'Array Length must be greater than zero.');
    */
    check(condition, errStr = undefined) {
        if (!condition) {
            throw new Error(errStr);
        }
    }
};

export default { is, to, assert, assertAlways };