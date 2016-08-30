/**
 * Created by zrj on 2016/8/24.
 */

!function (exports) {
    "strict"

    var WordCloud = function (selector, option) {
        var wc = new Construct(selector, option);
        return wc;
    };

    if (typeof $ === "undefined") {
        var jquery = function (selector) {
            var reg = /<([A-Za-z]+)>/;
            var res = reg.exec(selector);
            var dom;
            if (res) {
                //属于<a>这种的类型？
                dom = document.createElement(res[1]);
            } else {
                dom = document.querySelector(selector);
            }
            _compatible.call(dom);
            return dom;
        };
        
        var $ = jquery;
        jquery.extend = function () {
            var n = arguments.length;
            if (arguments.length === 1) {

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
        };
        
        jquery.each = function (array, callback) {
            for(var i=0;i<array.length;i++){
                callback(i,array[i]);
            }
        };
    }

    function Construct(selector, options) {
        this.selector = selector;
        var $this =  $(selector);

        var default_options = {
            width: $this.width(),
            height: $this.height(),
            center: {
                x: ((options && options.width) ? options.width : $this.width()) / 2.0,
                y: ((options && options.height) ? options.height : $this.height()) / 2.0
            },
            delayedMode: false,
            shape: false, // It defaults to elliptic shape
            encodeURI: true,
            removeOverflowing: true,
            font_color: "#369"
        };
        this.cloud_namespace = $this.attr('id') || Math.floor((Math.random() * 1000000)).toString(36);
        this.options = $.extend(default_options, options || {});
        this.save_words = [];


        if ($this.css("position") === "static") {
            $this.css("position", "relative");
        }

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", $this.width());
        svg.setAttribute("height", $this.height());
        svg.setAttribute("class", "wordcloudsvg");
        $this.append(svg);
        this.svg = svg;
    }

    var _drawWordCloud = function (word_array) {
        var save_words = this.save_words;
        var svg = this.svg;
        var cloud_namespace = this.cloud_namespace;
        var weightGap;
        var $this = this.svg;
        var options = this.options;

        // Namespace word ids to avoid collisions between multiple clouds

        // Make sure every weight is a number before sorting
        for (var i = 0; i < word_array.length; i++) {
            word_array[i].weight = parseFloat(word_array[i].weight, 10);
        }

        // Sort word_array from the word with the highest weight to the one with the lowest
        word_array.sort(function(a, b) { if (a.weight < b.weight) {return 1;} else if (a.weight > b.weight) {return -1;} else {return 0;} });

        weightGap=word_array[0].weight-word_array[word_array.length-1].weight;
        var step = (options.shape === "rectangular") ? 18.0 : 2.0,aspect_ratio = options.width / options.height;
        var already_placed_words = [], aspect_ratio = options.width / options.height;

        var deleteDom = function (word_array) {
            for(var i=0;i<word_array.length;i++){
                if(save_words[word_array[i].text]){
                    var words_text = word_array[i].text;
                    svg.removeChild(save_words[words_text]);
                    delete  save_words[words_text];
                }
            }
        }

        var drawOneWord  = function (index, word) {
            // var cloud_namespace = this.cloud_namespace;
            // var word_array = this.word_array;
            // var options  = this.options;
            // var svg = this.svg;

            var word_id = cloud_namespace + "_word_" + index,
                angle = 6.28 * Math.random(),
                radius = 0.0,

                // Only used if option.shape == 'rectangular'
                steps_in_direction = 0.0,
                quarter_turns = 0.0,

                weight = 5,
                custom_class = "",
                inner_html = "",
                word_span;

            // Extend word html options with defaults
            word.html = $.extend(word.html, {id: word_id});

            // If custom class was specified, put them into a variable and remove it from html attrs, to avoid overwriting classes set by jQCloud
            if (word.html && word.html["class"]) {
                custom_class = word.html["class"];
                delete word.html["class"];
            }

            // Check if min(weight) > max(weight) otherwise use default
            if (word_array[0].weight > word_array[word_array.length - 1].weight) {
                // Linearly map the original weight to a discrete scale from 1 to 10
                weight = Math.round((word.weight - word_array[word_array.length - 1].weight) /
                        (word_array[0].weight - word_array[word_array.length - 1].weight) * 9.0) + 1;
            }
            word_span = document.createElementNS("http://www.w3.org/2000/svg", "text");
            _compatible.call(word_span);

            word_span.setAttribute("class", 'w' + weight + " " + custom_class);
            word_span.setAttribute("id", word.html.id);
            word_span.setAttribute("fill", options.font_color);
            word_span.style.fontSize = weight * 5;
            // ("font-size",weight*5);
            // var word_span = $("<text></text>").attr("class",'w' + weight + " " + custom_class)
            //   .attr("id",word.html.id).attr("fill",options.font_color).css("font-size",weight*5);
            var wg = document.createElementNS("http://www.w3.org/2000/svg", "g");
            save_words[word.text] = wg;
            wg.setAttribute("class", "wd");
            wg.appendChild(word_span)
            // var wg = $("<g></g>").attr("class","wd").append(word_span);
            svg.appendChild(wg);
            word_span.textContent = word.text;

            //***********************add my code***************************

            var rect = word_span.getBoundingClientRect();
            var width = parseInt(rect.width),
                height = parseInt(rect.height),
                left = options.center.x - width / 2.0,
                top = options.center.y - height / 2.0;

            word_span.setAttribute("x", left);
            word_span.setAttribute("y", top);
            // word_span.attr("x",left);
            // word_span.attr("y",top);
            while (hitTest(word_span, already_placed_words)) {
                // option shape is 'rectangular' so move the word in a rectangular spiral
                if (options.shape === "rectangular") {
                    steps_in_direction++;
                    if (steps_in_direction * step > (1 + Math.floor(quarter_turns / 2.0)) * step * ((quarter_turns % 4 % 2) === 0 ? 1 : aspect_ratio)) {
                        steps_in_direction = 0.0;
                        quarter_turns++;
                    }
                    switch (quarter_turns % 4) {
                        case 1:
                            left += step * aspect_ratio + Math.random() * 2.0;
                            break;
                        case 2:
                            top -= step + Math.random() * 2.0;
                            break;
                        case 3:
                            left -= step * aspect_ratio + Math.random() * 2.0;
                            break;
                        case 0:
                            top += step + Math.random() * 2.0;
                            break;
                    }
                } else { // Default settings: elliptic spiral shape
                    radius += step;
                    angle += (index % 2 === 0 ? 1 : -1) * step;

                    left = options.center.x - (width / 2.0) + (radius * Math.cos(angle)) * aspect_ratio;
                    top = options.center.y + radius * Math.sin(angle) - (height / 2.0);
                }
                // word_span.attr("x",left);
                word_span.setAttribute("x", left);
                word_span.setAttribute("y", top);
                // word_span.attr("y",top);
            }
            if (options.removeOverflowing && (left < 0 || top < 0 || (left + width) > options.width || (top + height) > options.height)) {
                word_span.remove();
                return;
            }

            already_placed_words.push(word_span);

            // Invoke callback if existing
            if ($.isFunction(word.afterWordRender)) {
                word.afterWordRender.call(word_span);
            }


        };
        // Iterate drawOneWord on every word. The way the iteration is done depends on the drawing mode (delayedMode is true or false)
        if (options.delayedMode) {
            drawOneWordDelayed();
        }
        else {
            deleteDom(word_array);
            for(var i=0;i<word_array.length;i++){
                drawOneWord(i,word_array[i]);
            }

            // $.each(word_array, this.drawOneWord);
            if ($.isFunction(options.afterCloudRender)) {
                options.afterCloudRender.call($this);
            }
        }
        // this.pre_words = word_array;

    };

    var drawOneWordDelayed = function (index) {
        index = index || 0;
        if (!$this.is(':visible')) { // if not visible then do not attempt to draw
            setTimeout(function () {
                drawOneWordDelayed(index);
            }, 10);
            return;
        }
        if (index < word_array.length) {
            drawOneWord(index, word_array[index]);
            setTimeout(function () {
                drawOneWordDelayed(index + 1);
            }, 10);
        } else {
            if ($.isFunction(options.afterCloudRender)) {
                options.afterCloudRender.call($this);
            }
        }
    };


    // Helper function to test if an element overlaps others
    var hitTest = function (elem, other_elems) {
        // Pairwise overlap detection

        var i = 0;
        // Check elements for overlap one by one, stop and return false as soon as an overlap is found
        for (i = 0; i < other_elems.length; i++) {
            if (overlapping(elem, other_elems[i])) {
                return true;
            }
        }
        return false;
    };
    var overlapping = function (a, b) {
        var aleft = parseInt(a.getAttribute("x"));
        var abotton = parseInt(a.getAttribute("y"));


        var awidth = parseInt(a.width());
        var aheight = parseInt(a.height());

        var bleft = parseInt(b.getAttribute("x"));
        var bbotton = parseInt(b.getAttribute("y"));
        var bwidth = parseInt(b.width());
        var bheight = parseInt(b.height());

        var acx = aleft + awidth / 2;
        var acy = abotton - aheight / 2;
        var bcx = bleft + bwidth / 2;
        var bcy = bbotton - bheight / 2;

        if (Math.abs(2.0 * acx - 2.0 * bcx) < awidth + bwidth+10) {
            if (Math.abs(2.0 * acy - 2.0 * bcy) < aheight + bheight+10) {
                //overlap
                return true;
            }
        }
        return false;
    };

    function _compatible() {

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
        };

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
    }

    var prop = {
        getSelector: function () {
            return this.selector;
        },
        drawWordCloud: _drawWordCloud,
        // drawOneWord:drawOneWord
    };



    Construct.prototype = prop;
    exports.SvgCloud = WordCloud;


}(window);
