var fills = {
    setup: function() {


        this.secureCryptoPRGN();
        this.GUID();
        this.performanceNow();
        this.errorHandler();
        this.websocket();
        this.localStorage();
        this.detectIE11();
        this.escapeHTMLStrings();
        this.setImmediate();
        this.functionBind();
        this._deepEquals();
        this.debounce();
        window.ToSafeID = function(value) {
            return value.replace(/[^A-Za-z0-9]/g, "");
        }

        function RunPrefixMethod(obj, method, param) {
            var p = 0,
                m, t;
            while (p < pfx.length && !obj[m]) {
                m = method;
                if (pfx[p] == "") {
                    m = m.substr(0, 1).toLowerCase() + m.substr(1);
                }
                m = pfx[p] + m;
                t = typeof obj[m];
                if (t != "undefined") {
                    pfx = [pfx[p]];
                    return (t == "function" ? obj[m](param) : obj[m]);
                }
                p++;
            }
        }
        window.RunPrefixMethod = RunPrefixMethod;


    },
    debounce:function()
    {
    	function debounce(func, wait, immediate) {
			var timeout;
			return function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) func.apply(context, args);
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply(context, args);
			};
		};
		window.debounce = debounce;
    },
    GUID: function()
    {
        window.GUID = function(){

            //override randomness for testing. NEVER USE THIS
            if(window.GUID.nextGUID)
            {
                var guid = window.GUID.nextGUID;
                delete window.GUID.nextGUID;
                return guid;
            }
            var S4 = function() {
                return Math.floor(Math.SecureRandom() * 0x10000 /* 65536 */ ).toString(16);
            };
            //can we generate nicer GUID? does it really have to be so long?
            return 'N'+S4()+S4();
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        }
    },
    _deepEquals: function() {
        Object.deepEquals = function(x, y) {
            if (x === y) return true;
            // if both x and y are null or undefined and exactly the same

            if (!(x instanceof Object) || !(y instanceof Object)) 
                return false;
            // if they are not strictly equal, they both need to be Objects

            if (x.constructor !== y.constructor) 
                return false;
            // they must have the exact same prototype chain, the closest we can do is
            // test there constructor.
            var keys = Object.keys(x);
            for (var i=0; i < keys.length; i++) {
                var p = keys[i];
                if (!x.hasOwnProperty(p)) continue;
                // other properties were tested using x.constructor === y.constructor

                if (!y.hasOwnProperty(p)) 
                    return false;
                // allows to compare x[ p ] and y[ p ] when set to undefined

                if (x[p] === y[p]) continue;
                // if they have the same strict value or identity then they are equal

                if (typeof(x[p]) !== "object") 
                    return false;
                // Numbers, Strings, Functions, Booleans must be strictly equal

                if (!Object.deepEquals(x[p], y[p])) 
                    return false;
                // Objects and Arrays must be tested recursively
            }

            keys = Object.keys(y);
            for (var i=0; i < keys.length; i++) {
                var p = keys[i];
                if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) 
                    return false;
                // allows x[ p ] to be set to undefined
            }
            return true;
        }



    },
    //try to generate crytographicly secure random numbers
    secureCryptoPRGN: function() {
        //turn out this is fairly slow. Enable to use crypto secure random. not really necessary here anywhere
        Math.SecureRandom = Math.random;
        return;

        var buf = new Uint32Array(1);
        Math.SecureRandom = function() {
            if (window.crypto)
                window.crypto.getRandomValues(buf);
            else if (window.msCrypto)
                window.msCrypto.getRandomValues(buf);
            else
                buf[0] = Math.random() * 4294967296;
            return (buf[0]) / 4294967296;
        }

    },
    functionBind: function() {
        if (!Function.prototype.bind) {
            Function.prototype.bind = function(oThis) {
                if (typeof this !== 'function') {
                    // closest thing possible to the ECMAScript 5
                    // internal IsCallable function
                    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    fNOP = function() {},
                    fBound = function() {
                        return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();

                return fBound;
            };
        }
    },
    escapeHTMLStrings: function() {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };

        String.prototype.escape = function() {

            return this.replace(/[&<>"'\/]/g, function(s) {
                return entityMap[s];
            });
        }

    },
    setImmediate: function() {

        //https://github.com/NobleJS/setImmediate
        (function(global, undefined) {
            "use strict";

            var tasks = (function() {
                function Task(handler, args) {
                    this.handler = handler;
                    this.args = args;
                }
                Task.prototype.run = function() {
                    // See steps in section 5 of the spec.
                    if (typeof this.handler === "function") {
                        // Choice of `thisArg` is not in the setImmediate spec; `undefined` is in the setTimeout spec though:
                        // http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html
                        this.handler.apply(undefined, this.args);
                    } else {
                        var scriptSource = "" + this.handler;
                        /*jshint evil: true */
                        eval(scriptSource);
                    }
                };

                var nextHandle = 1; // Spec says greater than zero
                var tasksByHandle = {};
                var currentlyRunningATask = false;

                return {
                    addFromSetImmediateArguments: function(args) {
                        var handler = args[0];
                        var argsToHandle = Array.prototype.slice.call(args, 1);
                        var task = new Task(handler, argsToHandle);

                        var thisHandle = nextHandle++;
                        tasksByHandle[thisHandle] = task;
                        return thisHandle;
                    },
                    runIfPresent: function(handle) {
                        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
                        // So if we're currently running a task, we'll need to delay this invocation.
                        if (!currentlyRunningATask) {
                            var task = tasksByHandle[handle];
                            if (task) {
                                currentlyRunningATask = true;
                                try {
                                    task.run();
                                } finally {
                                    delete tasksByHandle[handle];
                                    currentlyRunningATask = false;
                                }
                            }
                        } else {
                            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
                            // "too much recursion" error.
                            global.setTimeout(function() {
                                tasks.runIfPresent(handle);
                            }, 0);
                        }
                    },
                    remove: function(handle) {
                        delete tasksByHandle[handle];
                    }
                };
            }());

            function canUseNextTick() {
                // Don't get fooled by e.g. browserify environments.
                return typeof process === "object" &&
                    Object.prototype.toString.call(process) === "[object process]";
            }

            function canUseMessageChannel() {
                return !!global.MessageChannel;
            }

            function canUsePostMessage() {
                // The test against `importScripts` prevents this implementation from being installed inside a web worker,
                // where `global.postMessage` means something completely different and can't be used for this purpose.

                if (!global.postMessage || global.importScripts) {
                    return false;
                }

                var postMessageIsAsynchronous = true;
                var oldOnMessage = global.onmessage;
                global.onmessage = function() {
                    postMessageIsAsynchronous = false;
                };
                global.postMessage("", "*");
                global.onmessage = oldOnMessage;

                return postMessageIsAsynchronous;
            }

            function canUseReadyStateChange() {
                return "document" in global && "onreadystatechange" in global.document.createElement("script");
            }

            function installNextTickImplementation(attachTo) {
                attachTo.setImmediate = function() {
                    var handle = tasks.addFromSetImmediateArguments(arguments);

                    process.nextTick(function() {
                        tasks.runIfPresent(handle);
                    });

                    return handle;
                };
            }

            function installMessageChannelImplementation(attachTo) {
                var channel = new global.MessageChannel();
                channel.port1.onmessage = function(event) {
                    var handle = event.data;
                    tasks.runIfPresent(handle);
                };
                attachTo.setImmediate = function() {
                    var handle = tasks.addFromSetImmediateArguments(arguments);

                    channel.port2.postMessage(handle);

                    return handle;
                };
            }

            function installPostMessageImplementation(attachTo) {
                // Installs an event handler on `global` for the `message` event: see
                // * https://developer.mozilla.org/en/DOM/window.postMessage
                // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

                var MESSAGE_PREFIX = "com.bn.NobleJS.setImmediate" + Math.SecureRandom();

                function isStringAndStartsWith(string, putativeStart) {
                    return typeof string === "string" && string.substring(0, putativeStart.length) === putativeStart;
                }

                function onGlobalMessage(event) {
                    // This will catch all incoming messages (even from other windows!), so we need to try reasonably hard to
                    // avoid letting anyone else trick us into firing off. We test the origin is still this window, and that a
                    // (randomly generated) unpredictable identifying prefix is present.
                    if (event.source === global && isStringAndStartsWith(event.data, MESSAGE_PREFIX)) {
                        var handle = event.data.substring(MESSAGE_PREFIX.length);
                        tasks.runIfPresent(handle);
                    }
                }
                if (global.addEventListener) {
                    global.addEventListener("message", onGlobalMessage, false);
                } else {
                    global.attachEvent("onmessage", onGlobalMessage);
                }

                attachTo.setImmediate = function() {
                    var handle = tasks.addFromSetImmediateArguments(arguments);

                    // Make `global` post a message to itself with the handle and identifying prefix, thus asynchronously
                    // invoking our onGlobalMessage listener above.
                    global.postMessage(MESSAGE_PREFIX + handle, "*");

                    return handle;
                };
            }

            function installReadyStateChangeImplementation(attachTo) {
                attachTo.setImmediate = function() {
                    var handle = tasks.addFromSetImmediateArguments(arguments);

                    // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
                    // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
                    var scriptEl = global.document.createElement("script");
                    scriptEl.onreadystatechange = function() {
                        tasks.runIfPresent(handle);

                        scriptEl.onreadystatechange = null;
                        scriptEl.parentNode.removeChild(scriptEl);
                        scriptEl = null;
                    };
                    global.document.documentElement.appendChild(scriptEl);

                    return handle;
                };
            }

            function installSetTimeoutImplementation(attachTo) {
                attachTo.setImmediate = function() {
                    var handle = tasks.addFromSetImmediateArguments(arguments);

                    global.setTimeout(function() {
                        tasks.runIfPresent(handle);
                    }, 0);

                    return handle;
                };
            }

            if (!global.setImmediate) {
                // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
                var attachTo = typeof Object.getPrototypeOf === "function" && "setTimeout" in Object.getPrototypeOf(global) ?
                    Object.getPrototypeOf(global) : global;

                if (canUseNextTick()) {
                    // For Node.js before 0.9
                    installNextTickImplementation(attachTo);
                } else if (canUsePostMessage()) {
                    // For non-IE10 modern browsers
                    installPostMessageImplementation(attachTo);
                } else if (canUseMessageChannel()) {
                    // For web workers, where supported
                    installMessageChannelImplementation(attachTo);
                } else if (canUseReadyStateChange()) {
                    // For IE 6–8
                    installReadyStateChangeImplementation(attachTo);
                } else {
                    // For older browsers
                    installSetTimeoutImplementation(attachTo);
                }

                attachTo.clearImmediate = tasks.remove;
            }
        }(window));


    },
    performanceNow: function() {

        // prepare base perf object
        if (typeof window.performance === 'undefined') {
            window.performance = {};
        }

        if (!window.performance.now) {

            var nowOffset = Date.now();

            if (performance.timing && performance.timing.navigationStart) {
                nowOffset = performance.timing.navigationStart
            }


            window.performance.now = function now() {
                return Date.now() - nowOffset;
            }
        }
    },
    localStorage: function() {
        //https://gist.github.com/remy/350433
        if (typeof window.localStorage == 'undefined' || typeof window.sessionStorage == 'undefined')(function() {

            var Storage = function(type) {
                function createCookie(name, value, days) {
                    var date, expires;

                    if (days) {
                        date = new Date();
                        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                        expires = "; expires=" + date.toGMTString();
                    } else {
                        expires = "";
                    }
                    document.cookie = name + "=" + value + expires + "; path=/";
                }

                function readCookie(name) {
                    var nameEQ = name + "=",
                        ca = document.cookie.split(';'),
                        i, c;

                    for (i = 0; i < ca.length; i++) {
                        c = ca[i];
                        while (c.charAt(0) == ' ') {
                            c = c.substring(1, c.length);
                        }

                        if (c.indexOf(nameEQ) == 0) {
                            return c.substring(nameEQ.length, c.length);
                        }
                    }
                    return null;
                }

                function setData(data) {
                    data = JSON.stringify(data);
                    if (type == 'session') {
                        window.name = data;
                    } else {
                        createCookie('localStorage', data, 365);
                    }
                }

                function clearData() {
                    if (type == 'session') {
                        window.name = '';
                    } else {
                        createCookie('localStorage', '', 365);
                    }
                }

                function getData() {
                    var data = type == 'session' ? window.name : readCookie('localStorage');
                    return data ? JSON.parse(data) : {};
                }


                // initialise if there's already data
                var data = getData();

                return {
                    length: 0,
                    clear: function() {
                        data = {};
                        this.length = 0;
                        clearData();
                    },
                    getItem: function(key) {
                        return data[key] === undefined ? null : data[key];
                    },
                    key: function(i) {
                        // not perfect, but works
                        var ctr = 0;
                        for (var k in data) {
                            if (ctr == i) return k;
                            else ctr++;
                        }
                        return null;
                    },
                    removeItem: function(key) {
                        delete data[key];
                        this.length--;
                        setData(data);
                    },
                    setItem: function(key, value) {
                        data[key] = value + ''; // forces the value to a string
                        this.length++;
                        setData(data);
                    }
                };
            };

            if (typeof window.localStorage == 'undefined') window.localStorage = new Storage('local');
            if (typeof window.sessionStorage == 'undefined') window.sessionStorage = new Storage('session');

        })();
    },
    detectIE11: function() {
        window.isIE = function() {
            return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null)));
        }

    },
    websocket: function() {
        if (!window.WebSocket && window.MozWebSocket) window.WebSocket = window.MozWebSocket;
    },
    errorHandler: function() {
        window.errorCount = 0;
        var lastError = performance.now();
        window.onerror = function(message, source, line, column, errorObj) {

            window.errorCount++;
            if (window.errorCount > 30) return;
            var user = null;
            if (window._UserManager)
                user = _UserManager.GetCurrentUserName();
            var session = null;
            if (window._DataManager)
                session = _DataManager.getCurrentSession();
            var time = (new Date());
            var stack = (errorObj || (new Error())).stack;
            var error = {
                user: user,
                sesssion: session,
                time: time,
                message: message,
                source: source,
                line: line,
                stack: stack,
                column: column
            };
            jQuery.ajax({
                type: 'POST',
                url: './vwfDataManager.svc/error',
                data: JSON.stringify(error),
                contentType: "application/json; charset=utf-8",
                success: function(err, data, xhr) {

                    if (performance.now() - lastError > 5000) {
                        if (xhr.status != 200) {
                            if (console.error)
                                console.error('Sorry, an error has occured, but could not be logged');
                        } else
                        if (console.error)
                            console.error('Sorry, an error has occured and was logged to the server.');
                        lastError = performance.now();
                    }
                },
                error: function(e) {
                    if (performance.now() - lastError > 5000) {
                        if (console.error)
                            console.error('Sorry, an error has occured, but could not be logged');
                        lastError = performance.now();
                    }
                },
                async: true,
                dataType: "text"
            });
        };
    }
}
fills.setup();