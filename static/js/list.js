parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"gTtB":[function(require,module,exports) {
function e(e){var t=document.createElement("textarea");t.value=e,document.body.appendChild(t),t.focus(),t.select();try{var n=document.execCommand("copy")?"successful":"unsuccessful";console.log("Fallback: Copying text command was "+n)}catch(a){console.error("Fallback: Oops, unable to copy",a)}document.body.removeChild(t)}function t(t){navigator.clipboard?navigator.clipboard.writeText(t).catch(function(e){console.error("Async: Could not copy text: ",e)}):e(t)}var n=function(e,t){e.state.kids&&e.state.judo&&e.state.jujitsu&&e.state.passive&&e.state.active&&e.state.resigned&&e.state.extern;if(t&&""!=t){var n=new Fuse(e.state.members,{keys:["0.first_name","0.last_name","0.email_1"],threshold:0,tokenize:!0});e.state.filteredMembers=n.search(t)}else e.state.filteredMembers=e.state.members;e.state.filteredMembers=e.state.filteredMembers.map(function(t){var n=t[3];return e.state.kids&&n.filter(function(e){return"Kid"==e}).length>0?t:e.state.judo&&n.filter(function(e){return e.Grade&&(e.Grade.Dan&&"Judo"==e.Grade.Dan[0]||e.Grade.Kyu&&"Judo"==e.Grade.Kyu[0])}).length>0?t:e.state.jujitsu&&n.filter(function(e){return e.Grade&&(e.Grade.Dan&&"JuJitsu"==e.Grade.Dan[0]||e.Grade.Kyu&&"JuJitsu"==e.Grade.Kyu[0])}).length>0?t:e.state.extern&&n.filter(function(e){return"Extern"==e}).length>0?t:void 0}).filter(function(e){return void 0!==e}),e.state.filteredMembers=e.state.filteredMembers.map(function(t){var n=t[3];return e.state.active&&n.filter(function(e){return"Active"==e}).length>0?t:e.state.passive&&n.filter(function(e){return"Passive"==e}).length>0?t:e.state.resigned&&n.filter(function(e){return"Resigned"==e}).length>0?t:e.state.extern&&n.filter(function(e){return"Extern"==e}).length>0?t:void 0}).filter(function(e){return void 0!==e}),e.state.mails=e.state.filteredMembers.map(function(e){return e[0].email}).join(",")},a={oninit:function(e){e.state.q="",e.state.kids=!0,e.state.judo=!0,e.state.jujitsu=!0,e.state.passive=!0,e.state.active=!0,e.state.resigned=!0,e.state.extern=!0,e.state.mails="",m.request({method:"GET",url:"/members/list_json"}).then(function(t){e.state.members=t,n(e,e.state.q)})},view:function(e){return[m("div.col-9",m("form",m(".form-group",[m("button.btn.btn-success[type=text]",{onclick:function(e){e.preventDefault(),window.location="/members/view/0"}},[m("i.fas.fa-plus")," Neues Mitglied hinzufügen."])]))),m("div.col-3",m("p.text-right",[m("a[href=#]",{onclick:function(n){n.preventDefault(),t(e.state.mails)}},"Email-Liste kopieren ..."),m("br"),m("a",{href:"mailto:"+e.state.mails},"Email an Liste schreiben ...")])),m("div.col-12",m("",m(".form-group",[m('input[type=text].form-control[placeholder="Suche nach Vor- oder Nachname"]',{value:e.state.q,oninput:function(t){e.state.q=t.target.value,n(e,e.state.q)}})]))),m("div.col-12",m(".row.form-group",[m(".col-2",m("label[for=field-kids]","Kinder")),m(".form-check.col-1",[m("input[type=checkbox].form-check-input"+(e.state.kids?"[checked]":""),{placeholder:"Kinder",id:"field-kids",onchange:function(t){e.state.kids=!e.state.kids,n(e,e.state.q)}})]),m(".col-2",m("label[for=field-judo]","Judo")),m(".form-check.col-1",[m("input[type=checkbox].form-check-input"+(e.state.judo?"[checked]":""),{placeholder:"Judo",id:"field-judo",onchange:function(t){e.state.judo=!e.state.judo,n(e,e.state.q)}})]),m(".col-2",m("label[for=field-jujitsu]","Ju Jitsu")),m(".form-check.col-1",[m("input[type=checkbox].form-check-input"+(e.state.jujitsu?"[checked]":""),{placeholder:"Ju Jitsu",id:"field-jujitsu",onchange:function(t){e.state.jujitsu=!e.state.jujitsu,n(e,e.state.q)}})]),m(".col-2",m("label[for=field-resigned]","Extern")),m(".form-check.col-1",[m("input[type=checkbox].form-check-input",{placeholder:"Extern",id:"field-external",checked:e.state.extern,onchange:function(t){e.state.extern=!e.state.extern,n(e,e.state.q)}})])]),m(".row.form-group",[m(".col-2",m("label[for=field-active]","Aktiv")),m(".form-check.col-1",[m("input[type=checkbox].form-check-input"+(e.state.active?"[checked]":""),{placeholder:"Aktiv",id:"field-active",onchange:function(t){e.state.active=!e.state.active,n(e,e.state.q)}})]),m(".col-2",m("label[for=field-passive]","Passiv")),m(".form-check.col-1",[m("input[type=checkbox].form-check-input"+(e.state.passive?"[checked]":""),{placeholder:"Passiv",id:"field-passive",onchange:function(t){e.state.passive=!e.state.passive,n(e,e.state.q)}})]),m(".col-2",m("label[for=field-resigned]","Ausgetreten")),m(".form-check.col-1",[m("input[type=checkbox].form-check-input"+(e.state.resigned?"[checked]":""),{placeholder:"Ausgetreten",id:"field-resigned",onchange:function(t){e.state.resigned=!e.state.resigned,n(e,e.state.q)}})]),m(".col-2",m("label[for=field-resigned]","Extern")),m(".form-check.col-1",[m("input[type=checkbox].form-check-input",{placeholder:"Extern",id:"field-external2",checked:e.state.extern,onchange:function(t){e.state.extern=!e.state.extern,n(e,e.state.q)}})])])),m("div.col-12",[m("table.table.table-hover.col-12",[m("thead",m("tr",[m("th","ID"),m("th","Vorname"),m("th","Nachname(n)"),m("th","E-Mail"),m("th","Geburtstag")])),m("tbody",[e.state.filteredMembers?e.state.filteredMembers.map(function(e){var t=e[0];e[1];return[m("tr",{onclick:function(e){e.preventDefault(),window.location="/members/view/"+t.id}},[m("td",t.id),m("td",t.first_name),m("td",t.last_name),m("td",t.email),m("td",t.birthday)])]}):""])])])]}};window.onload=function(){m.mount(document.getElementById("mount"),a)};
},{}]},{},["gTtB"], null)
//# sourceMappingURL=/static/js/list.js.map