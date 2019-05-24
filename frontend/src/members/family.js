import m from 'mithril'

export const Family = {
    oninit: function(vnode) {
        vnode.state.member = vnode.attrs.member;
        vnode.state.family = vnode.attrs.family;
    },
    onbeforeupdate: function(vnode) {
        vnode.state.member = vnode.attrs.member;
        vnode.state.family = vnode.attrs.family;
    },
    view: function(vnode) {
        let family = vnode.state.family;

        return m('.row', m('.col', [
            m('h3', 'Familie'),
            family && family.length > 0 ? family.map(function(member) {
                return m('table.table.table-hover.col-12', [
                    m('thead', m('tr', [
                        m('th', 'ID'),
                        m('th', 'First Name'),
                        m('th', 'Last Name'),
                        m('th', 'Email'),
                        m('th', 'Birthday'),
                    ])),
                    m('tbody', [
                        m('tr.family-row', {
                            onclick: () => window.location = '/members/view/' + member.id
                        }, [
                            m('td', member.id),
                            m('td', member.first_name),
                            m('td', member.last_name),
                            m('td', member.email),
                            m('td', member.birthday),
                        ]),
                    ])
                ])
            }) : 'Keine bekannten Familienmitglieder'
        ]))
    }
}