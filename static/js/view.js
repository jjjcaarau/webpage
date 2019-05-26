// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../../node_modules/mithril/mithril.js":[function(require,module,exports) {
var global = arguments[3];
;(function() {
"use strict"
function Vnode(tag, key, attrs0, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs0, children: children, text: text, dom: dom, domSize: undefined, state: undefined, _state: undefined, events: undefined, instance: undefined, skip: false}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node != null && typeof node !== "object") return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined)
	return node
}
Vnode.normalizeChildren = function normalizeChildren(children) {
	for (var i = 0; i < children.length; i++) {
		children[i] = Vnode.normalize(children[i])
	}
	return children
}
var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty
function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}
function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}
function execSelector(state, attrs, children) {
	var hasAttrs = false, childList, text
	var className = attrs.className || attrs.class
	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {}
		for(var key in attrs) {
			if (hasOwn.call(attrs, key)) {
				newAttrs[key] = attrs[key]
			}
		}
		attrs = newAttrs
	}
	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key)) {
			attrs[key] = state.attrs[key]
		}
	}
	if (className !== undefined) {
		if (attrs.class !== undefined) {
			attrs.class = undefined
			attrs.className = className
		}
		if (state.attrs.className != null) {
			attrs.className = state.attrs.className + " " + className
		}
	}
	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			hasAttrs = true
			break
		}
	}
	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		text = children[0].children
	} else {
		childList = children
	}
	return Vnode(state.tag, attrs.key, hasAttrs ? attrs : undefined, childList, text)
}
function hyperscript(selector) {
	// Because sloppy mode sucks
	var attrs = arguments[1], start = 2, children
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}
	if (typeof selector === "string") {
		var cached = selectorCache[selector] || compileSelector(selector)
	}
	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = 1
	}
	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}
	var normalized = Vnode.normalizeChildren(children)
	if (typeof selector === "string") {
		return execSelector(cached, attrs, normalized)
	} else {
		return Vnode(selector, attrs.key, attrs, normalized)
	}
}
hyperscript.trust = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}
hyperscript.fragment = function(attrs1, children) {
	return Vnode("[", attrs1.key, attrs1, Vnode.normalizeChildren(children), undefined, undefined)
}
var m = hyperscript
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")
	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}
	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}
if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") window.Promise = PromisePolyfill
	var PromisePolyfill = window.Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") global.Promise = PromisePolyfill
	var PromisePolyfill = global.Promise
} else {
}
var buildQueryString = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""
	var args = []
	for (var key0 in object) {
		destructure(key0, object[key0])
	}
	return args.join("&")
	function destructure(key0, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key0 + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key0 + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key0) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}
var FILE_PROTOCOL_REGEX = new RegExp("^file://", "i")
var _8 = function($window, Promise) {
	var callbackCount = 0
	var oncompletion
	function setCompletionCallback(callback) {oncompletion = callback}
	function finalizer() {
		var count = 0
		function complete() {if (--count === 0 && typeof oncompletion === "function") oncompletion()}
		return function finalize(promise0) {
			var then0 = promise0.then
			promise0.then = function() {
				count++
				var next = then0.apply(promise0, arguments)
				next.then(complete, function(e) {
					complete()
					if (count === 0) throw e
				})
				return finalize(next)
			}
			return promise0
		}
	}
	function normalize(args, extra) {
		if (typeof args === "string") {
			var url = args
			args = extra || {}
			if (args.url == null) args.url = url
		}
		return args
	}
	function request(args, extra) {
		var finalize = finalizer()
		args = normalize(args, extra)
		var promise0 = new Promise(function(resolve, reject) {
			if (args.method == null) args.method = "GET"
			args.method = args.method.toUpperCase()
			var useBody = (args.method === "GET" || args.method === "TRACE") ? false : (typeof args.useBody === "boolean" ? args.useBody : true)
			if (typeof args.serialize !== "function") args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) {return value} : JSON.stringify
			if (typeof args.deserialize !== "function") args.deserialize = deserialize
			if (typeof args.extract !== "function") args.extract = extract
			args.url = interpolate(args.url, args.data)
			if (useBody) args.data = args.serialize(args.data)
			else args.url = assemble(args.url, args.data)
			var xhr = new $window.XMLHttpRequest(),
				aborted = false,
				_abort = xhr.abort
			xhr.abort = function abort() {
				aborted = true
				_abort.call(xhr)
			}
			xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)
			if (args.serialize === JSON.stringify && useBody && !(args.headers && args.headers.hasOwnProperty("Content-Type"))) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (args.deserialize === deserialize && !(args.headers && args.headers.hasOwnProperty("Accept"))) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			for (var key in args.headers) if ({}.hasOwnProperty.call(args.headers, key)) {
				xhr.setRequestHeader(key, args.headers[key])
			}
			if (typeof args.config === "function") xhr = args.config(xhr, args) || xhr
			xhr.onreadystatechange = function() {
				// Don't throw errors on xhr.abort().
				if(aborted) return
				if (xhr.readyState === 4) {
					try {
						var response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args))
						if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || FILE_PROTOCOL_REGEX.test(args.url)) {
							resolve(cast(args.type, response))
						}
						else {
							var error = new Error(xhr.responseText)
							for (var key in response) error[key] = response[key]
							reject(error)
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}
			if (useBody && (args.data != null)) xhr.send(args.data)
			else xhr.send()
		})
		return args.background === true ? promise0 : finalize(promise0)
	}
	function jsonp(args, extra) {
		var finalize = finalizer()
		args = normalize(args, extra)
		var promise0 = new Promise(function(resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				script.parentNode.removeChild(script)
				resolve(cast(args.type, data))
				delete $window[callbackName]
			}
			script.onerror = function() {
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
				delete $window[callbackName]
			}
			if (args.data == null) args.data = {}
			args.url = interpolate(args.url, args.data)
			args.data[args.callbackKey || "callback"] = callbackName
			script.src = assemble(args.url, args.data)
			$window.document.documentElement.appendChild(script)
		})
		return args.background === true? promise0 : finalize(promise0)
	}
	function interpolate(url, data) {
		if (data == null) return url
		var tokens = url.match(/:[^\/]+/gi) || []
		for (var i = 0; i < tokens.length; i++) {
			var key = tokens[i].slice(1)
			if (data[key] != null) {
				url = url.replace(tokens[i], data[key])
			}
		}
		return url
	}
	function assemble(url, data) {
		var querystring = buildQueryString(data)
		if (querystring !== "") {
			var prefix = url.indexOf("?") < 0 ? "?" : "&"
			url += prefix + querystring
		}
		return url
	}
	function deserialize(data) {
		try {return data !== "" ? JSON.parse(data) : null}
		catch (e) {throw new Error(data)}
	}
	function extract(xhr) {return xhr.responseText}
	function cast(type0, data) {
		if (typeof type0 === "function") {
			if (Array.isArray(data)) {
				for (var i = 0; i < data.length; i++) {
					data[i] = new type0(data[i])
				}
			}
			else return new type0(data)
		}
		return data
	}
	return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback}
}
var requestService = _8(window, PromisePolyfill)
var coreRenderer = function($window) {
	var $doc = $window.document
	var $emptyFragment = $doc.createDocumentFragment()
	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}
	var onevent
	function setEventCallback(callback) {return onevent = callback}
	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": return createText(parent, vnode, nextSibling)
				case "<": return createHTML(parent, vnode, nextSibling)
				case "[": return createFragment(parent, vnode, hooks, ns, nextSibling)
				default: return createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else return createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
		return vnode.dom
	}
	function createHTML(parent, vnode, nextSibling) {
		var match1 = vnode.children.match(/^\s*?<(\w+)/im) || []
		var parent1 = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match1[1]] || "div"
		var temp = $doc.createElement(parent1)
		temp.innerHTML = vnode.children
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
		return fragment
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
		return fragment
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs2 = vnode.attrs
		var is = attrs2 && attrs2.is
		ns = getNameSpace(vnode) || ns
		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element
		if (attrs2 != null) {
			setAttrs(vnode, attrs2, ns)
		}
		insertNode(parent, element, nextSibling)
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode)
		}
		else {
			if (vnode.text != null) {
				if (vnode.text !== "") element.textContent = vnode.text
				else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			}
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				setLateAttrs(vnode)
			}
		}
		return element
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		vnode._state = vnode.state
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		initLifecycle(vnode._state, vnode, hooks)
		vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			var element = createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
			insertNode(parent, element, nextSibling)
			return element
		}
		else {
			vnode.domSize = 0
			return $emptyFragment
		}
	}
	//update
	function updateNodes(parent, old, vnodes, recycling, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null) removeNodes(old, 0, old.length, vnodes)
		else {
			if (old.length === vnodes.length) {
				var isUnkeyed = false
				for (var i = 0; i < vnodes.length; i++) {
					if (vnodes[i] != null && old[i] != null) {
						isUnkeyed = vnodes[i].key == null && old[i].key == null
						break
					}
				}
				if (isUnkeyed) {
					for (var i = 0; i < old.length; i++) {
						if (old[i] === vnodes[i]) continue
						else if (old[i] == null && vnodes[i] != null) createNode(parent, vnodes[i], hooks, ns, getNextSibling(old, i + 1, nextSibling))
						else if (vnodes[i] == null) removeNodes(old, i, i + 1, vnodes)
						else updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), recycling, ns)
					}
					return
				}
			}
			recycling = recycling || isRecyclable(old, vnodes)
			if (recycling) {
				var pool = old.pool
				old = old.concat(old.pool)
			}
			var oldStart = 0, start = 0, oldEnd = old.length - 1, end = vnodes.length - 1, map
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldStart], v = vnodes[start]
				if (o === v && !recycling) oldStart++, start++
				else if (o == null) oldStart++
				else if (v == null) start++
				else if (o.key === v.key) {
					var shouldRecycle = (pool != null && oldStart >= old.length - pool.length) || ((pool == null) && recycling)
					oldStart++, start++
					updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), shouldRecycle, ns)
					if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
				}
				else {
					var o = old[oldEnd]
					if (o === v && !recycling) oldEnd--, start++
					else if (o == null) oldEnd--
					else if (v == null) start++
					else if (o.key === v.key) {
						var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
						updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
						if (recycling || start < end) insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling))
						oldEnd--, start++
					}
					else break
				}
			}
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldEnd], v = vnodes[end]
				if (o === v && !recycling) oldEnd--, end--
				else if (o == null) oldEnd--
				else if (v == null) end--
				else if (o.key === v.key) {
					var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
					updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
					if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
					if (o.dom != null) nextSibling = o.dom
					oldEnd--, end--
				}
				else {
					if (!map) map = getKeyMap(old, oldEnd)
					if (v != null) {
						var oldIndex = map[v.key]
						if (oldIndex != null) {
							var movable = old[oldIndex]
							var shouldRecycle = (pool != null && oldIndex >= old.length - pool.length) || ((pool == null) && recycling)
							updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns)
							insertNode(parent, toFragment(movable), nextSibling)
							old[oldIndex].skip = true
							if (movable.dom != null) nextSibling = movable.dom
						}
						else {
							var dom = createNode(parent, v, hooks, ns, nextSibling)
							nextSibling = dom
						}
					}
					end--
				}
				if (end < start) break
			}
			createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
			removeNodes(old, oldStart, oldEnd + 1, vnodes)
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode._state = old._state
			vnode.events = old.events
			if (!recycling && shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					if (recycling) {
						vnode.state = {}
						initLifecycle(vnode.attrs, vnode, hooks)
					}
					else updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, nextSibling); break
					case "[": updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, recycling, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns)
		}
		else {
			removeNode(old, null)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, nextSibling) {
		if (old.children !== vnode.children) {
			toFragment(old)
			createHTML(parent, vnode, nextSibling)
		}
		else vnode.dom = old.dom, vnode.domSize = old.domSize
	}
	function updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, recycling, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, recycling, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns
		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text //FIXME handle0 multiple children
				vnode.text = undefined
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode)
		}
		else if (old.text != null && vnode.text != null && vnode.text !== "") {
			if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
		}
		else {
			if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
			if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			updateNodes(element, old.children, vnode.children, recycling, hooks, null, ns)
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		if (recycling) {
			initComponent(vnode, hooks)
		} else {
			vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
			if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
			if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
			updateLifecycle(vnode._state, vnode, hooks)
		}
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, recycling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(old.instance, null)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function isRecyclable(old, vnodes) {
		if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
			var oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0
			var poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0
			var vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0
			if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
				return true
			}
		}
		return false
	}
	function getKeyMap(vnodes, end) {
		var map = {}, i = 0
		for (var i = 0; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				var key2 = vnode.key
				if (key2 != null) map[key2] = i
			}
		}
		return map
	}
	function toFragment(vnode) {
		var count0 = vnode.domSize
		if (count0 != null || vnode.dom == null) {
			var fragment = $doc.createDocumentFragment()
			if (count0 > 0) {
				var dom = vnode.dom
				while (--count0) fragment.appendChild(dom.nextSibling)
				fragment.insertBefore(dom, fragment.firstChild)
			}
			return fragment
		}
		else return vnode.dom
	}
	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}
	function insertNode(parent, dom, nextSibling) {
		if (nextSibling && nextSibling.parentNode) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}
	function setContentEditable(vnode) {
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
	}
	//remove
	function removeNodes(vnodes, start, end, context) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				if (vnode.skip) vnode.skip = false
				else removeNode(vnode, context)
			}
		}
	}
	function removeNode(vnode, context) {
		var expected = 1, called = 0
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = vnode.attrs.onbeforeremove.call(vnode.state, vnode)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeremove === "function") {
			var result = vnode._state.onbeforeremove.call(vnode.state, vnode)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		continuation()
		function continuation() {
			if (++called === expected) {
				onremove(vnode)
				if (vnode.dom) {
					var count0 = vnode.domSize || 1
					if (count0 > 1) {
						var dom = vnode.dom
						while (--count0) {
							removeNodeFromDOM(dom.nextSibling)
						}
					}
					removeNodeFromDOM(vnode.dom)
					if (context != null && vnode.domSize == null && !hasIntegrationMethods(vnode.attrs) && typeof vnode.tag === "string") { //TODO test custom elements
						if (!context.pool) context.pool = [vnode]
						else context.pool.push(vnode)
					}
				}
			}
		}
	}
	function removeNodeFromDOM(node) {
		var parent = node.parentNode
		if (parent != null) parent.removeChild(node)
	}
	function onremove(vnode) {
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") vnode.attrs.onremove.call(vnode.state, vnode)
		if (typeof vnode.tag !== "string") {
			if (typeof vnode._state.onremove === "function") vnode._state.onremove.call(vnode.state, vnode)
			if (vnode.instance != null) onremove(vnode.instance)
		} else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}
	//attrs2
	function setAttrs(vnode, attrs2, ns) {
		for (var key2 in attrs2) {
			setAttr(vnode, key2, null, attrs2[key2], ns)
		}
	}
	function setAttr(vnode, key2, old, value, ns) {
		var element = vnode.dom
		if (key2 === "key" || key2 === "is" || (old === value && !isFormAttribute(vnode, key2)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key2)) return
		var nsLastIndex = key2.indexOf(":")
		if (nsLastIndex > -1 && key2.substr(0, nsLastIndex) === "xlink") {
			element.setAttributeNS("http://www.w3.org/1999/xlink", key2.slice(nsLastIndex + 1), value)
		}
		else if (key2[0] === "o" && key2[1] === "n" && typeof value === "function") updateEvent(vnode, key2, value)
		else if (key2 === "style") updateStyle(element, old, value)
		else if (key2 in element && !isAttribute(key2) && ns === undefined && !isCustomElement(vnode)) {
			if (key2 === "value") {
				var normalized0 = "" + value // eslint-disable-line no-implicit-coercion
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select") {
					if (value === null) {
						if (vnode.dom.selectedIndex === -1 && vnode.dom === $doc.activeElement) return
					} else {
						if (old !== null && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) return
					}
				}
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old != null && vnode.dom.value === normalized0) return
			}
			// If you assign an input type1 that is not supported by IE 11 with an assignment expression, an error0 will occur.
			if (vnode.tag === "input" && key2 === "type") {
				element.setAttribute(key2, value)
				return
			}
			element[key2] = value
		}
		else {
			if (typeof value === "boolean") {
				if (value) element.setAttribute(key2, "")
				else element.removeAttribute(key2)
			}
			else element.setAttribute(key2 === "className" ? "class" : key2, value)
		}
	}
	function setLateAttrs(vnode) {
		var attrs2 = vnode.attrs
		if (vnode.tag === "select" && attrs2 != null) {
			if ("value" in attrs2) setAttr(vnode, "value", null, attrs2.value, undefined)
			if ("selectedIndex" in attrs2) setAttr(vnode, "selectedIndex", null, attrs2.selectedIndex, undefined)
		}
	}
	function updateAttrs(vnode, old, attrs2, ns) {
		if (attrs2 != null) {
			for (var key2 in attrs2) {
				setAttr(vnode, key2, old && old[key2], attrs2[key2], ns)
			}
		}
		if (old != null) {
			for (var key2 in old) {
				if (attrs2 == null || !(key2 in attrs2)) {
					if (key2 === "className") key2 = "class"
					if (key2[0] === "o" && key2[1] === "n" && !isLifecycleMethod(key2)) updateEvent(vnode, key2, undefined)
					else if (key2 !== "key") vnode.dom.removeAttribute(key2)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function isAttribute(attr) {
		return attr === "href" || attr === "list" || attr === "form" || attr === "width" || attr === "height"// || attr === "type"
	}
	function isCustomElement(vnode){
		return vnode.attrs.is || vnode.tag.indexOf("-") > -1
	}
	function hasIntegrationMethods(source) {
		return source != null && (source.oncreate || source.onupdate || source.onbeforeremove || source.onremove)
	}
	//style
	function updateStyle(element, old, style) {
		if (old === style) element.style.cssText = "", old = null
		if (style == null) element.style.cssText = ""
		else if (typeof style === "string") element.style.cssText = style
		else {
			if (typeof old === "string") element.style.cssText = ""
			for (var key2 in style) {
				element.style[key2] = style[key2]
			}
			if (old != null && typeof old !== "string") {
				for (var key2 in old) {
					if (!(key2 in style)) element.style[key2] = ""
				}
			}
		}
	}
	//event
	function updateEvent(vnode, key2, value) {
		var element = vnode.dom
		var callback = typeof onevent !== "function" ? value : function(e) {
			var result = value.call(element, e)
			onevent.call(element, e)
			return result
		}
		if (key2 in element) element[key2] = typeof value === "function" ? callback : null
		else {
			var eventName = key2.slice(2)
			if (vnode.events === undefined) vnode.events = {}
			if (vnode.events[key2] === callback) return
			if (vnode.events[key2] != null) element.removeEventListener(eventName, vnode.events[key2], false)
			if (typeof value === "function") {
				vnode.events[key2] = callback
				element.addEventListener(eventName, vnode.events[key2], false)
			}
		}
	}
	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") source.oninit.call(vnode.state, vnode)
		if (typeof source.oncreate === "function") hooks.push(source.oncreate.bind(vnode.state, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(source.onupdate.bind(vnode.state, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		var forceVnodeUpdate, forceComponentUpdate
		if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") forceVnodeUpdate = vnode.attrs.onbeforeupdate.call(vnode.state, vnode, old)
		if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeupdate === "function") forceComponentUpdate = vnode._state.onbeforeupdate.call(vnode.state, vnode, old)
		if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
			vnode.instance = old.instance
			return true
		}
		return false
	}
	function render(dom, vnodes) {
		if (!dom) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = []
		var active = $doc.activeElement
		var namespace = dom.namespaceURI
		// First time0 rendering into a node clears it out
		if (dom.vnodes == null) dom.textContent = ""
		if (!Array.isArray(vnodes)) vnodes = [vnodes]
		updateNodes(dom, dom.vnodes, Vnode.normalizeChildren(vnodes), false, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
		dom.vnodes = vnodes
		// document.activeElement can return null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement
		if (active != null && $doc.activeElement !== active) active.focus()
		for (var i = 0; i < hooks.length; i++) hooks[i]()
	}
	return {render: render, setEventCallback: setEventCallback}
}
function throttle(callback) {
	//60fps translates to 16.6ms, round it down since setTimeout requires int
	var time = 16
	var last = 0, pending = null
	var timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout
	return function() {
		var now = Date.now()
		if (last === 0 || now - last >= time) {
			last = now
			callback()
		}
		else if (pending === null) {
			pending = timeout(function() {
				pending = null
				callback()
				last = Date.now()
			}, time - (now - last))
		}
	}
}
var _11 = function($window) {
	var renderService = coreRenderer($window)
	renderService.setEventCallback(function(e) {
		if (e.redraw === false) e.redraw = undefined
		else redraw()
	})
	var callbacks = []
	function subscribe(key1, callback) {
		unsubscribe(key1)
		callbacks.push(key1, throttle(callback))
	}
	function unsubscribe(key1) {
		var index = callbacks.indexOf(key1)
		if (index > -1) callbacks.splice(index, 2)
	}
	function redraw() {
		for (var i = 1; i < callbacks.length; i += 2) {
			callbacks[i]()
		}
	}
	return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
}
var redrawService = _11(window)
requestService.setCompletionCallback(redrawService.redraw)
var _16 = function(redrawService0) {
	return function(root, component) {
		if (component === null) {
			redrawService0.render(root, [])
			redrawService0.unsubscribe(root)
			return
		}
		
		if (component.view == null && typeof component !== "function") throw new Error("m.mount(element, component) expects a component, not a vnode")
		
		var run0 = function() {
			redrawService0.render(root, Vnode(component))
		}
		redrawService0.subscribe(root, run0)
		redrawService0.redraw()
	}
}
m.mount = _16(redrawService)
var Promise = PromisePolyfill
var parseQueryString = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)
	var entries = string.split("&"), data0 = {}, counters = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key5 = decodeURIComponent(entry[0])
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""
		if (value === "true") value = true
		else if (value === "false") value = false
		var levels = key5.split(/\]\[?|\[/)
		var cursor = data0
		if (key5.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			var isValue = j === levels.length - 1
			if (level === "") {
				var key5 = levels.slice(0, j).join()
				if (counters[key5] == null) counters[key5] = 0
				level = counters[key5]++
			}
			if (cursor[level] == null) {
				cursor[level] = isValue ? value : isNumber ? [] : {}
			}
			cursor = cursor[level]
		}
	}
	return data0
}
var coreRouter = function($window) {
	var supportsPushState = typeof $window.history.pushState === "function"
	var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout
	function normalize1(fragment0) {
		var data = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
		if (fragment0 === "pathname" && data[0] !== "/") data = "/" + data
		return data
	}
	var asyncId
	function debounceAsync(callback0) {
		return function() {
			if (asyncId != null) return
			asyncId = callAsync0(function() {
				asyncId = null
				callback0()
			})
		}
	}
	function parsePath(path, queryData, hashData) {
		var queryIndex = path.indexOf("?")
		var hashIndex = path.indexOf("#")
		var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length
		if (queryIndex > -1) {
			var queryEnd = hashIndex > -1 ? hashIndex : path.length
			var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd))
			for (var key4 in queryParams) queryData[key4] = queryParams[key4]
		}
		if (hashIndex > -1) {
			var hashParams = parseQueryString(path.slice(hashIndex + 1))
			for (var key4 in hashParams) hashData[key4] = hashParams[key4]
		}
		return path.slice(0, pathEnd)
	}
	var router = {prefix: "#!"}
	router.getPath = function() {
		var type2 = router.prefix.charAt(0)
		switch (type2) {
			case "#": return normalize1("hash").slice(router.prefix.length)
			case "?": return normalize1("search").slice(router.prefix.length) + normalize1("hash")
			default: return normalize1("pathname").slice(router.prefix.length) + normalize1("search") + normalize1("hash")
		}
	}
	router.setPath = function(path, data, options) {
		var queryData = {}, hashData = {}
		path = parsePath(path, queryData, hashData)
		if (data != null) {
			for (var key4 in data) queryData[key4] = data[key4]
			path = path.replace(/:([^\/]+)/g, function(match2, token) {
				delete queryData[token]
				return data[token]
			})
		}
		var query = buildQueryString(queryData)
		if (query) path += "?" + query
		var hash = buildQueryString(hashData)
		if (hash) path += "#" + hash
		if (supportsPushState) {
			var state = options ? options.state : null
			var title = options ? options.title : null
			$window.onpopstate()
			if (options && options.replace) $window.history.replaceState(state, title, router.prefix + path)
			else $window.history.pushState(state, title, router.prefix + path)
		}
		else $window.location.href = router.prefix + path
	}
	router.defineRoutes = function(routes, resolve, reject) {
		function resolveRoute() {
			var path = router.getPath()
			var params = {}
			var pathname = parsePath(path, params, params)
			var state = $window.history.state
			if (state != null) {
				for (var k in state) params[k] = state[k]
			}
			for (var route0 in routes) {
				var matcher = new RegExp("^" + route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$")
				if (matcher.test(pathname)) {
					pathname.replace(matcher, function() {
						var keys = route0.match(/:[^\/]+/g) || []
						var values = [].slice.call(arguments, 1, -2)
						for (var i = 0; i < keys.length; i++) {
							params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i])
						}
						resolve(routes[route0], params, path, route0)
					})
					return
				}
			}
			reject(path, params)
		}
		if (supportsPushState) $window.onpopstate = debounceAsync(resolveRoute)
		else if (router.prefix.charAt(0) === "#") $window.onhashchange = resolveRoute
		resolveRoute()
	}
	return router
}
var _20 = function($window, redrawService0) {
	var routeService = coreRouter($window)
	var identity = function(v) {return v}
	var render1, component, attrs3, currentPath, lastUpdate
	var route = function(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		var run1 = function() {
			if (render1 != null) redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3)))
		}
		var bail = function(path) {
			if (path !== defaultRoute) routeService.setPath(defaultRoute, null, {replace: true})
			else throw new Error("Could not resolve default route " + defaultRoute)
		}
		routeService.defineRoutes(routes, function(payload, params, path) {
			var update = lastUpdate = function(routeResolver, comp) {
				if (update !== lastUpdate) return
				component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
				attrs3 = params, currentPath = path, lastUpdate = null
				render1 = (routeResolver.render || identity).bind(routeResolver)
				run1()
			}
			if (payload.view || typeof payload === "function") update({}, payload)
			else {
				if (payload.onmatch) {
					Promise.resolve(payload.onmatch(params, path)).then(function(resolved) {
						update(payload, resolved)
					}, bail)
				}
				else update(payload, "div")
			}
		}, bail)
		redrawService0.subscribe(root, run1)
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		routeService.setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = function(prefix0) {routeService.prefix = prefix0}
	route.link = function(vnode1) {
		vnode1.dom.setAttribute("href", routeService.prefix + vnode1.attrs.href)
		vnode1.dom.onclick = function(e) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return
			e.preventDefault()
			e.redraw = false
			var href = this.getAttribute("href")
			if (href.indexOf(routeService.prefix) === 0) href = href.slice(routeService.prefix.length)
			route.set(href, undefined, undefined)
		}
	}
	route.param = function(key3) {
		if(typeof attrs3 !== "undefined" && typeof key3 !== "undefined") return attrs3[key3]
		return attrs3
	}
	return route
}
m.route = _20(window, redrawService)
m.withAttr = function(attrName, callback1, context) {
	return function(e) {
		callback1.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName))
	}
}
var _28 = coreRenderer(window)
m.render = _28.render
m.redraw = redrawService.redraw
m.request = requestService.request
m.jsonp = requestService.jsonp
m.parseQueryString = parseQueryString
m.buildQueryString = buildQueryString
m.version = "1.1.6"
m.vnode = Vnode
if (typeof module !== "undefined") module["exports"] = m
else window.m = m
}());
},{}],"../../node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"../../node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    link.remove();
  };

  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

module.exports = reloadCSS;
},{"./bundle-url":"../../node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"scss/main.scss":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"../../node_modules/parcel-bundler/src/builtins/css-loader.js"}],"detail.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MemberDetail = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Creates an input field.
var input = function input(storage, key, text, pattern) {
  return (0, _mithril.default)('.row.form-group', [(0, _mithril.default)('label.col-lg-2.col-md-3.col-sm-4.col-form-label', text), (0, _mithril.default)('input[type=text].col-lg-10.col-md-9.col-sm-8.form-control', {
    name: storage[key],
    placeholder: text,
    value: storage[key],
    pattern: pattern ? pattern : undefined,
    oninput: function oninput(e) {
      return storage[key] = e.target.value;
    }
  })]);
}; // Creates a checkbox field.


var checkbox = function checkbox(storage, key, text) {
  return (0, _mithril.default)('.row.form-group', [(0, _mithril.default)('.col-lg-2.col-md-3.col-sm-4', (0, _mithril.default)('label', {
    for: 'field-' + key
  }, text)), (0, _mithril.default)('.form-check.col-lg-10.col-md-9.col-sm-8', [(0, _mithril.default)('input[type=checkbox].form-check-input' + (storage[key] ? '[checked]' : ''), {
    name: storage[key],
    placeholder: text,
    id: 'field-' + key,
    onchange: function onchange(e) {
      return storage[key] = !storage[key];
    }
  })])]);
};

var updateMember = function updateMember(vnode) {
  vnode.state.working = true;

  _mithril.default.request({
    method: 'POST',
    url: '/members/update_json',
    data: vnode.state.member
  }).then(function (_) {
    vnode.state.working = false;
    location.reload();
  }).catch(function (_) {
    vnode.state.error = 'Ein Fehler beim Speichern ist aufgetreten.';
    vnode.state.working = false;
  });
};

var MemberDetail = {
  oninit: function oninit(vnode) {
    vnode.state.member = {};
    vnode.state.events = [];
    vnode.state.family = [];
    vnode.state.working = false;
    vnode.state.error = '';
    var params = window.location.href.split('/');
    var param = params[params.length - 1];
    vnode.state.id = param;

    _mithril.default.request({
      method: 'GET',
      url: "/members/view_json/" + vnode.state.id
    }).then(function (result) {
      vnode.state.member = result.member[0];
      vnode.state.events = result.member[1];
      vnode.state.family = result.member[2];
    });
  },
  view: function view(vnode) {
    var member = vnode.state.member;
    return [(0, _mithril.default)('.row', (0, _mithril.default)('.col', [(0, _mithril.default)('h3', 'Info'), (0, _mithril.default)('form', [input(member, 'first_name', 'Vorname'), input(member, 'middle_name', 'Zweitname(n)'), input(member, 'last_name', 'Nachname(n)'), (0, _mithril.default)('.row.form-group', [(0, _mithril.default)('label.col-lg-2.col-md-3.col-sm-4.col-form-label', 'Geschlecht'), (0, _mithril.default)('select.col-lg-10.col-md-9.col-sm-8.form-control', {
      onchange: function onchange(e) {
        return member.sex = e.target.value;
      },
      value: member.sex
    }, [(0, _mithril.default)('option[value=F]', 'Weiblich'), (0, _mithril.default)('option[value=M]', 'Männlich')])]), input(member, 'birthday', 'Geburtstag', '[0-9]{4}-[0-9]{2}-[0-9]{2}'), input(member, 'email', 'Vorname'), checkbox(member, 'email_allowed', 'Möchte Emails'), input(member, 'email', 'Vorname'), input(member, 'phone_p', 'Telefon (P)'), input(member, 'phone_w', 'Telefon (G)'), input(member, 'mobile', 'Mobiltelefon'), input(member, 'address', 'Strasse'), input(member, 'address_no', 'Hausnummer'), input(member, 'postcode', 'PLZ'), input(member, 'city', 'Wohnort'), (0, _mithril.default)('.row.form-group', [(0, _mithril.default)('label.col-lg-2.col-md-3.col-sm-4.col-form-label', 'Bemerkungen'), (0, _mithril.default)('textarea[name=comment].col-lg-10.col-md-9.col-sm-8.form-control[placeholder="Bemerkungen"]', {
      value: member.comment,
      oninput: function oninput(e) {
        return member.comment = e.target.value;
      }
    })]), input(member, 'passport_no', 'Passnummer'), checkbox(member, 'needs_mark_jujitsu', 'Jahresmarke (Ju Jitsu) benötigt'), checkbox(member, 'needs_mark_judo', 'Jahresmarke (Judo) benötigt'), (0, _mithril.default)('.row.form-group', [(0, _mithril.default)('label.col-lg-2.col-md-3.col-sm-4.col-form-label', 'Mitglieds-Art'), (0, _mithril.default)('select.col-lg-10.col-md-9.col-sm-8.form-control', {
      onchange: function onchange(e) {
        return member.member_type = e.target.value;
      },
      value: member.member_type
    }, [(0, _mithril.default)('option[value=Active]', 'Aktiv'), (0, _mithril.default)('option[value=Passive]', 'Passiv'), (0, _mithril.default)('option[value=Parent]', 'Vormund'), (0, _mithril.default)('option[value=Honorary]', 'Ehrenmitglied'), (0, _mithril.default)('option[value=Student]', 'Student'), (0, _mithril.default)('option[value=Kid]', 'Kind')])])]), (0, _mithril.default)('.row', [(0, _mithril.default)('.col-1', [!vnode.state.working ? (0, _mithril.default)('button[type="submit"].btn.btn-primary', {
      onclick: function onclick(e) {
        e.preventDefault();
        updateMember(vnode);
      }
    }, 'Save') : (0, _mithril.default)('.spinner-border[role=status]', (0, _mithril.default)('span.sr-only'))]), (0, _mithril.default)('.col-11', (0, _mithril.default)('span.text-danger', vnode.state.error))])]))];
  }
};
exports.MemberDetail = MemberDetail;
},{"mithril":"../../node_modules/mithril/mithril.js"}],"add_member.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AddMember = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var filterMembers = function filterMembers(vnode, input) {
  if (input && input != '') {
    var options = {
      keys: ['0.first_name', '0.last_name'],
      threshold: 0.00,
      tokenize: true
    };
    var fuse = new Fuse(vnode.state.members, options);
    vnode.state.filteredMembers = fuse.search(input).filter(function (m) {
      return vnode.attrs.member.id != m[0].id && !m[0].family_id && !vnode.attrs.family.some(function (m2) {
        return m2.id == m[0].id;
      });
    }).slice(0, 10);
  } else {
    vnode.state.filteredMembers = [];
  }
};

var AddMember = {
  oninit: function oninit(vnode) {
    vnode.state.error = '';
    vnode.state.members = vnode.attrs.members;
    filterMembers(vnode, vnode.state.q);
    vnode.state.q = '';
  },
  onbeforeupdate: function onbeforeupdate(vnode) {
    vnode.state.members = vnode.attrs.members;
    filterMembers(vnode, vnode.state.q);
  },
  view: function view(vnode) {
    return [['Active', 'Parent', 'Passiv', 'Honorary'].includes(vnode.attrs.member.member_type) ? [(0, _mithril.default)('h5', 'Neues Familienmitglied zur Familie hinzufügen'), (0, _mithril.default)('.form-group', [(0, _mithril.default)('input[type=text].form-control.col-12[placeholder=Name]', {
      value: vnode.state.q,
      oninput: function oninput(e) {
        vnode.state.q = e.target.value;
        filterMembers(vnode, vnode.state.q);
      }
    }), (0, _mithril.default)('ul.list-group.col-12', vnode.state.filteredMembers ? vnode.state.filteredMembers.map(function (member) {
      return (0, _mithril.default)('li.list-group-item.member-search-item', {
        onclick: function onclick(e) {
          vnode.state.error = '';
          var pmatriarch = vnode.attrs.family.filter(function (m) {
            return m.id == m.family_id;
          })[0];

          _mithril.default.request({
            method: 'POST',
            url: '/members/update_family_json',
            data: {
              member_id: member[0].id,
              family_id: pmatriarch ? pmatriarch.id : vnode.attrs.member.id
            }
          }).catch(function (e) {
            vnode.state.error = 'Ein Fehler beim Hinzufügen ist aufgetreten.';
          });

          if (!pmatriarch) {
            setTimeout(function () {
              return _mithril.default.request({
                method: 'POST',
                url: '/members/update_family_json',
                data: {
                  member_id: vnode.attrs.member.id,
                  family_id: vnode.attrs.member.id
                }
              }).then(function () {
                return location.reload();
              }).catch(function (e) {
                vnode.state.error = 'Ein Fehler beim Hinzufügen ist aufgetreten.';
              });
            }, 500);
          } else {
            location.reload();
          }
        }
      }, member[0].first_name + ' ' + member[0].last_name);
    }) : []), (0, _mithril.default)('.col-12', (0, _mithril.default)('span.text-danger', vnode.state.error))])] : ''];
  }
};
exports.AddMember = AddMember;
},{"mithril":"../../node_modules/mithril/mithril.js"}],"helpers.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getToday = exports.isPrincipal = void 0;

var isPrincipal = function isPrincipal(member) {
  return member.id == member.family_id;
}; /// Returns todays date.


exports.isPrincipal = isPrincipal;

var getToday = function getToday() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  return today;
};

exports.getToday = getToday;
},{}],"family.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Family = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _add_member = require("./add_member");

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/// A component to display the entire family of a member.
///
/// Attrs: { member: Member, family: [Member] }
var Family = {
  oninit: function oninit(vnode) {
    vnode.state.member = vnode.attrs.member;
    vnode.state.family = vnode.attrs.family; // Needed so the onclick event on the 'Unlink' button does not also trigger a forward to the unlinked member page.

    vnode.state.loading = false;
    vnode.state.members = [];

    _mithril.default.request({
      method: 'GET',
      url: "/members/list_json"
    }).then(function (result) {
      return vnode.state.members = result;
    });
  },
  onbeforeupdate: function onbeforeupdate(vnode) {
    vnode.state.member = vnode.attrs.member;
    vnode.state.family = vnode.attrs.family;
  },
  view: function view(vnode) {
    var family = vnode.state.family;
    var member = vnode.state.member;
    return (0, _mithril.default)('.row', (0, _mithril.default)('.col', [(0, _mithril.default)('h3', 'Familie'), family && family.length > 0 ? (0, _mithril.default)('table.table.table-hover.col-12', [(0, _mithril.default)('thead', (0, _mithril.default)('tr', [(0, _mithril.default)('th', 'Vorname'), (0, _mithril.default)('th', 'Nachname'), (0, _mithril.default)('th', 'Email')])), (0, _mithril.default)('tbody', family.map(function (f) {
      return (0, _mithril.default)('tr.family-row', {
        onclick: function onclick() {
          if (!vnode.state.loading) {
            window.location = '/members/view/' + f.id;
          }
        }
      }, [(0, _mithril.default)('td', (0, _helpers.isPrincipal)(f) ? (0, _mithril.default)('span.badge.badge-warning', f.first_name) : f.first_name), (0, _mithril.default)('td', f.last_name), (0, _mithril.default)('td', f.email), (0, _mithril.default)('td', (0, _mithril.default)('button.btn.btn-danger[type=text]', {
        onclick: function onclick() {
          vnode.state.loading = true;

          _mithril.default.request({
            method: 'POST',
            url: '/members/update_family_json',
            data: {
              member_id: f.id,
              family_id: undefined
            }
          }).then(function () {
            return location.reload();
          }).catch(function () {
            return vnode.state.loading = false;
          });
        }
      }, (0, _mithril.default)('i.fas.fa-unlink')))]);
    }))]) : 'Keine bekannten Familienmitglieder', (0, _mithril.default)(_add_member.AddMember, {
      member: vnode.state.member,
      family: family,
      members: vnode.state.members
    })]));
  }
};
exports.Family = Family;
},{"mithril":"../../node_modules/mithril/mithril.js","./add_member":"add_member.js","./helpers":"helpers.js"}],"events.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MemberEvents = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/// Returns a proper description string for a given event.
var eventString = function eventString(event) {
  switch (event.event_type) {
    case 'Trainer':
      {
        switch (event.class) {
          case 'Promotion':
            return 'Beförderung zum Trainer (' + event.division + ')';

          case 'Demotion':
            return 'Rücktritt vom Traineramt (' + event.division + ')';
        }
      }

    case 'CoTrainer':
      {
        switch (event.class) {
          case 'Promotion':
            return 'Beförderung zum Co-Trainer(' + event.division + ')';

          case 'Demotion':
            return 'Rücktritt vom Co-Traineramt (' + event.division + ')';
        }
      }

    case 'Club':
      {
        switch (event.class) {
          case 'Promotion':
            return 'Clubeintritt';

          case 'Demotion':
            return 'Clubaustritt';
        }
      }

    case 'Board':
      {
        switch (event.class) {
          case 'Promotion':
            return 'Wahl zum Vorstand';

          case 'Demotion':
            return 'Rücktritt aus dem Vorstand';
        }
      }

    case 'Honorary':
      {}

    case 'Kyu1':
      return 'Erhalt 1. Kyu ' + event.division;

    case 'Kyu2':
      return 'Erhalt 2. Kyu ' + event.division;

    case 'Kyu3':
      return 'Erhalt 3. Kyu ' + event.division;

    case 'Kyu4':
      return 'Erhalt 4. Kyu ' + event.division;

    case 'Kyu5':
      return 'Erhalt 5. Kyu ' + event.division;

    case 'Dan1':
      return 'Erhalt 1. Dan ' + event.division;

    case 'Dan2':
      return 'Erhalt 2. Dan ' + event.division;

    case 'Dan3':
      return 'Erhalt 3. Dan ' + event.division;

    case 'Dan4':
      return 'Erhalt 4. Dan ' + event.division;

    case 'Dan5':
      return 'Erhalt 5. Dan ' + event.division;

    case 'Dan6':
      return 'Erhalt 6. Dan ' + event.division;

    case 'Dan7':
      return 'Erhalt 7. Dan ' + event.division;

    case 'Dan8':
      return 'Erhalt 8. Dan ' + event.division;

    case 'Dan9':
      return 'Erhalt 9. Dan ' + event.division;

    case 'Dan10':
      return 'Erhalt 10. Dan ' + event.division;

    default:
      return 'Unbekanntes Ereignis';
  }
}; /// Returns the event name string for a given event type.


var eventTypeString = function eventTypeString(event) {
  switch (event) {
    case 'Trainer':
      return 'Trainer';

    case 'CoTrainer':
      return 'Co-Trainer';

    case 'Board':
      return 'Vorstand';

    case 'Honorary':
      return 'Ehrenmitglied';

    case 'Kyu':
      return 'Gurtprüfung';
  }
}; /// All possible event types.


var event_types = ['Trainer', 'CoTrainer', 'Board', 'Honorary', 'Kyu'];
var TrainerEventAdd = {
  oninit: function oninit(vnode) {
    vnode.attrs.transmitter.add = function () {
      return _mithril.default.request({
        method: 'POST',
        url: "/events/create_json",
        data: {
          member_id: vnode.state.member.id,
          event_type: vnode.state.type,
          class: vnode.state.class,
          division: vnode.state.division,
          comment: vnode.state.comment,
          date: (0, _helpers.getToday)()
        }
      });
    };

    vnode.state.class = 'Promotion';
    vnode.state.division = 'Jujitsu';
    vnode.state.comment = '';
    vnode.state.member = vnode.attrs.member;
  },
  onbeforeupdate: function onbeforeupdate(vnode) {
    vnode.state.member = vnode.attrs.member;
    vnode.state.type = vnode.attrs.type;
  },
  view: function view(vnode) {
    return [(0, _mithril.default)('select.form-control', {
      onchange: function onchange(e) {
        return vnode.state.class = e.target.value;
      },
      value: vnode.state.class
    }, [(0, _mithril.default)('option[value=Promotion]', 'Beförderung'), (0, _mithril.default)('option[value=Demotion]', 'Rücktritt')]), ' zum Trainer ', (0, _mithril.default)('select.form-control', {
      onchange: function onchange(e) {
        return vnode.state.division = e.target.value;
      },
      value: vnode.state.division
    }, [(0, _mithril.default)('option[value=Jujitsu]', 'Ju Jitsu'), (0, _mithril.default)('option[value=Judo]', 'Judo')]), (0, _mithril.default)('input.form-control[type=text][placeholder=Kommentar]', {
      onchange: function onchange(e) {
        return vnode.state.comment = e.target.value;
      },
      value: vnode.state.comment
    })];
  }
};
var BoardEventAdd = {
  oninit: function oninit(vnode) {
    vnode.attrs.transmitter.add = function () {
      return _mithril.default.request({
        method: 'POST',
        url: "/events/create_json",
        data: {
          member_id: vnode.state.member.id,
          event_type: 'Board',
          class: vnode.state.class,
          division: 'Club',
          comment: vnode.state.comment,
          date: vnode.state.date
        }
      });
    };

    vnode.state.date = (0, _helpers.getToday)();
    vnode.state.class = 'Promotion';
    vnode.state.comment = '';
    vnode.state.member = vnode.attrs.member;
  },
  onbeforeupdate: function onbeforeupdate(vnode) {
    vnode.state.member = vnode.attrs.member;
  },
  view: function view(vnode) {
    return [(0, _mithril.default)('select.form-control', {
      onchange: function onchange(e) {
        return vnode.state.class = e.target.value;
      },
      value: vnode.state.class
    }, [(0, _mithril.default)('option[value=Promotion]', 'Wahl'), (0, _mithril.default)('option[value=Demotion]', 'Rücktritt')]), ' als ', (0, _mithril.default)('input.form-control[type=text][placeholder=Funktion]', {
      onchange: function onchange(e) {
        return vnode.state.comment = e.target.value;
      },
      value: vnode.state.comment
    }), ' am ', (0, _mithril.default)('input.form-control[type=text][placeholder=Datum(YYYY-MM-DD)][pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"].', {
      onchange: function onchange(e) {
        return vnode.state.date = e.target.value;
      },
      value: vnode.state.date
    })];
  }
};
var HonoraryEventAdd = {
  oninit: function oninit(vnode) {
    vnode.attrs.transmitter.add = function () {
      return _mithril.default.request({
        method: 'POST',
        url: "/events/create_json",
        data: {
          member_id: vnode.state.member.id,
          event_type: 'Honorary',
          class: 'Promotion',
          division: 'Club',
          comment: vnode.state.comment,
          date: (0, _helpers.getToday)()
        }
      });
    };

    vnode.state.comment = '';
    vnode.state.member = vnode.attrs.member;
  },
  onbeforeupdate: function onbeforeupdate(vnode) {
    vnode.state.member = vnode.attrs.member;
  },
  view: function view(vnode) {
    return [(0, _mithril.default)('input.form-control[type=text][placeholder=Grund]', {
      onchange: function onchange(e) {
        return vnode.state.comment = e.target.value;
      },
      value: vnode.state.comment
    })];
  }
};
var KyuEventAdd = {
  oninit: function oninit(vnode) {
    vnode.attrs.transmitter.add = function () {
      return _mithril.default.request({
        method: 'POST',
        url: "/events/create_json",
        data: {
          member_id: vnode.state.member.id,
          event_type: vnode.state.grade,
          class: 'Promotion',
          division: vnode.state.division,
          date: vnode.state.date
        }
      });
    };

    vnode.state.date = (0, _helpers.getToday)();
    vnode.state.division = 'Jujitsu';
    vnode.state.grade = 'Kyu5';
    vnode.state.member = vnode.attrs.member;
  },
  onbeforeupdate: function onbeforeupdate(vnode) {
    vnode.state.member = vnode.attrs.member;
  },
  view: function view(vnode) {
    return [' zum ', (0, _mithril.default)('select.form-control', {
      onchange: function onchange(e) {
        return vnode.state.grade = e.target.value;
      },
      value: vnode.state.grade
    }, [(0, _mithril.default)('option[value=Kyu1]', '1. Kyu'), (0, _mithril.default)('option[value=Kyu2]', '2. Kyu'), (0, _mithril.default)('option[value=Kyu3]', '3. Kyu'), (0, _mithril.default)('option[value=Kyu4]', '4. Kyu'), (0, _mithril.default)('option[value=Kyu5]', '5. Kyu'), (0, _mithril.default)('option[value=Dan1]', '1. Dan'), (0, _mithril.default)('option[value=Dan2]', '2. Dan'), (0, _mithril.default)('option[value=Dan3]', '3. Dan'), (0, _mithril.default)('option[value=Dan4]', '4. Dan'), (0, _mithril.default)('option[value=Dan5]', '5. Dan'), (0, _mithril.default)('option[value=Dan6]', '6. Dan'), (0, _mithril.default)('option[value=Dan7]', '7. Dan'), (0, _mithril.default)('option[value=Dan8]', '8. Dan'), (0, _mithril.default)('option[value=Dan9]', '9. Dan'), (0, _mithril.default)('option[value=Dan10]', '10. Dan')]), ' im ', (0, _mithril.default)('select.form-control', {
      onchange: function onchange(e) {
        return vnode.state.division = e.target.value;
      },
      value: vnode.state.division
    }, [(0, _mithril.default)('option[value=Jujitsu]', 'Ju Jitsu'), (0, _mithril.default)('option[value=Judo]', 'Judo')]), ' am ', (0, _mithril.default)('input.form-control[type=text][placeholder=Datum(YYYY-MM-DD)][pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"].', {
      onchange: function onchange(e) {
        return vnode.state.date = e.target.value;
      },
      value: vnode.state.date
    })];
  }
};
var MemberEvents = {
  oninit: function oninit(vnode) {
    vnode.state.events = vnode.attrs.events;
    vnode.state.member = vnode.attrs.member;
    vnode.state.type = 'Trainer';
    vnode.state.transmitter = {};
  },
  onbeforeupdate: function onbeforeupdate(vnode) {
    vnode.state.events = vnode.attrs.events;
    vnode.state.member = vnode.attrs.member;
  },
  view: function view(vnode) {
    var member = vnode.state.member;
    var events = vnode.state.events;
    return [(0, _mithril.default)('.row', (0, _mithril.default)('.col', [(0, _mithril.default)('h3', 'Verlauf'), (0, _mithril.default)('table.table.table-hover', [(0, _mithril.default)('thead', (0, _mithril.default)('tr', [(0, _mithril.default)('th', 'Was'), (0, _mithril.default)('th', 'Datum'), (0, _mithril.default)('th', 'Kommentar')])), (0, _mithril.default)('tbody', [events.slice(0).reverse().map(function (event) {
      return [(0, _mithril.default)('tr', {
        class: event.class == 'Promotion' ? 'bg-success' : 'bg-danger'
      }, [(0, _mithril.default)('td', eventString(event)), (0, _mithril.default)('td', event.date), (0, _mithril.default)('td', event.comment)])];
    })])])])), (0, _mithril.default)('h5', 'Neues Ereignis eintragen'), (0, _mithril.default)('form.form-inline', [(0, _mithril.default)('select.form-control', {
      onchange: function onchange(e) {
        return vnode.state.type = e.target.value;
      },
      value: vnode.state.type
    }, event_types.map(function (event_type) {
      return (0, _mithril.default)('option', {
        value: event_type
      }, eventTypeString(event_type));
    })), ' : ', function () {
      switch (vnode.state.type) {
        case 'Trainer':
          return (0, _mithril.default)(TrainerEventAdd, {
            transmitter: vnode.state.transmitter,
            member: member,
            type: 'Trainer'
          });

        case 'CoTrainer':
          return (0, _mithril.default)(TrainerEventAdd, {
            transmitter: vnode.state.transmitter,
            member: member,
            type: 'CoTrainer'
          });

        case 'Board':
          return (0, _mithril.default)(BoardEventAdd, {
            transmitter: vnode.state.transmitter,
            member: member
          });

        case 'Honorary':
          return (0, _mithril.default)(HonoraryEventAdd, {
            transmitter: vnode.state.transmitter,
            member: member
          });

        case 'Kyu':
          return (0, _mithril.default)(KyuEventAdd, {
            transmitter: vnode.state.transmitter,
            member: member
          });
      }
    }(), (0, _mithril.default)('button.form-control.btn-success', {
      onclick: function onclick(e) {
        vnode.state.error = '';
        e.preventDefault();
        vnode.state.transmitter.add().then(function () {
          return location.reload();
        }).catch(function () {
          return vnode.state.error = 'Fehler beim Hinzufügen.';
        });
      }
    }, 'Hinzufügen')]), (0, _mithril.default)('span.text-danger', vnode.state.error)];
  }
};
exports.MemberEvents = MemberEvents;
},{"mithril":"../../node_modules/mithril/mithril.js","./helpers":"helpers.js"}],"badges.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Badges = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function belt_color(number) {
  switch (number) {
    case '5':
      return 'yellow';

    case '4':
      return 'orange';

    case '3':
      return 'green';

    case '2':
      return 'blue';

    case '1':
      return 'brown';

    default:
      return 'black';
  }
}

function member_type(member) {
  switch (member) {
    case 'Active':
      return 'Aktiv';

    case 'Passive':
      return 'Passiv';

    case 'Parent':
      return 'Vormund';

    case 'Honorary':
      return 'Ehrenmitglied';

    case 'Student':
      return 'Student';

    case 'Kid':
      return 'Kind';
  }
}

var Badges = {
  oninit: function oninit(vnode) {
    vnode.state.events = vnode.attrs.events;
    vnode.state.member = vnode.attrs.member;
  },
  onbeforeupdate: function onbeforeupdate(vnode) {
    vnode.state.events = vnode.attrs.events;
    vnode.state.member = vnode.attrs.member;
  },
  view: function view(vnode) {
    var member = vnode.state.member;
    var events = vnode.state.events;
    var badges = [];
    var honorary_badge = false;
    var current_grade = [];
    current_grade['Judo'] = false;
    current_grade['Jujitsu'] = false;
    var club_events = [];
    var board_events = [];
    var trainer_events = [];
    var cotrainer_events = [];
    events.forEach(function (event) {
      // Find club events.
      if (event.event_type == 'Club' && event.division == 'Club') {
        club_events.push(event);
      } // Find all kyus.


      if ((event.event_type.includes('Kyu') || event.event_type.includes('Dan')) && event.class == 'Promotion') {
        var grade_num = event.event_type.substring(event.event_type.length - 1);
        var grade = grade_num + '. ' + event.event_type.substring(0, event.event_type.length - 1);
        current_grade[event.division] = {
          color: belt_color(event.event_type.includes('Dan') ? 0 : grade_num),
          grade: grade,
          date: event.date
        };
      } // Check if honorary member.


      if (event.event_type == 'Honorary' && event.division == 'Club' && event.class == 'Promotion') {
        honorary_badge = true;
      } // Get board member events.


      if (event.event_type == 'Board') {
        board_events.push(event);
      } // Get trainer events.


      if (event.event_type == 'Trainer') {
        trainer_events.push(event);
      } // Get co trainer events.


      if (event.event_type == 'CoTrainer') {
        cotrainer_events.push(event);
      }
    }); // Check member status (resigned, active, kid, student, etc.)

    club_events.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    if (club_events.length > 0) {
      var last = club_events[0];

      if (last.class == 'Demotion') {
        badges.push({
          type: 'danger',
          text: 'Ausgetreten am ' + last.date,
          class: 'Demotion'
        });
      } else {
        badges.push({
          type: 'success',
          text: member_type(member.member_type)
        });
      }
    } // Get latest board promotional event.


    board_events.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    if (board_events.length > 0 && board_events[0].class == 'Promotion') {
      badges.push({
        type: 'warning',
        text: 'Vorstand'
      });
    } // Get latest trainer promotional event.


    trainer_events.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    if (trainer_events.length > 0 && trainer_events[0].class == 'Promotion') {
      badges.push({
        type: 'primary',
        text: 'Trainer'
      });
    } // Get latest cotrainer promotional event.


    cotrainer_events.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    if (cotrainer_events.length > 0 && cotrainer_events[0].class == 'Promotion') {
      badges.push({
        type: 'info',
        text: 'Co-Trainer'
      });
    } // Get current judo belt.


    if (current_grade['Judo']) {
      badges.push({
        type: 'belt-' + current_grade['Judo'].color,
        text: current_grade['Judo'].grade + ' Judo'
      });
    } // Get current jujitsu belt.


    if (current_grade['Jujitsu']) {
      badges.push({
        type: 'belt-' + current_grade['Jujitsu'].color,
        text: current_grade['Jujitsu'].grade + ' Jujitsu'
      });
    } // Get honorary member status.


    if (honorary_badge) {
      badges.push({
        type: 'light',
        text: 'Ehrenmitglied'
      });
    } // PMatriarch


    if (member.id == member.family_id) {
      badges.push({
        type: 'warning',
        text: 'Familienoberhaupt'
      });
    }

    return (0, _mithril.default)('.row', (0, _mithril.default)('.col', [(0, _mithril.default)('h3', 'Status'), (0, _mithril.default)('h3', (0, _mithril.default)('', badges.map(function (badge) {
      return (0, _mithril.default)('span.badge.badge-pill.badge-' + badge.type, badge.text);
    })))]));
  }
};
exports.Badges = Badges;
},{"mithril":"../../node_modules/mithril/mithril.js"}],"view.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MemberView = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

require("./scss/main.scss");

var _detail = require("/detail");

var _family = require("/family");

var _events = require("/events");

var _badges = require("/badges");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MemberView = {
  oninit: function oninit(vnode) {
    vnode.state.member = {};
    vnode.state.events = [];
    vnode.state.family = [];
    var params = window.location.href.split('/');
    var param = params[params.length - 1];
    vnode.state.id = param;

    _mithril.default.request({
      method: 'GET',
      url: "/members/view_json/" + vnode.state.id
    }).then(function (result) {
      vnode.state.member = result.member[0];
      vnode.state.events = result.member[1];
      vnode.state.family = result.member[2];
    });
  },
  view: function view(vnode) {
    var member = vnode.state.member;
    var events = vnode.state.events;
    var family = vnode.state.family;
    return [(0, _mithril.default)('a[href=/members/list]', '< Zurück zur Liste'), (0, _mithril.default)(_detail.MemberDetail, {
      member: member
    }), (0, _mithril.default)(_badges.Badges, {
      events: events,
      member: member
    }), (0, _mithril.default)(_family.Family, {
      member: member,
      family: family
    }), (0, _mithril.default)(_events.MemberEvents, {
      events: events,
      member: member
    })];
  }
};
exports.MemberView = MemberView;

window.onload = function () {
  _mithril.default.mount(document.getElementById('mount'), MemberView);
};
},{"mithril":"../../node_modules/mithril/mithril.js","./scss/main.scss":"scss/main.scss","/detail":"detail.js","/family":"family.js","/events":"events.js","/badges":"badges.js"}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "37181" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","view.js"], null)
//# sourceMappingURL=/static/js/view.js.map