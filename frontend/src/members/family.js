import m from 'mithril'
import { Search } from './add_member'

export const Family = {
    oninit: function(vnode) {
        vnode.state.member = vnode.attrs.member;
        vnode.state.family = vnode.attrs.family;
        vnode.state.loading = false;

        vnode.state.members = []
        m.request({
            method: 'GET',
            url: "/members/list_json",
        })
        .then(function(result) {
            vnode.state.members = result
        })
    },
    onbeforeupdate: function(vnode) {
        vnode.state.member = vnode.attrs.member;
        vnode.state.family = vnode.attrs.family;
    },
    view: function(vnode) {
        let family = vnode.state.family;
        let member = vnode.state.member;

        return m('.row', m('.col', [
            m('h3', 'Familie'),
            family && family.length > 0
                ? m('table.table.table-hover.col-12', [
                m('thead', m('tr', [
                    m('th', 'First Name'),
                    m('th', 'Last Name'),
                    m('th', 'Email'),
                    member.id == member.family_id ? m('th', '') : '',
                ])),
                m('tbody', family.map(function(f) {
                    return m('tr.family-row', {
                        onclick: () => {
                            if(!vnode.state.loading) { window.location = '/members/view/' + f.id }
                        }
                    }, [
                        m('td', f.id == f.family_id ? m('span.badge.badge-warning', f.first_name) : f.first_name),
                        m('td', f.last_name),
                        m('td', f.email),
                        member.id == member.family_id ? m('td', m('button.form-control.btn.btn-danger[type=text]', {
                            onclick: () => {
                                vnode.state.loading = true
                                console.log(f.id)
                                m.request({
                                    method: 'POST',
                                    url: '/members/update_family_json',
                                    data: {
                                        member_id: f.id,
                                        family_id: undefined,
                                    },
                                })
                                //.then(() => location.reload())
                                .catch(() => vnode.state.loading = false)
                            }
                        }, 'Unlink')) : '',
                    ])
                }))
            ])
            : 'Keine bekannten Familienmitglieder',
            m(Search, { member: vnode.state.member, family, members: vnode.state.members }),
        ]))
    }
}