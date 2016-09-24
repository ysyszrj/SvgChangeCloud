/**
 * Created by zrj on 2016/8/24.
 */
exports = typeof window === 'undefined' ? global : window;
exports.compatible = function () {

    var $this = this;
    this.width = function () {
        return pCss($this, "width");
    };
    this.height = function () {
        console.log(this);
        return pCss($this, "height");
    };
    this.attr = function (key, value) {
        if (value === undefined) {
            return $this.getAttribute(key);
        } else {
            $this.setAttribute(key, value);
            return $this;
        }
    };

    // #83，#356，第一步，小驼峰
    var rmsPrefix = /^-ms-/,
        rdashAlpha = /-([\da-z])/gi,
        fcamelCase = function (all, letter) {
            return letter.toUpperCase();
        };

    var camelCase = function (string) {
        return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
    };

    this.css = function (key, value) {
        key = camelCase(key);
        if (typeof value === "undefined") {
            if (window.getComputedStyle) {
                var view = $this.ownerDocument.defaultView;
                return view.getComputedStyle($this)[key];
            } else if (documentElement.currentStyle) {
                return $this.currentStyle;
            }
        } else {
            $this.style[key] = value;
        }
    };

    this.append = function (child) {
        $this.appendChild(child);
    };

    this.is = function (selector) {
        if (selector === ":visible") {
            return true;
        }
    }

    function pCss(et, prop) {
        var rect = et.getBoundingClientRect();
        return rect[prop];
    }

    if (typeof $ === "undefined") {
        (function (exports) {
            var jquery = function (selector) {
                var dom = document.createElement(selector.slice(1, selector.length - 1));
                compatible.call(dom);
                return dom;
            };
            exports.$ = jquery;
            jquery.extend = function () {
                var n = arguments.length;
                if (arguments.length === 1) {
                    return arguments[0];
                }
                var target = arguments[0] || {};
                for (var i = 1; i < n; i++) {
                    var o = arguments[i];
                    for (var name in o) {
                        target[name] = o[name];
                    }
                }
                return target;
            };
            jquery.isFunction = function (obj) {
                if (obj && typeof obj === 'function') {
                    return true;
                }
                return false;
            }
        })(window)
    }
};
