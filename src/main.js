/**
 * Created by zrj on 2016/8/24.
 */


!function (exports) {
    var WordCloud = function (selector,option) {
        var wc = new constructor(selector,option);
        return wc;
    };

    function constructor(selector,option) {
        this.selector = selector;
        this.option = option;
    }
    constructor.prototype = {
        getSelector:function () {
            return this.selector;
        }
    };

    exports.WordCloud = WordCloud;
}(window)
