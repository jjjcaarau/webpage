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
})({"list.js":[function(require,module,exports) {
window.onload = function () {
  var filterMembers = function filterMembers(vnode, input) {
    if (input && input != '') {
      var options = {
        keys: ['0.first_name', '0.last_name', '0.email_1'],
        threshold: 0.00,
        tokenize: true
      };
      var fuse = new Fuse(vnode.state.members, options);
      vnode.state.filteredMembers = fuse.search(input);
    } else {
      vnode.state.filteredMembers = vnode.state.members;
    }
  };

  var q = '';
  var MemberDetails = {
    oninit: function oninit(vnode) {
      vnode.state.member = vnode.attrs.member;
      vnode.state.events = vnode.attrs.events;
    },
    view: function view(vnode) {
      var member = vnode.state.member;
      var events = vnode.state.events;
      return [m('div.col-12', m('form#update-member', m('.form-row', [m('.col', [console.log(member.birthday), member.birthday != '1970-01-01' ? m('label', member.first_name + ' ' + member.middle_name + ' ' + member.last_name + ', ' + member.birthday) : m('label', member.first_name + ' ' + member.middle_name + ' ' + member.last_name)])]), m('.form-row', [
        /* m('.col', [
            m('label', 'Sex'),
            m('input[type="text"][name=sex].form-control[placeholder="Sex"]', { value: member.sex })
        ]),
        m('.col', [
            m('label', member.birthday),
            //m('input[type="text"][name=birthday].form-control[placeholder="Birthday"]', { value: member.birthday })
        ]), */
      ]), m('.form-row', [m('.col', [member.postcode == '' && member.city == '' && member.address == '' && member.address_no == '' ? '' : m('label', member.postcode + ' ' + member.city + ', ' + member.address + ' ' + member.address_no)])]), m('.form-row', [
        /*m('.col', [
            m('label', member.postcode + ' ' + member.city),
            //m('input[type="text"][name=postcode].form-control[placeholder="PLZ"]', { value: member.postcode })
        ]),
        m('.col', [
            m('label', member.city),
            //m('input[type="text"][name=city].form-control[placeholder="City"]', { value: member.city })
        ]), */
      ]), m('.form-row', [m('.col', [member.email != '' && member.phone_p != '' ? m('label', member.email + ' | ' + member.phone_p) : m('label', member.email + member.phone_p)])]),
      /*m('.form-row', [
          m('.col', [
              m('label', 'Comment'),
              m('textarea[name=comment].form-control[placeholder="Comment"]', { value: member.comment })
          ]),
      ]), */
      m('.form-row', [m('.col', [//m('button[type="submit"].btn.btn-primary', {
      //    onclick: function(e) {
      //        e.preventDefault();
      //        updateMember(member);
      //    }
      //}, 'Save'),
      m('button[type="view"].btn.btn-primary', {
        onclick: function onclick(e) {
          e.preventDefault();
          window.location = '/members/view/' + member.id;
        }
      }, 'Details')])]), m('.form-row', [m('.col', [m('.badge.badge-pill.badge-primary', '')])])
      /* m('.form-row', [
          m('.col', [
              m(MemberEvents, { events: events })
          ]),
      ]), */
      ))];
    }
  };
  var MembersList = {
    oninit: function oninit(vnode) {
      vnode.state.q = '';
      vnode.state.selected = undefined;
      m.request({
        method: 'GET',
        url: "/members/list_json"
      }).then(function (result) {
        vnode.state.members = result;
        filterMembers(vnode, vnode.state.q);
      });
    },
    view: function view(vnode) {
      return [m('div.col-12', m('form', m('.form-group', [m('input[type=text].form-control[placeholder="Suche nach Vor- oder Nachname"]', {
        value: vnode.state.q,
        oninput: function oninput(e) {
          vnode.state.q = e.target.value;
          filterMembers(vnode, vnode.state.q);
        }
      })]))), m('div.col-12', [m('table.table.table-hover.col-12', [m('thead', m('tr', [m('th', 'ID'), m('th', 'Vorname'), m('th', 'Nachname(n)'), m('th', 'E-Mail'), m('th', 'Geburtstag')])), m('tbody', [[m('tr', {
        onclick: function onclick() {
          vnode.state.selected = 0;
        }
      } //[
      //    m('td[colspan=4]', 'Add new member'),
      //]),
      ), vnode.state.selected == 0 ? m('tr', [m('td[colspan=4]', m(MemberDetails, {
        member: {
          id: 0
        },
        events: []
      }))]) : ''], vnode.state.filteredMembers ? vnode.state.filteredMembers.map(function (entry) {
        var member = entry[0];
        var events = entry[1];
        return [m('tr', {
          onclick: function onclick() {
            if (vnode.state.selected != member.id) {
              vnode.state.selected = member.id;
            } else {
              vnode.state.selected = undefined;
            }
          }
        }, [m('td', member.id), m('td', member.first_name), m('td', member.last_name), m('td', member.email), m('td', member.birthday)]), vnode.state.selected == member.id ? m('tr', [m('td[colspan=4]', m(MemberDetails, {
          member: member,
          events: events
        }))]) : ''];
      }) : ''])])])];
    }
  };
  m.mount(document.getElementById('mount'), MembersList);
};
},{}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","list.js"], null)
//# sourceMappingURL=/static/js/list.js.map