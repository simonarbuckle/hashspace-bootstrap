(function(define) {
define("carousel/carousel.hsp", ["hsp/$set","./carousel","hsp/rt"], function (module, global){
var require = module.require, exports = module.exports, __filename = module.filename, __dirname = module.dirname;

var $set=require("hsp/$set"); 
// ################################################################ 
//  This file has been generated by the hashspace compiler          
//  Direct MODIFICATIONS WILL BE LOST when the file is recompiled!  
// ################################################################ 
var CarouselController = require("./carousel").CarouselController;


var carousel =$set(exports, "carousel", require("hsp/rt").template({ctl:[CarouselController,"CarouselController"],ref:"ctrl"}, function(n){
  return [n.elt("div",{e1:[3,2,"ctrl","toggleOnHover"],e2:[3,2,"ctrl","toggleOnHover"],e3:[3,2,"ctrl","handleSwipe",1,4],e4:[0,1,"event"]},{"class":"carousel slide"},{"mouseover":1,"mouseout":2,"swipe":3},[n.$if({e1:[6,function(a0) {return (a0 > 1);},2],e2:[1,3,"ctrl","content","length"]},1,[n.elt("ol",0,{"class":"carousel-indicators"},0,[n.$foreach({e1:[1,2,"ctrl","content"]},"idx","slide",0,1,[n.elt("li",{e1:[6,function(a0,a1) {return (((a0 === a1))? ''+"active":'');},2,3],e2:[1,1,"idx"],e3:[1,2,"ctrl","internalIndex"],e4:[3,2,"ctrl","navigate",1,5],e5:[1,1,"idx"]},{"class":["",1]},{"click":4})]),n.$text(0,[" "])])]),n.elt("div",0,{"class":"carousel-inner"},0,[n.$foreach({e1:[1,2,"ctrl","content"]},"idx","slide",0,1,[n.elt("div",{e1:[6,function(a0,a1,a2,a3,a4) {return ["item",(((a0 === a1))? ''+"active":''),((((a0 === a2) && (a3 === "prev")))? ''+"prev":''),((((a0 === a2) && (a3 === "next")))? ''+"next":''),(((((a0 === a1) || (a0 === a2)) && (a4 === "left")))? ''+"left":''),(((((a0 === a1) || (a0 === a2)) && (a4 === "right")))? ''+"right":'')].join(' ');},2,3,4,5,6],e2:[1,1,"idx"],e3:[1,2,"ctrl","internalIndex"],e4:[1,2,"ctrl","nextIndex"],e5:[1,2,"ctrl","ongoingNavigation"],e6:[1,2,"ctrl","navigationDirection"]},{"class":["",1]},0,[n.cpt([null,"slide","body"],0,0,0),n.$if({e1:[1,2,"slide","caption"]},1,[n.elt("div",0,{"class":"carousel-caption"},0,[n.cpt([null,"slide","caption"],0,0,0)])])])]),n.$text(0,[" "])]),n.$if({e1:[3,2,"ctrl","hasPrev"]},1,[n.elt("a",{e1:[3,2,"ctrl","prev"]},{"class":"left carousel-control"},{"click":1},[n.elt("span",0,{"class":"glyphicon glyphicon-chevron-left"},0)])]),n.$if({e1:[3,2,"ctrl","hasNext"]},1,[n.elt("a",{e1:[3,2,"ctrl","next"]},{"class":"right carousel-control"},{"click":1},[n.elt("span",0,{"class":"glyphicon glyphicon-chevron-right"},0)])])])];
}));

});
define("carousel/carousel.js", ["hsp/$set","hsp/klass"], function (module, global){
var require = module.require, exports = module.exports, __filename = module.filename, __dirname = module.dirname;

var $set=require("hsp/$set"); var klass = require("hsp/klass");

var SlideController = new klass({
    attributes: {
        body: { type: "template", defaultContent: true },
        caption: {type: "template"}
    }
});

$set(exports, "CarouselController", new klass({
    attributes:{
        //BS options
        "interval": {type: "int", defaultValue:5000, binding: "1-way"},
        "pause": {type: "string", defaultValue: "hover"},
        "wrap": {type: "boolean", defaultValue: true},
        //BS methods equivalent
        "index": {type: "int", defaultValue: 0, binding: "2-way"},
        //BS events
        "onslidestart": { type: "callback" },
        "onslideend": { type: "callback" },
        //Additionals
        "noTransition": {type: "boolean", defaultValue: false}
    },
    elements: {
        "slide": {type: "component", controller: SlideController}
    },
    $init: function() {
        $set(this, "ongoingNavigation", null); //null, "prev" or "next"
        $set(this, "navigationDirection", null); //null, "left" or "right"
        $set(this, "internalIndex", this.index);
        $set(this, "nextIndex", null);
        $set(this, "isTransitioning", false);
        $set(this, "queue", null);
        $set(this, "transitionEnd", this.noTransition ? false : getTransitionEnd());
        this._startCycling();
    },
    $dispose: function() {
        this._stopCycling();
    },
    $refresh: function() {
        if (this.ongoingNavigation && this.navigationDirection === null) {
            var _this = this;
            //TODO: Remove the setTimeout, the uggly DOM access and the listener part ...
            setTimeout(function() {
                $set(_this, "navigationDirection", _this.ongoingNavigation === "next" ? "left": "right");
                if (_this.transitionEnd) {
                    var activeElement = _this.$getElement(0).querySelectorAll(".item.active")[0];
                    var that = _this;
                    activeElement.addEventListener(that.transitionEnd, function(event) {
                        this.removeEventListener(that.transitionEnd, arguments.callee, false);
                        that._finalizeTransition.call(that);
                    }, false);
                }
            }, 30);
        }
    },
    _getNumberOfSlides: function() {
        return this.content ? this.content.length: 0;
    },
    _finalizeTransition: function() {
        if (this.nextIndex !== null) {
            $set(this, "index", $set(this, "internalIndex", this.nextIndex));
            $set(this, "ongoingNavigation", null);
            $set(this, "navigationDirection", null);
            $set(this, "nextIndex", null);
            $set(this, "isTransitioning", false);
            if (this.onslideend) {
                this.onslideend({});
            }
            if (this.queue) {
                var queueContent = this.queue;
                $set(this, "queue", null);
                switch (queueContent.action) {
                    case "next":
                        this.next();
                        break;
                    case "prev":
                        this.prev();
                        break;
                    case "slide":
                        this._navigateTo(queueContent.index);
                        break;
                }
            }
        }
    },
    _navigateTo: function(nextIndex, isToRight) {
        if (nextIndex != this.internalIndex && !this.isTransitioning) {
            $set(this, "isTransitioning", true);
            if (this.onslidestart) {
                this.onslidestart({});
            }
            if (this.transitionEnd) {
                $set(this, "nextIndex", nextIndex);
                $set(this, "ongoingNavigation", (isToRight || typeof isToRight === "undefined" && nextIndex > this.internalIndex)? "next" : "prev");
            }
            else {
                $set(this, "internalIndex", $set(this, "nextIndex", nextIndex));
                this._finalizeTransition();
            }
        }
    },
    prev: function() {
        if (this.isTransitioning) {
            $set(this, "queue", {action: "prev"});
        }
        else if (this.hasPrev()) {
            var nextIndex = this.internalIndex - 1 < 0 ? this._getNumberOfSlides() - 1 : this.internalIndex - 1;
            this._navigateTo(nextIndex, false);
        }
    },
    next: function() {
        if (this.isTransitioning) {
            $set(this, "queue", {action: "next"});
        }
        else if (this.hasNext()) {
            var nextIndex = (this.internalIndex + 1) % this._getNumberOfSlides();
            this._navigateTo(nextIndex, true);
        }
    },
    hasPrev: function() {
        return this._getNumberOfSlides() > 1 &&  !(!this.wrap && this.internalIndex === 0);
    },
    hasNext: function() {
        return this._getNumberOfSlides() > 1 && !(!this.wrap && this.internalIndex === (this._getNumberOfSlides() - 1));
    },
    navigate: function(index) {
        if (this.isTransitioning) {
            $set(this, "queue", {action: "slide", index: index});
        }
        else {
            this._navigateTo(index);
        }
    },
    _startCycling: function() {
        if (this.interval >= 0) {
            var _this = this;
            $set(this, "timerId", setInterval(function() {
                _this.next();
            }, this.interval > 600 ? this.interval: 600)); //600ms is the transition duration defined in BS css
        }
    },
    _stopCycling: function() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
        $set(this, "timerId", null);
    },
    toggleOnHover: function() {
        if (this.pause === "hover") {
            if (this.timerId) {
                this._stopCycling();
            } else {
                this._startCycling();
            }
        }
    },
    handleSwipe: function(event) {
        if (event.detail) {
            if (event.detail.direction === "left") {
                this.prev();
            }
            if (event.detail.direction === "right") {
                this.next();
            }
        }
    },
    onIndexChange: function(newValue, oldValue) {
        if (this.index >= 0 && this.index < this._getNumberOfSlides()) {
            this._navigateTo(this.index);
        }
        else {
            $set(this, "index", oldValue);
        }
    },
    onIntervalChange: function(newValue, oldValue) {
        if (newValue !== oldValue) {
            this._stopCycling();
            this._startCycling();
        }
    },
    onContentChange: function(newContent, oldContent) {
        if (newContent.length !== oldContent.length) {
            var newIndex = newContent.indexOf(oldContent[this.internalIndex]);
            if (newIndex != this.internalIndex && newIndex > -1) {
                $set(this, "index", $set(this, "internalIndex", newIndex));
            }
            if (this.internalIndex >= newContent.length) {
                $set(this, "index", $set(this, "internalIndex", newContent.length - 1));
            }
        }
    }
}));

// CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
// ============================================================
function getTransitionEnd() {
    var el = document.createElement('hashspace-bootstrap');
    var transEndEventNames = {
        WebkitTransition : 'webkitTransitionEnd',
        MozTransition    : 'transitionend',
        OTransition      : 'oTransitionEnd otransitionend',
        transition       : 'transitionend'
    };
    for (var name in transEndEventNames) {
        if (el.style[name] !== undefined) {
            return transEndEventNames[name];
        }
    }
    return false;
}

});
define("tabbar/tabbar.hsp", ["hsp/$set","./tabbar","hsp/rt"], function (module, global){
var require = module.require, exports = module.exports, __filename = module.filename, __dirname = module.dirname;

var $set=require("hsp/$set"); 
// ################################################################ 
//  This file has been generated by the hashspace compiler          
//  Direct MODIFICATIONS WILL BE LOST when the file is recompiled!  
// ################################################################ 
var tabCtrl = require("./tabbar");
var tabbarController = tabCtrl.TabbarController;


var tabbar =$set(exports, "tabbar", require("hsp/rt").template({ctl:[tabbarController,"tabbarController"],ref:"ctrl"}, function(n){
  return [n.elt("ul",{e1:[6,function(a0,a1,a2,a3) {return ["nav",((a0)? ''+"nav-tabs":''),((a1)? ''+"nav-pills":''),((a2)? ''+"nav-stacked":''),((a3)? ''+"nav-justified":'')].join(' ');},2,3,4,5],e2:[1,2,"ctrl","_tabsClass"],e3:[1,2,"ctrl","_pillsClass"],e4:[1,2,"ctrl","_stackedClass"],e5:[1,2,"ctrl","justified"]},{"class":["",1],"role":"tablist"},0,[n.$foreach({e1:[1,2,"ctrl","content"]},"idx","tab",0,1,[n.elt("li",{e1:[6,function(a0,a1,a2) {return [(((a0 === a1))? ''+"active":''),((a2)? ''+"disabled":'')].join(' ');},2,3,4],e2:[1,1,"idx"],e3:[1,2,"ctrl","index"],e4:[1,2,"tab","disabled"]},{"class":["",1]},0,[n.elt("a",{e1:[3,2,"ctrl","activate",1,2,1,3],e2:[0,1,"event"],e3:[1,1,"idx"]},{"href":"#","role":"tab"},{"click":1},[n.cpt([null,"tab","label"],0,0,0)])])]),n.$text(0,[" "])]),n.elt("div",0,{"class":"tab-content"},0,[n.$foreach({e1:[1,2,"ctrl","content"]},"idx","tab",0,1,[n.$if({e1:[1,2,"tab","_isActive"]},1,[n.elt("div",{e1:[6,function(a0,a1) {return ["tab-pane","active",((a0)? ''+"fade":''),((a1)? ''+"in":'')].join(' ');},2,3],e2:[1,2,"tab","_fade"],e3:[1,2,"tab","_in"]},{"class":["",1]},0,[n.cpt([null,"tab","content"],0,0,0)])])]),n.$text(0,[" "])])];
}));

});
define("tabbar/tabbar.js", ["hsp/$set","hsp/klass"], function (module, global){
var require = module.require, exports = module.exports, __filename = module.filename, __dirname = module.dirname;

var $set=require("hsp/$set"); var klass = require("hsp/klass");

var queue = new klass({
    $constructor: function() {
        $set(this, "_queue", []);
    },

    add : function(obj, property, value, duration) {
        var queue = this._queue;
        queue.push({
            obj: obj,
            property: property,
            value: value,
            duration: duration
        });
        if (queue.length === 1) {
            // Nothing in the queue before, we can process the queue right now
            this.next();
        }
    },

    next : function() {
        var queue = this._queue;
        if (queue.length) {
            var that = this;
            setTimeout(function() {
                // Animation is done by changing a class on the html, i.e. changing a property in the model
                var animation = queue.shift();
                $set(animation.obj, animation.property, animation.value);
                var duration = animation.duration;
                // If duration is not defined, the queue must be managed by javascrit events (transition end, ...)
                // and next() must be called externally
                if (duration) {
                    setTimeout(function() {that.next();}, duration);
                }
            }, 1);
        }
    },
    getLength : function() {
        return this._queue.length;
    }
});
var _animationQueue = new queue();

var _tabId = 0;
var TabController = new klass({
    attributes: {
        label: {type: "template"},
        disabled: {type: "boolean", defaultValue: false},
        content: {type: "template", defaultContent: true}
    },

    $init: function() {
        if (this._isActive == null) {
            $set(this, "_isActive", false);
        }
        $set(this, "_id", _tabId);
        _tabId++;

    },

    toggleActivation : function(status) {
        status = status == null ?
                !this._isActive :
                status;
        if (this._fade) {
            if (status) {
                _animationQueue.add(this, "_isActive", true, 1);
                _animationQueue.add(this, "_in", true);
            } else {
                _animationQueue.add(this, "_in", false);
                _animationQueue.add(this, "_isActive", false, 1);
            }
         } else {
            $set(this, "_isActive", status);
         }
    },

    isActive : function() {
        return this._isActive;
    },

    toggleFading : function(isEnable) {
        $set(this, "_fade", isEnable);
    }
});

$set(exports, "TabbarController", new klass({
    attributes: {
        index: {type: "int", defaultValue: 0, binding: "2-way"},
        noTransition: {type: "boolean", defaultValue: false},
        display: {type: "string", defaultValue: "tabs"},
        justified: {type: "boolean", defaultValue: false},
        //BS events
        "onshow": { type: "callback" },
        "onshown": { type: "callback" },
    },
    elements: {
        "tab": {type: "component", controller: TabController}
    },
    $init: function() {

        var display = this.display;
        if (display == "pills") {
            $set(this, "_tabsClass", false);
            $set(this, "_pillsClass", true);
            $set(this, "_stackedClass", false);
        } else if (display == "vertical") {
            $set(this, "_tabsClass", false);
            $set(this, "_pillsClass", true);
            $set(this, "_stackedClass", true);
        } else {
            // default 'tabs'
            $set(this, "_tabsClass", true);
            $set(this, "_pillsClass", false);
            $set(this, "_stackedClass", false);
        }

        if (!this.noTransition) {
            var transitionEnd = getTransitionEnd();
            if (transitionEnd) {
                // Initialize the tabs for fading
                var tabs = this.content;
                for(var i = 0; i < tabs.length; i++) {
                    tabs[i].toggleFading(true);
                }

                var that = this;
                //TODO: Remove the setTimeout, the uggly DOM access and the listener part ...
                setTimeout(function() {
                    var tabContentDiv = that.$getElement(1);
                    // Required for disposal
                    $set(this, "_event", {
                        dom: tabContentDiv,
                        name: transitionEnd,
                        fn: function() {
                            if (!_animationQueue.getLength() && that.onshown) {
                                // Callback after content show
                                that.onshown();
                            }
                            _animationQueue.next();
                        }
                    });
                    tabContentDiv.addEventListener(transitionEnd, this._event.fn, false);
                }, 25);
            } else {
                // Animations not supported
                $set(this, "noTransition", true);
            }
        }

        // Initialize
        this.content[this.index].toggleActivation(true);

    },
    $dispose: function() {
        if (this._event) {
            var event = this._event;
            event.dom.removeEventListener(event.name, event.fn);
        }
    },
    activate: function(event, idx) {
        if (!this.content[idx].disabled) {
            $set(this, "index", idx);
        }
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            $set(event, "returnValue", false);
        }
    },
    _getNumberOfTabs: function() {
        return this.content ? this.content.length: 0;
    },
    onIndexChange: function(newIndex, oldIndex) {
        var nbTabs = this._getNumberOfTabs();
        if (newIndex < 0) {
            newIndex = 0;
        }
        if (newIndex >= nbTabs) {
            newIndex = nbTabs - 1;
        }

        if (this.index != newIndex) {
            $set(this, "index", newIndex);
        }

        // Manage the case where nothing change
        if (newIndex == oldIndex) {
            return;
        }

        // Callback before content show
        if (this.onshow) {
            this.onshow();
        }

        // Toggle the contents
        this.content[oldIndex].toggleActivation(false);
        this.content[newIndex].toggleActivation(true);

        if (this.noTransition && this.onshown) {
            // Callback after content show, directly called when no animation
            this.onshown();
        }


    },
    onContentChange: function(newContent, oldContent) {

        // Look for the active tab, and set the index, in order to be sure that the old active tab is still selected
        var found = false;
        var newLength = newContent.length;
        for(var i = 0; i < newLength; i++) {
            if (newContent[i].isActive()) {
                found = true;
                break;
            }
        }
        if (found) {
            $set(this, "index", i);
        } else {
            if (this.index >= newLength) {
                $set(this, "index", newLength - 1);
            }
        }
    }
}));

//CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
//============================================================
function getTransitionEnd() {
 var el = document.createElement('hashspace-bootstrap');
 var transEndEventNames = {
     WebkitTransition : 'webkitTransitionEnd',
     MozTransition    : 'transitionend',
     OTransition      : 'oTransitionEnd otransitionend',
     transition       : 'transitionend'
 };
 for (var name in transEndEventNames) {
     if (el.style[name] !== undefined) {
         return transEndEventNames[name];
     }
 }
 return false;
}

});
})(noder.define);