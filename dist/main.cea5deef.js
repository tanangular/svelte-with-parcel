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
})({"../node_modules/svelte/internal.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function noop() {}

const identity = x => x;

function assign(tar, src) {
	for (const k in src) tar[k] = src[k];
	return tar;
}

function is_promise(value) {
	return value && typeof value.then === 'function';
}

function add_location(element, file, line, column, char) {
	element.__svelte_meta = {
		loc: { file, line, column, char }
	};
}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

function run_all(fns) {
	fns.forEach(run);
}

function is_function(thing) {
	return typeof thing === 'function';
}

function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function not_equal(a, b) {
	return a != a ? b == b : a !== b;
}

function validate_store(store, name) {
	if (!store || typeof store.subscribe !== 'function') {
		throw new Error(`'${name}' is not a store with a 'subscribe' method`);
	}
}

function subscribe(component, store, callback) {
	const unsub = store.subscribe(callback);

	component.$$.on_destroy.push(unsub.unsubscribe
		? () => unsub.unsubscribe()
		: unsub);
}

function create_slot(definition, ctx, fn) {
	if (definition) {
		const slot_ctx = get_slot_context(definition, ctx, fn);
		return definition[0](slot_ctx);
	}
}

function get_slot_context(definition, ctx, fn) {
	return definition[1]
		? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
		: ctx.$$scope.ctx;
}

function get_slot_changes(definition, ctx, changed, fn) {
	return definition[1]
		? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
		: ctx.$$scope.changed || {};
}

function exclude_internal_props(props) {
	const result = {};
	for (const k in props) if (k[0] !== '$') result[k] = props[k];
	return result;
}

exports.now = typeof window !== 'undefined'
	? () => window.performance.now()
	: () => Date.now();

// used internally for testing
function set_now(fn) {
	exports.now = fn;
}

const tasks = new Set();
let running = false;

function run_tasks() {
	tasks.forEach(task => {
		if (!task[0](exports.now())) {
			tasks.delete(task);
			task[1]();
		}
	});

	running = tasks.size > 0;
	if (running) requestAnimationFrame(run_tasks);
}

function clear_loops() {
	// for testing...
	tasks.forEach(task => tasks.delete(task));
	running = false;
}

function loop(fn) {
	let task;

	if (!running) {
		running = true;
		requestAnimationFrame(run_tasks);
	}

	return {
		promise: new Promise(fulfil => {
			tasks.add(task = [fn, fulfil]);
		}),
		abort() {
			tasks.delete(task);
		}
	};
}

function append(target, node) {
	target.appendChild(node);
}

function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

function detach(node) {
	node.parentNode.removeChild(node);
}

function detach_between(before, after) {
	while (before.nextSibling && before.nextSibling !== after) {
		before.parentNode.removeChild(before.nextSibling);
	}
}

function detach_before(after) {
	while (after.previousSibling) {
		after.parentNode.removeChild(after.previousSibling);
	}
}

function detach_after(before) {
	while (before.nextSibling) {
		before.parentNode.removeChild(before.nextSibling);
	}
}

function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

function element(name) {
	return document.createElement(name);
}

function object_without_properties(obj, exclude) {
	const target = {};
	for (const k in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) {
			target[k] = obj[k];
		}
	}
	return target;
}

function svg_element(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function text(data) {
	return document.createTextNode(data);
}

function space() {
	return text(' ');
}

function empty() {
	return text('');
}

function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

function prevent_default(fn) {
	return function(event) {
		event.preventDefault();
		return fn.call(this, event);
	};
}

function stop_propagation(fn) {
	return function(event) {
		event.stopPropagation();
		return fn.call(this, event);
	};
}

function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else node.setAttribute(attribute, value);
}

function set_attributes(node, attributes) {
	for (const key in attributes) {
		if (key === 'style') {
			node.style.cssText = attributes[key];
		} else if (key in node) {
			node[key] = attributes[key];
		} else {
			attr(node, key, attributes[key]);
		}
	}
}

function set_custom_element_data(node, prop, value) {
	if (prop in node) {
		node[prop] = value;
	} else {
		attr(node, prop, value);
	}
}

function xlink_attr(node, attribute, value) {
	node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
}

function get_binding_group_value(group) {
	const value = [];
	for (let i = 0; i < group.length; i += 1) {
		if (group[i].checked) value.push(group[i].__value);
	}
	return value;
}

function to_number(value) {
	return value === '' ? undefined : +value;
}

function time_ranges_to_array(ranges) {
	const array = [];
	for (let i = 0; i < ranges.length; i += 1) {
		array.push({ start: ranges.start(i), end: ranges.end(i) });
	}
	return array;
}

function children(element) {
	return Array.from(element.childNodes);
}

function claim_element(nodes, name, attributes, svg) {
	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (node.nodeName === name) {
			for (let j = 0; j < node.attributes.length; j += 1) {
				const attribute = node.attributes[j];
				if (!attributes[attribute.name]) node.removeAttribute(attribute.name);
			}
			return nodes.splice(i, 1)[0]; // TODO strip unwanted attributes
		}
	}

	return svg ? svg_element(name) : element(name);
}

function claim_text(nodes, data) {
	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (node.nodeType === 3) {
			node.data = data;
			return nodes.splice(i, 1)[0];
		}
	}

	return text(data);
}

function set_data(text, data) {
	data = '' + data;
	if (text.data !== data) text.data = data;
}

function set_input_type(input, type) {
	try {
		input.type = type;
	} catch (e) {
		// do nothing
	}
}

function set_style(node, key, value) {
	node.style.setProperty(key, value);
}

function select_option(select, value) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];

		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}
}

function select_options(select, value) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];
		option.selected = ~value.indexOf(option.__value);
	}
}

function select_value(select) {
	const selected_option = select.querySelector(':checked') || select.options[0];
	return selected_option && selected_option.__value;
}

function select_multiple_value(select) {
	return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
}

function add_resize_listener(element, fn) {
	if (getComputedStyle(element).position === 'static') {
		element.style.position = 'relative';
	}

	const object = document.createElement('object');
	object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
	object.type = 'text/html';

	let win;

	object.onload = () => {
		win = object.contentDocument.defaultView;
		win.addEventListener('resize', fn);
	};

	if (/Trident/.test(navigator.userAgent)) {
		element.appendChild(object);
		object.data = 'about:blank';
	} else {
		object.data = 'about:blank';
		element.appendChild(object);
	}

	return {
		cancel: () => {
			win && win.removeEventListener && win.removeEventListener('resize', fn);
			element.removeChild(object);
		}
	};
}

function toggle_class(element, name, toggle) {
	element.classList[toggle ? 'add' : 'remove'](name);
}

function custom_event(type, detail) {
	const e = document.createEvent('CustomEvent');
	e.initCustomEvent(type, false, false, detail);
	return e;
}

let stylesheet;
let active = 0;
let current_rules = {};

// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return hash >>> 0;
}

function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
	const step = 16.666 / duration;
	let keyframes = '{\n';

	for (let p = 0; p <= 1; p += step) {
		const t = a + (b - a) * ease(p);
		keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
	}

	const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
	const name = `__svelte_${hash(rule)}_${uid}`;

	if (!current_rules[name]) {
		if (!stylesheet) {
			const style = element('style');
			document.head.appendChild(style);
			stylesheet = style.sheet;
		}

		current_rules[name] = true;
		stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
	}

	const animation = node.style.animation || '';
	node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;

	active += 1;
	return name;
}

function delete_rule(node, name) {
	node.style.animation = (node.style.animation || '')
		.split(', ')
		.filter(name
			? anim => anim.indexOf(name) < 0 // remove specific animation
			: anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
		)
		.join(', ');

	if (name && !--active) clear_rules();
}

function clear_rules() {
	requestAnimationFrame(() => {
		if (active) return;
		let i = stylesheet.cssRules.length;
		while (i--) stylesheet.deleteRule(i);
		current_rules = {};
	});
}

function create_animation(node, from, fn, params) {
	if (!from) return noop;

	const to = node.getBoundingClientRect();
	if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom) return noop;

	const {
		delay = 0,
		duration = 300,
		easing = identity,
		start: start_time = exports.now() + delay,
		end = start_time + duration,
		tick = noop,
		css
	} = fn(node, { from, to }, params);

	let running = true;
	let started = false;
	let name;

	const css_text = node.style.cssText;

	function start() {
		if (css) {
			if (delay) node.style.cssText = css_text; // TODO create delayed animation instead?
			name = create_rule(node, 0, 1, duration, 0, easing, css);
		}

		started = true;
	}

	function stop() {
		if (css) delete_rule(node, name);
		running = false;
	}

	loop(now => {
		if (!started && now >= start_time) {
			start();
		}

		if (started && now >= end) {
			tick(1, 0);
			stop();
		}

		if (!running) {
			return false;
		}

		if (started) {
			const p = now - start_time;
			const t = 0 + 1 * easing(p / duration);
			tick(t, 1 - t);
		}

		return true;
	});

	if (delay) {
		if (css) node.style.cssText += css(0, 1);
	} else {
		start();
	}

	tick(0, 1);

	return stop;
}

function fix_position(node) {
	const style = getComputedStyle(node);

	if (style.position !== 'absolute' && style.position !== 'fixed') {
		const { width, height } = style;
		const a = node.getBoundingClientRect();
		node.style.position = 'absolute';
		node.style.width = width;
		node.style.height = height;
		const b = node.getBoundingClientRect();

		if (a.left !== b.left || a.top !== b.top) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
		}
	}
}

function set_current_component(component) {
	exports.current_component = component;
}

function get_current_component() {
	if (!exports.current_component) throw new Error(`Function called outside component initialization`);
	return exports.current_component;
}

function beforeUpdate(fn) {
	get_current_component().$$.before_render.push(fn);
}

function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

function afterUpdate(fn) {
	get_current_component().$$.after_render.push(fn);
}

function onDestroy(fn) {
	get_current_component().$$.on_destroy.push(fn);
}

function createEventDispatcher() {
	const component = exports.current_component;

	return (type, detail) => {
		const callbacks = component.$$.callbacks[type];

		if (callbacks) {
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = custom_event(type, detail);
			callbacks.slice().forEach(fn => {
				fn.call(component, event);
			});
		}
	};
}

function setContext(key, context) {
	get_current_component().$$.context.set(key, context);
}

function getContext(key) {
	return get_current_component().$$.context.get(key);
}

// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
	const callbacks = component.$$.callbacks[event.type];

	if (callbacks) {
		callbacks.slice().forEach(fn => fn(event));
	}
}

const dirty_components = [];
const intros = { enabled: false };

const resolved_promise = Promise.resolve();
let update_scheduled = false;
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];

function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

function tick() {
	schedule_update();
	return resolved_promise;
}

function add_binding_callback(fn) {
	binding_callbacks.push(fn);
}

function add_render_callback(fn) {
	render_callbacks.push(fn);
}

function add_flush_callback(fn) {
	flush_callbacks.push(fn);
}

function flush() {
	const seen_callbacks = new Set();

	do {
		// first, call beforeUpdate functions
		// and update components
		while (dirty_components.length) {
			const component = dirty_components.shift();
			set_current_component(component);
			update(component.$$);
		}

		while (binding_callbacks.length) binding_callbacks.shift()();

		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		while (render_callbacks.length) {
			const callback = render_callbacks.pop();
			if (!seen_callbacks.has(callback)) {
				callback();

				// ...so guard against infinite loops
				seen_callbacks.add(callback);
			}
		}
	} while (dirty_components.length);

	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}

	update_scheduled = false;
}

function update($$) {
	if ($$.fragment) {
		$$.update($$.dirty);
		run_all($$.before_render);
		$$.fragment.p($$.dirty, $$.ctx);
		$$.dirty = null;

		$$.after_render.forEach(add_render_callback);
	}
}

let promise;

function wait() {
	if (!promise) {
		promise = Promise.resolve();
		promise.then(() => {
			promise = null;
		});
	}

	return promise;
}

function dispatch(node, direction, kind) {
	node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}

let outros;

function group_outros() {
	outros = {
		remaining: 0,
		callbacks: []
	};
}

function check_outros() {
	if (!outros.remaining) {
		run_all(outros.callbacks);
	}
}

function on_outro(callback) {
	outros.callbacks.push(callback);
}

function create_in_transition(node, fn, params) {
	let config = fn(node, params);
	let running = false;
	let animation_name;
	let task;
	let uid = 0;

	function cleanup() {
		if (animation_name) delete_rule(node, animation_name);
	}

	function go() {
		const {
			delay = 0,
			duration = 300,
			easing = identity,
			tick: tick$$1 = noop,
			css
		} = config;

		if (css) animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
		tick$$1(0, 1);

		const start_time = exports.now() + delay;
		const end_time = start_time + duration;

		if (task) task.abort();
		running = true;

		task = loop(now => {
			if (running) {
				if (now >= end_time) {
					tick$$1(1, 0);
					cleanup();
					return running = false;
				}

				if (now >= start_time) {
					const t = easing((now - start_time) / duration);
					tick$$1(t, 1 - t);
				}
			}

			return running;
		});
	}

	let started = false;

	return {
		start() {
			if (started) return;

			delete_rule(node);

			if (typeof config === 'function') {
				config = config();
				wait().then(go);
			} else {
				go();
			}
		},

		invalidate() {
			started = false;
		},

		end() {
			if (running) {
				cleanup();
				running = false;
			}
		}
	};
}

function create_out_transition(node, fn, params) {
	let config = fn(node, params);
	let running = true;
	let animation_name;

	const group = outros;

	group.remaining += 1;

	function go() {
		const {
			delay = 0,
			duration = 300,
			easing = identity,
			tick: tick$$1 = noop,
			css
		} = config;

		if (css) animation_name = create_rule(node, 1, 0, duration, delay, easing, css);

		const start_time = exports.now() + delay;
		const end_time = start_time + duration;

		loop(now => {
			if (running) {
				if (now >= end_time) {
					tick$$1(0, 1);

					if (!--group.remaining) {
						// this will result in `end()` being called,
						// so we don't need to clean up here
						run_all(group.callbacks);
					}

					return false;
				}

				if (now >= start_time) {
					const t = easing((now - start_time) / duration);
					tick$$1(1 - t, t);
				}
			}

			return running;
		});
	}

	if (typeof config === 'function') {
		wait().then(() => {
			config = config();
			go();
		});
	} else {
		go();
	}

	return {
		end(reset) {
			if (reset && config.tick) {
				config.tick(1, 0);
			}

			if (running) {
				if (animation_name) delete_rule(node, animation_name);
				running = false;
			}
		}
	};
}

function create_bidirectional_transition(node, fn, params, intro) {
	let config = fn(node, params);

	let t = intro ? 0 : 1;

	let running_program = null;
	let pending_program = null;
	let animation_name = null;

	function clear_animation() {
		if (animation_name) delete_rule(node, animation_name);
	}

	function init(program, duration) {
		const d = program.b - t;
		duration *= Math.abs(d);

		return {
			a: t,
			b: program.b,
			d,
			duration,
			start: program.start,
			end: program.start + duration,
			group: program.group
		};
	}

	function go(b) {
		const {
			delay = 0,
			duration = 300,
			easing = identity,
			tick: tick$$1 = noop,
			css
		} = config;

		const program = {
			start: exports.now() + delay,
			b
		};

		if (!b) {
			program.group = outros;
			outros.remaining += 1;
		}

		if (running_program) {
			pending_program = program;
		} else {
			// if this is an intro, and there's a delay, we need to do
			// an initial tick and/or apply CSS animation immediately
			if (css) {
				clear_animation();
				animation_name = create_rule(node, t, b, duration, delay, easing, css);
			}

			if (b) tick$$1(0, 1);

			running_program = init(program, duration);
			add_render_callback(() => dispatch(node, b, 'start'));

			loop(now => {
				if (pending_program && now > pending_program.start) {
					running_program = init(pending_program, duration);
					pending_program = null;

					dispatch(node, running_program.b, 'start');

					if (css) {
						clear_animation();
						animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
					}
				}

				if (running_program) {
					if (now >= running_program.end) {
						tick$$1(t = running_program.b, 1 - t);
						dispatch(node, running_program.b, 'end');

						if (!pending_program) {
							// we're done
							if (running_program.b) {
								// intro — we can tidy up immediately
								clear_animation();
							} else {
								// outro — needs to be coordinated
								if (!--running_program.group.remaining) run_all(running_program.group.callbacks);
							}
						}

						running_program = null;
					}

					else if (now >= running_program.start) {
						const p = now - running_program.start;
						t = running_program.a + running_program.d * easing(p / running_program.duration);
						tick$$1(t, 1 - t);
					}
				}

				return !!(running_program || pending_program);
			});
		}
	}

	return {
		run(b) {
			if (typeof config === 'function') {
				wait().then(() => {
					config = config();
					go(b);
				});
			} else {
				go(b);
			}
		},

		end() {
			clear_animation();
			running_program = pending_program = null;
		}
	};
}

function handle_promise(promise, info) {
	const token = info.token = {};

	function update(type, index, key, value) {
		if (info.token !== token) return;

		info.resolved = key && { [key]: value };

		const child_ctx = assign(assign({}, info.ctx), info.resolved);
		const block = type && (info.current = type)(child_ctx);

		if (info.block) {
			if (info.blocks) {
				info.blocks.forEach((block, i) => {
					if (i !== index && block) {
						group_outros();
						on_outro(() => {
							block.d(1);
							info.blocks[i] = null;
						});
						block.o(1);
						check_outros();
					}
				});
			} else {
				info.block.d(1);
			}

			block.c();
			if (block.i) block.i(1);
			block.m(info.mount(), info.anchor);

			flush();
		}

		info.block = block;
		if (info.blocks) info.blocks[index] = block;
	}

	if (is_promise(promise)) {
		promise.then(value => {
			update(info.then, 1, info.value, value);
		}, error => {
			update(info.catch, 2, info.error, error);
		});

		// if we previously had a then/catch block, destroy it
		if (info.current !== info.pending) {
			update(info.pending, 0);
			return true;
		}
	} else {
		if (info.current !== info.then) {
			update(info.then, 1, info.value, promise);
			return true;
		}

		info.resolved = { [info.value]: promise };
	}
}

function destroy_block(block, lookup) {
	block.d(1);
	lookup.delete(block.key);
}

function outro_and_destroy_block(block, lookup) {
	on_outro(() => {
		destroy_block(block, lookup);
	});

	block.o(1);
}

function fix_and_outro_and_destroy_block(block, lookup) {
	block.f();
	outro_and_destroy_block(block, lookup);
}

function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
	let o = old_blocks.length;
	let n = list.length;

	let i = o;
	const old_indexes = {};
	while (i--) old_indexes[old_blocks[i].key] = i;

	const new_blocks = [];
	const new_lookup = new Map();
	const deltas = new Map();

	i = n;
	while (i--) {
		const child_ctx = get_context(ctx, list, i);
		const key = get_key(child_ctx);
		let block = lookup.get(key);

		if (!block) {
			block = create_each_block(key, child_ctx);
			block.c();
		} else if (dynamic) {
			block.p(changed, child_ctx);
		}

		new_lookup.set(key, new_blocks[i] = block);

		if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
	}

	const will_move = new Set();
	const did_move = new Set();

	function insert(block) {
		if (block.i) block.i(1);
		block.m(node, next);
		lookup.set(block.key, block);
		next = block.first;
		n--;
	}

	while (o && n) {
		const new_block = new_blocks[n - 1];
		const old_block = old_blocks[o - 1];
		const new_key = new_block.key;
		const old_key = old_block.key;

		if (new_block === old_block) {
			// do nothing
			next = new_block.first;
			o--;
			n--;
		}

		else if (!new_lookup.has(old_key)) {
			// remove old block
			destroy(old_block, lookup);
			o--;
		}

		else if (!lookup.has(new_key) || will_move.has(new_key)) {
			insert(new_block);
		}

		else if (did_move.has(old_key)) {
			o--;

		} else if (deltas.get(new_key) > deltas.get(old_key)) {
			did_move.add(new_key);
			insert(new_block);

		} else {
			will_move.add(old_key);
			o--;
		}
	}

	while (o--) {
		const old_block = old_blocks[o];
		if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
	}

	while (n) insert(new_blocks[n - 1]);

	return new_blocks;
}

function measure(blocks) {
	const rects = {};
	let i = blocks.length;
	while (i--) rects[blocks[i].key] = blocks[i].node.getBoundingClientRect();
	return rects;
}

function get_spread_update(levels, updates) {
	const update = {};

	const to_null_out = {};
	const accounted_for = { $$scope: 1 };

	let i = levels.length;
	while (i--) {
		const o = levels[i];
		const n = updates[i];

		if (n) {
			for (const key in o) {
				if (!(key in n)) to_null_out[key] = 1;
			}

			for (const key in n) {
				if (!accounted_for[key]) {
					update[key] = n[key];
					accounted_for[key] = 1;
				}
			}

			levels[i] = n;
		} else {
			for (const key in o) {
				accounted_for[key] = 1;
			}
		}
	}

	for (const key in to_null_out) {
		if (!(key in update)) update[key] = undefined;
	}

	return update;
}

const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// https://infra.spec.whatwg.org/#noncharacter

function spread(args) {
	const attributes = Object.assign({}, ...args);
	let str = '';

	Object.keys(attributes).forEach(name => {
		if (invalid_attribute_name_character.test(name)) return;

		const value = attributes[name];
		if (value === undefined) return;
		if (value === true) str += " " + name;

		const escaped = String(value)
			.replace(/"/g, '&#34;')
			.replace(/'/g, '&#39;');

		str += " " + name + "=" + JSON.stringify(escaped);
	});

	return str;
}

const escaped = {
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;'
};

function escape(html) {
	return String(html).replace(/["'&<>]/g, match => escaped[match]);
}

function each(items, fn) {
	let str = '';
	for (let i = 0; i < items.length; i += 1) {
		str += fn(items[i], i);
	}
	return str;
}

const missing_component = {
	$$render: () => ''
};

function validate_component(component, name) {
	if (!component || !component.$$render) {
		if (name === 'svelte:component') name += ' this={...}';
		throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
	}

	return component;
}

function debug(file, line, column, values) {
	console.log(`{@debug} ${file ? file + ' ' : ''}(${line}:${column})`); // eslint-disable-line no-console
	console.log(values); // eslint-disable-line no-console
	return '';
}

let on_destroy;

function create_ssr_component(fn) {
	function $$render(result, props, bindings, slots) {
		const parent_component = exports.current_component;

		const $$ = {
			on_destroy,
			context: new Map(parent_component ? parent_component.$$.context : []),

			// these will be immediately discarded
			on_mount: [],
			before_render: [],
			after_render: [],
			callbacks: blank_object()
		};

		set_current_component({ $$ });

		const html = fn(result, props, bindings, slots);

		set_current_component(parent_component);
		return html;
	}

	return {
		render: (props = {}, options = {}) => {
			on_destroy = [];

			const result = { head: '', css: new Set() };
			const html = $$render(result, props, {}, options);

			run_all(on_destroy);

			return {
				html,
				css: {
					code: Array.from(result.css).map(css => css.code).join('\n'),
					map: null // TODO
				},
				head: result.head
			};
		},

		$$render
	};
}

function get_store_value(store) {
	let value;
	store.subscribe(_ => value = _)();
	return value;
}

function bind(component, name, callback) {
	if (component.$$.props.indexOf(name) === -1) return;
	component.$$.bound[name] = callback;
	callback(component.$$.ctx[name]);
}

function mount_component(component, target, anchor) {
	const { fragment, on_mount, on_destroy, after_render } = component.$$;

	fragment.m(target, anchor);

	// onMount happens after the initial afterUpdate. Because
	// afterUpdate callbacks happen in reverse order (inner first)
	// we schedule onMount callbacks before afterUpdate callbacks
	add_render_callback(() => {
		const new_on_destroy = on_mount.map(run).filter(is_function);
		if (on_destroy) {
			on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});

	after_render.forEach(add_render_callback);
}

function destroy(component, detaching) {
	if (component.$$) {
		run_all(component.$$.on_destroy);
		component.$$.fragment.d(detaching);

		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		component.$$.on_destroy = component.$$.fragment = null;
		component.$$.ctx = {};
	}
}

function make_dirty(component, key) {
	if (!component.$$.dirty) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty = blank_object();
	}
	component.$$.dirty[key] = true;
}

function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
	const parent_component = exports.current_component;
	set_current_component(component);

	const props = options.props || {};

	const $$ = component.$$ = {
		fragment: null,
		ctx: null,

		// state
		props: prop_names,
		update: noop,
		not_equal: not_equal$$1,
		bound: blank_object(),

		// lifecycle
		on_mount: [],
		on_destroy: [],
		before_render: [],
		after_render: [],
		context: new Map(parent_component ? parent_component.$$.context : []),

		// everything else
		callbacks: blank_object(),
		dirty: null
	};

	let ready = false;

	$$.ctx = instance
		? instance(component, props, (key, value) => {
			if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
				if ($$.bound[key]) $$.bound[key](value);
				if (ready) make_dirty(component, key);
			}
		})
		: props;

	$$.update();
	ready = true;
	run_all($$.before_render);
	$$.fragment = create_fragment($$.ctx);

	if (options.target) {
		if (options.hydrate) {
			$$.fragment.l(children(options.target));
		} else {
			$$.fragment.c();
		}

		if (options.intro && component.$$.fragment.i) component.$$.fragment.i();
		mount_component(component, options.target, options.anchor);
		flush();
	}

	set_current_component(parent_component);
}
if (typeof HTMLElement !== 'undefined') {
	exports.SvelteElement = class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
		}

		connectedCallback() {
			for (const key in this.$$.slotted) {
				this.appendChild(this.$$.slotted[key]);
			}
		}

		attributeChangedCallback(attr$$1, oldValue, newValue) {
			this[attr$$1] = newValue;
		}

		$destroy() {
			destroy(this, true);
			this.$destroy = noop;
		}

		$on(type, callback) {
			// TODO should this delegate to addEventListener?
			const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
			callbacks.push(callback);

			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		$set() {
			// overridden by instance, if it has props
		}
	};
}

class SvelteComponent {
	$destroy() {
		destroy(this, true);
		this.$destroy = noop;
	}

	$on(type, callback) {
		const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
		callbacks.push(callback);

		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	$set() {
		// overridden by instance, if it has props
	}
}

class SvelteComponentDev extends SvelteComponent {
	constructor(options) {
		if (!options || (!options.target && !options.$$inline)) {
			throw new Error(`'target' is a required option`);
		}

		super();
	}

	$destroy() {
		super.$destroy();
		this.$destroy = () => {
			console.warn(`Component was already destroyed`); // eslint-disable-line no-console
		};
	}
}

exports.create_animation = create_animation;
exports.fix_position = fix_position;
exports.handle_promise = handle_promise;
exports.append = append;
exports.insert = insert;
exports.detach = detach;
exports.detach_between = detach_between;
exports.detach_before = detach_before;
exports.detach_after = detach_after;
exports.destroy_each = destroy_each;
exports.element = element;
exports.object_without_properties = object_without_properties;
exports.svg_element = svg_element;
exports.text = text;
exports.space = space;
exports.empty = empty;
exports.listen = listen;
exports.prevent_default = prevent_default;
exports.stop_propagation = stop_propagation;
exports.attr = attr;
exports.set_attributes = set_attributes;
exports.set_custom_element_data = set_custom_element_data;
exports.xlink_attr = xlink_attr;
exports.get_binding_group_value = get_binding_group_value;
exports.to_number = to_number;
exports.time_ranges_to_array = time_ranges_to_array;
exports.children = children;
exports.claim_element = claim_element;
exports.claim_text = claim_text;
exports.set_data = set_data;
exports.set_input_type = set_input_type;
exports.set_style = set_style;
exports.select_option = select_option;
exports.select_options = select_options;
exports.select_value = select_value;
exports.select_multiple_value = select_multiple_value;
exports.add_resize_listener = add_resize_listener;
exports.toggle_class = toggle_class;
exports.custom_event = custom_event;
exports.destroy_block = destroy_block;
exports.outro_and_destroy_block = outro_and_destroy_block;
exports.fix_and_outro_and_destroy_block = fix_and_outro_and_destroy_block;
exports.update_keyed_each = update_keyed_each;
exports.measure = measure;
exports.set_current_component = set_current_component;
exports.beforeUpdate = beforeUpdate;
exports.onMount = onMount;
exports.afterUpdate = afterUpdate;
exports.onDestroy = onDestroy;
exports.createEventDispatcher = createEventDispatcher;
exports.setContext = setContext;
exports.getContext = getContext;
exports.bubble = bubble;
exports.clear_loops = clear_loops;
exports.loop = loop;
exports.dirty_components = dirty_components;
exports.intros = intros;
exports.schedule_update = schedule_update;
exports.tick = tick;
exports.add_binding_callback = add_binding_callback;
exports.add_render_callback = add_render_callback;
exports.add_flush_callback = add_flush_callback;
exports.flush = flush;
exports.get_spread_update = get_spread_update;
exports.invalid_attribute_name_character = invalid_attribute_name_character;
exports.spread = spread;
exports.escaped = escaped;
exports.escape = escape;
exports.each = each;
exports.missing_component = missing_component;
exports.validate_component = validate_component;
exports.debug = debug;
exports.create_ssr_component = create_ssr_component;
exports.get_store_value = get_store_value;
exports.group_outros = group_outros;
exports.check_outros = check_outros;
exports.on_outro = on_outro;
exports.create_in_transition = create_in_transition;
exports.create_out_transition = create_out_transition;
exports.create_bidirectional_transition = create_bidirectional_transition;
exports.noop = noop;
exports.identity = identity;
exports.assign = assign;
exports.is_promise = is_promise;
exports.add_location = add_location;
exports.run = run;
exports.blank_object = blank_object;
exports.run_all = run_all;
exports.is_function = is_function;
exports.safe_not_equal = safe_not_equal;
exports.not_equal = not_equal;
exports.validate_store = validate_store;
exports.subscribe = subscribe;
exports.create_slot = create_slot;
exports.get_slot_context = get_slot_context;
exports.get_slot_changes = get_slot_changes;
exports.exclude_internal_props = exclude_internal_props;
exports.set_now = set_now;
exports.bind = bind;
exports.mount_component = mount_component;
exports.init = init;
exports.SvelteComponent = SvelteComponent;
exports.SvelteComponentDev = SvelteComponentDev;

},{}],"../node_modules/svelte-dev-helper/lib/registry.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class registry {
  constructor() {
    this._items = {};
  }

  set(k, v) {
    this._items[k] = Object.assign({
      rollback: null,
      component: null,
      instances: []
    }, v);
  }

  get(k) {
    return k ? this._items[k] || undefined : this._items;
  }

  registerInstance(instance) {
    const id = instance.id;
    this._items[id] && this._items[id].instances.push(instance);
  }

  deRegisterInstance(instance) {
    const id = instance.id;
    this._items[id] && this._items[id].instances.forEach(function (comp, idx, instances) {
      if (comp == instance) {
        instances.splice(idx, 1);
      }
    });
  }

} // eslint-disable-next-line no-undef


const componentRegistry = window.__SVELTE_REGISTRY__ = new registry();
var _default = componentRegistry;
exports.default = _default;
},{}],"../node_modules/svelte-dev-helper/lib/proxy.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = configure;
exports.getConfig = getConfig;
exports.createProxy = createProxy;
Object.defineProperty(exports, "Registry", {
  enumerable: true,
  get: function () {
    return _registry.default;
  }
});

var _registry = _interopRequireDefault(require("./registry"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let proxyOptions = {
  noPreserveState: false
};

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function getDebugName(id) {
  const posixID = id.replace(/[/\\]/g, '/');
  const name = posixID.split('/').pop().split('.').shift();
  return `<${capitalize(name)}>`;
}

function groupStart(msg) {
  console.group && console.group(msg);
}

function groupEnd() {
  console.groupEnd && console.groupEnd();
}

function configure(_options) {
  proxyOptions = Object.assign(proxyOptions, _options);
}

function getConfig() {
  return proxyOptions;
}
/*
creates a proxy object that
decorates the original component with trackers
and ensures resolution to the
latest version of the component
*/


function createProxy(id) {
  const handledMethods = '_mount,_unmount,destroy'.split(',');
  const forwardedMethods = 'get,fire,observe,on,set,teardown,_recompute,_set,_bind'.split(',');

  class proxyComponent {
    constructor(options) {
      this.id = id;
      this.__mountpoint = null;
      this.__anchor = null;
      this.__insertionPoint = null;
      this.__mounted = false;

      this._register(options);

      this._debugName = this.proxyTarget._debugName || getDebugName(this.id); // ---- forwarded methods ----

      const self = this;
      forwardedMethods.forEach(function (method) {
        self[method] = function () {
          return self.proxyTarget[method].apply(self.proxyTarget, arguments);
        };
      }); // ---- END forwarded methods ----
    } // ---- augmented methods ----


    _mount(target, anchor, insertionPoint) {
      this.__mountpoint = target;
      this.__anchor = anchor;

      if (insertionPoint) {
        this.__insertionPoint = insertionPoint;
      } else {
        // eslint-disable-next-line no-undef
        this.__insertionPoint = document.createComment(this._debugName);
        target.insertBefore(this.__insertionPoint, anchor);
      }

      this.__insertionPoint.__component__ = this;
      anchor = this.__insertionPoint.nextSibling;

      if (target.nodeName == '#document-fragment' && insertionPoint) {
        //handles #4 by forcing a target
        //if original target was a document fragment
        target = this.__insertionPoint.parentNode;
      }

      this.__mounted = true;
      return this.proxyTarget._mount(target, anchor);
    }

    destroy(detach, keepInsertionPoint) {
      _registry.default.deRegisterInstance(this);

      if (!keepInsertionPoint && this.__insertionPoint) {
        //deref for GC before removal of node
        this.__insertionPoint.__component__ = null;
        const ip = this.__insertionPoint;
        ip && ip.parentNode && ip.parentNode.removeChild(ip);
      }

      return this.proxyTarget.destroy(detach);
    }

    _unmount() {
      this.__mounted = false;
      return this.proxyTarget._unmount.apply(this.proxyTarget, arguments);
    } // ---- END augmented methods ----
    // ---- extra methods ----


    _register(options) {
      const record = _registry.default.get(this.id);

      try {
        //resolve to latest version of component
        this.proxyTarget = new record.component(options);
      } catch (e) {
        const rb = record.rollback;

        if (!rb) {
          console.error(e);
          console.warn('Full reload required. Please fix component errors and reload the whole page');
          return;
        }

        groupStart(this._debugName + ' Errors');
        console.warn(e);
        console.warn(this._debugName + ' could not be hot-loaded because it has an error'); //resolve to previous working version of component

        this.proxyTarget = new rb(options);
        console.info('%c' + this._debugName + ' rolled back to previous working version', 'color:green'); //set latest version as the rolled-back version

        record.component = rb;
        groupEnd();
      }

      _registry.default.set(this.id, record); //register current instance, so that
      //we can re-render it when required


      _registry.default.registerInstance(this); //proxy custom methods


      const self = this;
      let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(self.proxyTarget));
      methods.forEach(function (method) {
        if (!handledMethods.includes(method) && !forwardedMethods.includes(method)) {
          self[method] = function () {
            return self.proxyTarget[method].apply(self.proxyTarget, arguments);
          };
        }
      }); //(re)expose properties that might be used from outside

      this.refs = this.proxyTarget.refs || {};
      this._fragment = this.proxyTarget._fragment;
      this._slotted = this.proxyTarget._slotted;
      this.root = this.proxyTarget.root;
      this.store = this.proxyTarget.store || null;
    }

    _rerender() {
      const mountpoint = this.__mountpoint || null,
            anchor = this.__anchor || null,
            options = this.proxyTarget.options,
            oldstate = this.get(),
            isMounted = this.__mounted,
            insertionPoint = this.__insertionPoint,
            handlers = this.proxyTarget._handlers;
      this.destroy(true, true);

      this._register(options); //re-attach event handlers


      const self = this;

      for (const ev in handlers) {
        const _handlers = handlers[ev];

        _handlers.forEach(function (item) {
          if (item.toString().includes('component.fire(')) {
            self.proxyTarget.on(ev, item);
          }
        });
      }

      if (mountpoint && isMounted) {
        this.proxyTarget._fragment.c();

        this._mount(mountpoint, anchor, insertionPoint); //work around _checkReadOnly in svelte (for computed properties)


        this.proxyTarget._updatingReadonlyProperty = true; //preserve local state (unless noPreserveState is true)

        if (!this.proxyTarget.constructor.noPreserveState && !proxyOptions.noPreserveState) {
          //manually flush computations and re-render changes
          let changed = {};

          for (let k in oldstate) {
            changed[k] = true;
          }

          this.proxyTarget._recompute(changed, oldstate);

          this.proxyTarget._fragment && this.proxyTarget._fragment.p(changed, oldstate); //set old state back

          this.set(oldstate);
        } else {
          //we have to call .set() here
          //otherwise oncreate is not fired
          this.set(this.get());
        }

        this.proxyTarget._updatingReadonlyProperty = false;
      }
    } // ---- END extra methods ----


  } //forward static properties and methods


  const originalComponent = _registry.default.get(id).component;

  for (let key in originalComponent) {
    proxyComponent[key] = originalComponent[key];
  }

  return proxyComponent;
}
},{"./registry":"../node_modules/svelte-dev-helper/lib/registry.js"}],"../node_modules/svelte-dev-helper/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _proxy = require("./lib/proxy");

Object.keys(_proxy).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _proxy[key];
    }
  });
});
},{"./lib/proxy":"../node_modules/svelte-dev-helper/lib/proxy.js"}],"../node_modules/parcel-plugin-svelte/src/hot-api.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = configure;
exports.register = register;
exports.reload = reload;

var _svelteDevHelper = require("svelte-dev-helper");

let hotOptions = {
  noPreserveState: false
};

function configure(options) {
  hotOptions = Object.assign(hotOptions, options);
  (0, _svelteDevHelper.configure)(hotOptions);
}

function register(id, component) {
  // Store original component in registry
  _svelteDevHelper.Registry.set(id, {
    rollback: null,
    component,
    instances: []
  }); // Create the proxy itself


  const proxy = (0, _svelteDevHelper.createProxy)(id); // Patch the registry record with proxy constructor

  const record = _svelteDevHelper.Registry.get(id);

  record.proxy = proxy;

  _svelteDevHelper.Registry.set(id, record);

  return proxy;
}

function reload(id, component) {
  const record = _svelteDevHelper.Registry.get(id); // Keep reference to previous version to enable rollback


  record.rollback = record.component; // Replace component in registry with newly loaded component

  record.component = component;

  _svelteDevHelper.Registry.set(id, record); // Re-render the proxy instances


  record.instances.slice().forEach(instance => instance && instance._rerender()); // Return the original proxy constructor that was `register()`-ed

  return record.proxy;
}
},{"svelte-dev-helper":"../node_modules/svelte-dev-helper/index.js"}],"../node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
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
},{}],"../node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
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
},{"./bundle-url":"../node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"components/App.svelte":[function(require,module,exports) {
"use strict";

var _internal = require("svelte/internal");

/* components/App.svelte generated by Svelte v3.4.2 */
function add_css() {
  var style = (0, _internal.element)("style");
  style.id = 'svelte-i7qo5m-style';
  style.textContent = "h1.svelte-i7qo5m{color:purple}";
  (0, _internal.append)(document.head, style);
}

function create_fragment(ctx) {
  var h1, t0, t1, t2;
  return {
    c() {
      h1 = (0, _internal.element)("h1");
      t0 = (0, _internal.text)("Hello ");
      t1 = (0, _internal.text)(ctx.name);
      t2 = (0, _internal.text)("!");
      h1.className = "svelte-i7qo5m";
    },

    m(target, anchor) {
      (0, _internal.insert)(target, h1, anchor);
      (0, _internal.append)(h1, t0);
      (0, _internal.append)(h1, t1);
      (0, _internal.append)(h1, t2);
    },

    p(changed, ctx) {
      if (changed.name) {
        (0, _internal.set_data)(t1, ctx.name);
      }
    },

    i: _internal.noop,
    o: _internal.noop,

    d(detaching) {
      if (detaching) {
        (0, _internal.detach)(h1);
      }
    }

  };
}

function instance($$self, $$props, $$invalidate) {
  var name = $$props.name;

  $$self.$set = $$props => {
    if ('name' in $$props) $$invalidate('name', name = $$props.name);
  };

  return {
    name
  };
}

class App extends _internal.SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-i7qo5m-style")) add_css();
    (0, _internal.init)(this, options, instance, create_fragment, _internal.safe_not_equal, ["name"]);
  }

}

if (module.hot) {
  var _require = require('../../node_modules/parcel-plugin-svelte/src/hot-api.js'),
      configure = _require.configure,
      register = _require.register,
      reload = _require.reload;

  module.hot.accept();

  if (!module.hot.data) {
    // initial load
    configure({});
    App = register('components/App.svelte', App);
  } else {
    // hot update
    App = reload('components/App.svelte', App);
  }
}

module.exports = App;
},{"svelte/internal":"../node_modules/svelte/internal.js","../../node_modules/parcel-plugin-svelte/src/hot-api.js":"../node_modules/parcel-plugin-svelte/src/hot-api.js","_css_loader":"../node_modules/parcel-bundler/src/builtins/css-loader.js"}],"assets/js/main.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _App = _interopRequireDefault(require("../../components/App.svelte"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = new _App.default({
  target: document.body,
  props: {
    name: 'สวัสดี'
  }
});
var _default = app;
exports.default = _default;
},{"../../components/App.svelte":"components/App.svelte"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "64209" + '/');

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
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","assets/js/main.js"], null)
//# sourceMappingURL=/main.cea5deef.js.map