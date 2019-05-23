var Family = {
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

        return family ? family.map(function(member) {
            return [
                m('tr.family-row', {
                    onclick: () => window.location = '/members/view/' + member.id
                }, [
                    m('td', member.id),
                    m('td', member.first_name),
                    m('td', member.last_name),
                    m('td', member.email),
                    m('td', member.birthday),
                ]),
            ]
        }) : ''
    }
}