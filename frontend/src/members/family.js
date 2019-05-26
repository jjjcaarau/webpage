import m from 'mithril'
import { AddMember } from './add_member'
import { isPrincipal } from './helpers'

/// A component to display the entire family of a member.
///
/// Attrs: { member: Member, family: [Member] }
export const Family = {
    oninit: vnode => {
        vnode.state.member = vnode.attrs.member;
        vnode.state.family = vnode.attrs.family;

        // Needed so the onclick event on the 'Unlink' button does not also trigger a forward to the unlinked member page.
        vnode.state.loading = false;

        vnode.state.members = []
        m.request({
            method: 'GET',
            url: "/members/list_json",
        })
        .then(result => vnode.state.members = result)
    },
    onbeforeupdate: vnode => {
        vnode.state.member = vnode.attrs.member;
        vnode.state.family = vnode.attrs.family;
    },
    view: vnode => {
        let family = vnode.state.family;
        let member = vnode.state.member;

        return m('.row', m('.col', [
            m('h3', 'Familie'),
            family && family.length > 0
                ? m('table.table.table-hover.col-12', [
                m('thead', m('tr', [
                    m('th', 'Vorname'),
                    m('th', 'Nachname'),
                    m('th', 'Email'),
                ])),
                m('tbody', family.map(function(f) {
                    return m('tr.family-row', {
                        onclick: () => {
                            if(!vnode.state.loading) { window.location = '/members/view/' + f.id }
                        }
                    }, [
                        m('td', isPrincipal(f) ? m('span.badge.badge-warning', f.first_name) : f.first_name),
                        m('td', f.last_name),
                        m('td', f.email),
                        m('td', m('button.btn.btn-danger[type=text]', {
                            onclick: () => {
                                vnode.state.loading = true
                                m.request({
                                    method: 'POST',
                                    url: '/members/update_family_json',
                                    data: {
                                        member_id: f.id,
                                        family_id: undefined,
                                    },
                                })
                                .then(() => location.reload())
                                .catch(() => vnode.state.loading = false)
                            }
                        }, m('i.fas.fa-unlink'))),
                    ])
                }))
            ])
            : 'Keine bekannten Familienmitglieder',

            m(AddMember, { member: vnode.state.member, family, members: vnode.state.members }),
        ]))
    }
}