var filterMembers = function(vnode, input) {
    let filters =
        vnode.state.kids
     && vnode.state.judo
     && vnode.state.jujitsu
     && vnode.state.passive
     && vnode.state.active
     && vnode.state.resigned
     && vnode.state.extern

    if(input && input != '') {
        var options = {
            keys: ['0.first_name', '0.last_name', '0.email_1'],
            threshold: 0.00,
            tokenize: true,
        }
        var fuse = new Fuse(vnode.state.members, options)
        vnode.state.filteredMembers = fuse.search(input)
    } else {
        vnode.state.filteredMembers = vnode.state.members
    }

    vnode.state.filteredMembers = vnode.state.filteredMembers.map(m => {
        let tags = m[3]
        if(vnode.state.kids && tags.filter(t => t == 'Kid').length > 0) {
            return m
        }
        if(
            vnode.state.judo
            && tags.filter(t => t.Grade && (
                (t.Grade.Dan && t.Grade.Dan[0] == 'Judo')
            || (t.Grade.Kyu && t.Grade.Kyu[0] == 'Judo')
            )
        ).length > 0) {
            return m
        }
        if(
            vnode.state.jujitsu
            && tags.filter(t => t.Grade && (
                (t.Grade.Dan && t.Grade.Dan[0] == 'JuJitsu')
            || (t.Grade.Kyu && t.Grade.Kyu[0] == 'JuJitsu')
            )
        ).length > 0) {
            return m
        }
        if(vnode.state.extern && tags.filter(t => t == 'Extern').length > 0) {
            return m
        }
        return undefined
    }).filter(m => m !== undefined)

    vnode.state.filteredMembers = vnode.state.filteredMembers.map(m => {
        let tags = m[3]
        if(vnode.state.active && tags.filter(t => t == 'Active').length > 0) {
            return m
        }
        if(vnode.state.passive && tags.filter(t => t == 'Passive').length > 0) {
            return m
        }
        if(vnode.state.resigned && tags.filter(t => t == 'Resigned').length > 0) {
            return m
        }
        if(vnode.state.extern && tags.filter(t => t == 'Extern').length > 0) {
            return m
        }
        return undefined
    }).filter(m => m !== undefined)
}

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
        return [
            m('div.col-12', m('form',
                m('.form-group', [
                    m('button.btn.btn-success[type=text]', {
                        onclick: (e) => {
                            e.preventDefault();
                            window.location = '/members/view/0'
                        }
                    }, [m('i.fas.fa-plus'), ' Neues Mitglied hinzufügen.'])
                ])
            )),
            m('div.col-12', m('',
                m('.form-group', [
                    m('input[type=text].form-control[placeholder="Suche nach Vor- oder Nachname"]', {
                        value: vnode.state.q,
                        oninput: function(e) {
                            vnode.state.q = e.target.value;
                            filterMembers(vnode, vnode.state.q);
                        }
                    })
                ])
            )),
            m('div.col-12',
                m('.row.form-group', [
                    m('.col-2', m('label[for=field-kids]', 'Kinder')),
                    m('.form-check.col-1', [
                        m('input[type=checkbox].form-check-input' + (vnode.state.kids ? '[checked]' : ''), {
                            placeholder: 'Kinder',
                            id: 'field-kids',
                            onchange: (e) => {
                                vnode.state.kids = !vnode.state.kids
                                filterMembers(vnode, vnode.state.q)
                            },
                        }),
                    ]),
                    m('.col-2', m('label[for=field-judo]', 'Judo')),
                    m('.form-check.col-1', [
                        m('input[type=checkbox].form-check-input' + (vnode.state.judo ? '[checked]' : ''), {
                            placeholder: 'Judo',
                            id: 'field-judo',
                            onchange: (e) => {
                                vnode.state.judo = !vnode.state.judo
                                filterMembers(vnode, vnode.state.q)
                            },
                        }),
                    ]),
                    m('.col-2', m('label[for=field-jujitsu]', 'Ju Jitsu')),
                    m('.form-check.col-1', [
                        m('input[type=checkbox].form-check-input' + (vnode.state.jujitsu ? '[checked]' : ''), {
                            placeholder: 'Ju Jitsu',
                            id: 'field-jujitsu',
                            onchange: (e) => {
                                vnode.state.jujitsu = !vnode.state.jujitsu
                                filterMembers(vnode, vnode.state.q)
                            },
                        }),
                    ]),
                    m('.col-2', m('label[for=field-resigned]', 'Extern')),
                    m('.form-check.col-1', [
                        m('input[type=checkbox].form-check-input', {
                            placeholder: 'Extern',
                            id: 'field-external',
                            checked: vnode.state.extern,
                            onchange: (e) => {
                                vnode.state.extern = !vnode.state.extern
                                filterMembers(vnode, vnode.state.q)
                            },
                        }),
                    ])
                ]),
                m('.row.form-group', [
                    m('.col-2', m('label[for=field-active]', 'Aktiv')),
                    m('.form-check.col-1', [
                        m('input[type=checkbox].form-check-input' + (vnode.state.active ? '[checked]' : ''), {
                            placeholder: 'Aktiv',
                            id: 'field-active',
                            onchange: (e) => {
                                vnode.state.active = !vnode.state.active
                                filterMembers(vnode, vnode.state.q)
                            },
                        }),
                    ]),
                    m('.col-2', m('label[for=field-passive]', 'Passiv')),
                    m('.form-check.col-1', [
                        m('input[type=checkbox].form-check-input' + (vnode.state.passive ? '[checked]' : ''), {
                            placeholder: 'Passiv',
                            id: 'field-passive',
                            onchange: (e) => {
                                vnode.state.passive = !vnode.state.passive
                                filterMembers(vnode, vnode.state.q)
                            },
                        }),
                    ]),
                    m('.col-2', m('label[for=field-resigned]', 'Ausgetreten')),
                    m('.form-check.col-1', [
                        m('input[type=checkbox].form-check-input' + (vnode.state.resigned ? '[checked]' : ''), {
                            placeholder: 'Ausgetreten',
                            id: 'field-resigned',
                            onchange: (e) => {
                                vnode.state.resigned = !vnode.state.resigned
                                filterMembers(vnode, vnode.state.q)
                            },
                        }),
                    ]),
                    m('.col-2', m('label[for=field-resigned]', 'Extern')),
                    m('.form-check.col-1', [
                        m('input[type=checkbox].form-check-input', {
                            placeholder: 'Extern',
                            id: 'field-external2',
                            checked: vnode.state.extern,
                            onchange: (e) => {
                                vnode.state.extern = !vnode.state.extern
                                filterMembers(vnode, vnode.state.q)
                            },
                        }),
                    ])
                ])
            ),
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
    }
}

window.onload = function() {
    m.mount(document.getElementById('mount'), MembersList)
};