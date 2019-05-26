var filterMembers = function(vnode, input) {
    if(input && input != '') {
        var options = {
            keys: ['0.first_name', '0.last_name', '0.email_1'],
            threshold: 0.00,
            tokenize: true,
        };
        var fuse = new Fuse(vnode.state.members, options);
        vnode.state.filteredMembers = fuse.search(input);
    } else {
        vnode.state.filteredMembers = vnode.state.members;
    }
}

var MembersList = {
    oninit: function(vnode) {
        vnode.state.q = '';

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
                    m('input[type=text].form-control[placeholder="Suche nach Vor- oder Nachname"]', {
                        value: vnode.state.q,
                        oninput: function(e) {
                            vnode.state.q = e.target.value;
                            filterMembers(vnode, vnode.state.q);
                        }
                    })
                ])
            )),
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