function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).catch(function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

const filterMembers = function(vnode) {
    
    // 'section' ['judo', 'ju jitsu', 'jujitsu']
    // 'type' ['aktiv', 'passiv', 'kind' 'ausgetreten', 'extern']
    // 'vorname', 'nachname'
    
    let filters = vnode.state.tags.map(
        t => t
            .trim()
            .split(':')
            .map(t => t.trim())
        )

    let firstName = undefined
    let secondName = undefined
    let idx = filters.findIndex(f => f[0] == 'vorname' || f[0] == 'v')
    if (idx > -1) {
        firstName = filters.splice(idx, 1)[0]
    }
    idx = filters.findIndex(f => f[0] == 'nachname' || f[0] == 'n')
    if (idx > -1) {
        secondName = filters.splice(idx, 1)[0]
    }

    if(firstName) {
        var options = {
            keys: ['0.first_name'],
            threshold: 0.00,
            tokenize: true,
        }
        var fuse = new Fuse(vnode.state.members, options)
        vnode.state.filteredMembers = fuse.search(firstName[1])
    } else {
        vnode.state.filteredMembers = vnode.state.members
    }

    if(secondName) {
        var options = {
            keys: ['0.last_name'],
            threshold: 0.00,
            tokenize: true,
        }
        var fuse = new Fuse(vnode.state.members, options)
        vnode.state.filteredMembers = fuse.search(secondName[1])
    } else {
        vnode.state.filteredMembers = vnode.state.filteredMembers
    }

    let len = filters.length
    vnode.state.filteredMembers = vnode.state.filteredMembers.map(m => {
        let count = filters
            .map(f => {
                if (f[0] == 'sektion' || f[0] == 's') {
                    if(f[1] == 'jujitsu' || f[1] == 'ju jitsu' || f[1] == 'jj') {
                        return m[0].section_jujitsu
                    }
                    if(f[1] == 'judo', f[1] == 'j') {
                        return m[0].section_judo
                    }
                    return true
                }

                if (f[0] == 'typ' || f[0] == 't') {
                    let tags = m[3]

                    if(f[1] == 'aktiv' || f[1] == 'a') {
                        return tags.filter(t => t == 'Active').length > 0
                    }
                    if(f[1] == 'passiv' || f[1] == 'p') {
                        return tags.filter(t => t == 'Passive').length > 0
                    }
                    if(f[1] == 'kind' || f[1] == 'k') {
                        return tags.filter(t => t == 'Kid').length > 0
                    }
                    if(f[1] == 'ausgetreten' || f[1] == 'r') {
                        return tags.filter(t => t == 'Resigned').length > 0
                    }
                    if(f[1] == 'extern' || f[1] == 'e') {
                        return tags.filter(t => t == 'Extern').length > 0
                    }
                    return true
                }
            })
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0)

        if(count == len) {
            return m
        }
        return undefined
    }).filter(m => m !== undefined)

    vnode.state.mails = vnode.state.filteredMembers.map(m => m[0].email).join(',')
}

import { TagInput, Tag, Icon, Icons, Intent, Size } from 'construct-ui'

var MembersList = {
    oninit: function(vnode) {
        vnode.state.q = ''
        vnode.state.kids = true
        vnode.state.judo = true
        vnode.state.jujitsu = true
        vnode.state.passive = true
        vnode.state.active = true
        vnode.state.resigned = true
        vnode.state.extern = true
        vnode.state.mails = ''
        vnode.state.tags = []

        m.request({
            method: 'GET',
            url: "/members/list_json",
        })
        .then(function(result) {
            vnode.state.members = result;
            filterMembers(vnode, vnode.state.q);
        })
    },
    view: function(vnode) {
        const isEmpty = this.tags.length === 0;
        return [
            m('div.col-9', m('form',
                m('.form-group', [
                    m('button.btn.btn-success[type=text]', {
                        onclick: (e) => {
                            e.preventDefault();
                            window.location = '/members/view/0'
                        }
                    }, [m('i.fas.fa-plus'), ' Neues Mitglied hinzufügen.'])
                ])
            )),
            m('div.col-3', m('p.text-right', [
                m('a[href=#]', {
                    onclick: e => {
                        e.preventDefault()
                        copyTextToClipboard(vnode.state.mails)
                    }
                }, 'Email-Liste kopieren ...'),
                m('br'),
                m('a', { href: 'mailto:' + vnode.state.mails }, 'Email an Liste schreiben ...'),
            ])),
            // 'section' ['judo', 'ju jitsu', 'jujitsu']
            // 'type' ['aktiv', 'passiv', 'kind' 'ausgetreten', 'extern']
            // 'vorname', 'nachname'
            m('div.col-12',
                m(
                    '',
                    [
                        'Filter sind einzugeben mit dem Format ', m('b', 'filter:wert'), '. Zum Beispiel ', m('b', 'sektion:jujitsu'), ' oder ', m('b', 's:jj'), '.',
                        m('br'),
                        'Mögliche Filter sind, wobei mögliche Werte in eckigen Klammern und Kürzel in runden Klammern sind:',
                        m('ul', [
                            m('li', 'sektion(s):[judo(j), jujitsu(jj)]'),
                            m('li', 'typ(t):[aktiv(a), passiv(p), kind(k), ausgetreten(r), extern(e)]'),
                            m('li', 'vorname(v)[beliebiger wert]'),
                            m('li', 'nachname(n)[beliebiger wert]'),
                        ])
                    ]
                )
            ),
            m('div.col-12', [
                m(TagInput, {
                    addOnBlur: this.addOnBlur,
                    tags: this.tags.map(tag => m(Tag, {
                        label: tag,
                        onRemove: () => this.removeTag(vnode, tag)
                    })),
                    disabled: false,
                    intent: Intent.DEFAULT,
                    size: Size.DEFAULT,
                    contentLeft: m(Icon, { name: Icons.SEARCH }),
                    contentRight: isEmpty ? '' : m(Icon, {
                        name: Icons.X,
                        onclick: v => this.clear(vnode, v)
                        }),
                    class: 'search-input',
                    onAdd: v => this.onAdd(vnode, v),
                }),
            ]),
            m('div.col-12', [
                m('table.table.table-hover.col-12', [
                    m('thead', m('tr', [
                            m('th', 'ID'),
                            m('th', 'Vorname'),
                            m('th', 'Nachname(n)'),
                            m('th', 'E-Mail'),
                            m('th', 'Geburtstag'),
                    ])),
                    m('tbody', [
                        vnode.state.filteredMembers ? vnode.state.filteredMembers.map(function(entry) {
                            let member = entry[0];
                            let events = entry[1];
                            
                            return [
                                m('tr', {
                                    onclick: function(e) {
                                        e.preventDefault();
                                        window.location = '/members/view/' + member.id;
                                    },
                                }, [
                                    m('td', member.id),
                                    m('td', member.first_name),
                                    m('td', member.last_name),
                                    m('td', member.email),
                                    m('td', member.birthday),
                                ]),
                            ]
                        }) : ''
                    ])
                ])
            ])
        ]
    },
    onAdd(vnode, value) {
        vnode.state.tags.push(value)
        filterMembers(vnode)
    },
    removeTag(vnode, tag) {
        const index = vnode.state.tags.indexOf(tag)
        vnode.state.tags.splice(index, 1)

        filterMembers(vnode)
    },
    clear(vnode){
        vnode.state.tags = []
        filterMembers(vnode)
    }
}

window.onload = function() {
    m.mount(document.getElementById('mount'), MembersList)
};