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
var filterMembers = function filterMembers(vnode, input) {
  var filters = vnode.state.kids && vnode.state.judo && vnode.state.jujitsu && vnode.state.passive && vnode.state.active && vnode.state.resigned && vnode.state.external;

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

  vnode.state.filteredMembers = vnode.state.filteredMembers.map(function (m) {
    var tags = m[3];

    if (vnode.state.kids && tags.filter(function (t) {
      return t == 'Kid';
    }).length > 0) {
      return m;
    }

    if (vnode.state.judo && tags.filter(function (t) {
      return t.Grade && (t.Grade.Dan && t.Grade.Dan[0] == 'Judo' || t.Grade.Kyu && t.Grade.Kyu[0] == 'Judo');
    }).length > 0) {
      return m;
    }

    if (vnode.state.jujitsu && tags.filter(function (t) {
      return t.Grade && (t.Grade.Dan && t.Grade.Dan[0] == 'JuJitsu' || t.Grade.Kyu && t.Grade.Kyu[0] == 'JuJitsu');
    }).length > 0) {
      return m;
    }

    return undefined;
  }).filter(function (m) {
    return m !== undefined;
  });
  vnode.state.filteredMembers = vnode.state.filteredMembers.map(function (m) {
    var tags = m[3];
    console.log(tags);

    if (vnode.state.active && tags.filter(function (t) {
      return t == 'Active';
    }).length > 0) {
      return m;
    }

    if (vnode.state.passive && tags.filter(function (t) {
      return t == 'Passive';
    }).length > 0) {
      return m;
    }

    if (vnode.state.resigned && tags.filter(function (t) {
      return t == 'Resigned';
    }).length > 0) {
      return m;
    }

    if (vnode.state.external && tags.filter(function (t) {
      return t == 'External';
    }).length > 0) {
      return m;
    }

    return undefined;
  }).filter(function (m) {
    return m !== undefined;
  });
};

var MembersList = {
  oninit: function oninit(vnode) {
    vnode.state.q = '';
    vnode.state.kids = true;
    vnode.state.judo = true;
    vnode.state.jujitsu = true;
    vnode.state.passive = true;
    vnode.state.active = true;
    vnode.state.resigned = true;
    vnode.state.external = true;
    m.request({
      method: 'GET',
      url: "/members/list_json"
    }).then(function (result) {
      vnode.state.members = result;
      filterMembers(vnode, vnode.state.q);
    });
  },
  view: function view(vnode) {
    return [m('div.col-12', m('form', m('.form-group', [m('button.btn.btn-success[type=text]', {
      onclick: function onclick(e) {
        e.preventDefault();
        window.location = '/members/view/0';
      }
    }, [m('i.fas.fa-plus'), ' Neues Mitglied hinzufügen.'])]))), m('div.col-12', m('form', m('.form-group', [m('input[type=text].form-control[placeholder="Suche nach Vor- oder Nachname"]', {
      value: vnode.state.q,
      oninput: function oninput(e) {
        vnode.state.q = e.target.value;
        filterMembers(vnode, vnode.state.q);
      }
    })]))), m('div.col-12', m('.row.form-group', [m('.col-3', m('label[for=field-kids]', 'Kinder')), m('.form-check.col-1', [m('input[type=checkbox].form-check-input' + (vnode.state.kids ? '[checked]' : ''), {
      placeholder: 'Kinder',
      id: 'field-kids',
      onchange: function onchange(e) {
        vnode.state.kids = !vnode.state.kids;
        filterMembers(vnode, vnode.state.q);
      }
    })]), m('.col-3', m('label[for=field-judo]', 'Judo')), m('.form-check.col-1', [m('input[type=checkbox].form-check-input' + (vnode.state.judo ? '[checked]' : ''), {
      placeholder: 'Judo',
      id: 'field-judo',
      onchange: function onchange(e) {
        vnode.state.judo = !vnode.state.judo;
        filterMembers(vnode, vnode.state.q);
      }
    })]), m('.col-3', m('label[for=field-jujitsu]', 'Ju Jitsu')), m('.form-check.col-1', [m('input[type=checkbox].form-check-input' + (vnode.state.jujitsu ? '[checked]' : ''), {
      placeholder: 'Ju Jitsu',
      id: 'field-jujitsu',
      onchange: function onchange(e) {
        vnode.state.jujitsu = !vnode.state.jujitsu;
        filterMembers(vnode, vnode.state.q);
      }
    })])]), m('.row.form-group', [m('.col-2', m('label[for=field-active]', 'Aktiv')), m('.form-check.col-1', [m('input[type=checkbox].form-check-input' + (vnode.state.active ? '[checked]' : ''), {
      placeholder: 'Aktiv',
      id: 'field-active',
      onchange: function onchange(e) {
        vnode.state.active = !vnode.state.active;
        filterMembers(vnode, vnode.state.q);
      }
    })]), m('.col-2', m('label[for=field-passive]', 'Passiv')), m('.form-check.col-1', [m('input[type=checkbox].form-check-input' + (vnode.state.passive ? '[checked]' : ''), {
      placeholder: 'Passiv',
      id: 'field-passive',
      onchange: function onchange(e) {
        vnode.state.passive = !vnode.state.passive;
        filterMembers(vnode, vnode.state.q);
      }
    })]), m('.col-2', m('label[for=field-resigned]', 'Ausgetreten')), m('.form-check.col-1', [m('input[type=checkbox].form-check-input' + (vnode.state.resigned ? '[checked]' : ''), {
      placeholder: 'Ausgetreten',
      id: 'field-resigned',
      onchange: function onchange(e) {
        vnode.state.resigned = !vnode.state.resigned;
        filterMembers(vnode, vnode.state.q);
      }
    })]), m('.col-2', m('label[for=field-resigned]', 'Extern')), m('.form-check.col-1', [m('input[type=checkbox].form-check-input' + (vnode.state.external ? '[checked]' : ''), {
      placeholder: 'Extern',
      id: 'field-external',
      onchange: function onchange(e) {
        vnode.state.external = !vnode.state.external;
        filterMembers(vnode, vnode.state.q);
      }
    })])])), m('div.col-12', [m('table.table.table-hover.col-12', [m('thead', m('tr', [m('th', 'ID'), m('th', 'Vorname'), m('th', 'Nachname(n)'), m('th', 'E-Mail'), m('th', 'Geburtstag')])), m('tbody', [vnode.state.filteredMembers ? vnode.state.filteredMembers.map(function (entry) {
      var member = entry[0];
      var events = entry[1];
      return [m('tr', {
        onclick: function onclick(e) {
          e.preventDefault();
          window.location = '/members/view/' + member.id;
        }
      }, [m('td', member.id), m('td', member.first_name), m('td', member.last_name), m('td', member.email), m('td', member.birthday)])];
    }) : ''])])])];
  }
};

window.onload = function () {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "42221" + '/');

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