import m from 'mithril'

var filterMembers = function(vnode, input) {
    if(input && input != '') {
        var options = {
            keys: ['0.first_name', '0.last_name'],
            threshold: 0.00,
            tokenize: true,
        };
        var fuse = new Fuse(vnode.state.members, options);
        vnode.state.filteredMembers = fuse
            .search(input)
            .filter(m =>
                vnode.attrs.member.id != m[0].id
             && !vnode.attrs.family.some(m2 => m2.id == m[0].id))
            .slice(0, 10);
    } else {
        vnode.state.filteredMembers = [];
    }
}

export const Search = {
    oninit: vnode => {
        vnode.state.error = ''
        vnode.state.members = vnode.attrs.members
        filterMembers(vnode, vnode.state.q)
        vnode.state.q = ''
    },
    onbeforeupdate: vnode => {
        vnode.state.members = vnode.attrs.members
        filterMembers(vnode, vnode.state.q)
    },
    view: vnode => {
        return vnode.attrs.member.member_type == 'Active' ? [
            m('.row.form-group', [
                m('input[type=text].form-control.col-12[placeholder=Name]', {
                    value: vnode.state.q,
                    oninput: (e) => {
                        vnode.state.q = e.target.value
                        filterMembers(vnode, vnode.state.q)
                    },
                }),
                m('ul.list-group.col-12', vnode.state.filteredMembers ? vnode.state.filteredMembers.map(member =>
                    m('li.list-group-item.member-search-item', {
                        onclick: e => {
                            let pmatriarch = vnode.attrs.family.filter(m => m.id == m.family_id)[0]
                            m.request({
                                method: 'POST',
                                url: '/members/update_family_json',
                                data: {
                                    member_id: member[0].id,
                                    family_id: pmatriarch ? pmatriarch.id : vnode.attrs.member.id,
                                },
                            })
                            .catch(e => {
                                vnode.state.error = 'Ein Fehler beim Hinzufügen ist aufgetreten.'
                            })
                            if(!pmatriarch) {
                                setTimeout(() => m.request({
                                    method: 'POST',
                                    url: '/members/update_family_json',
                                    data: {
                                        member_id: vnode.attrs.member.id,
                                        family_id: vnode.attrs.member.id, 
                                    },
                                })
                                .then(() => document.reload())
                                .catch(e => {
                                    vnode.state.error = 'Ein Fehler beim Hinzufügen ist aufgetreten.'
                                }), 500)
                            } else {
                                location.reload()
                            }
                        }
                    }, member[0].first_name + ' ' + member[0].last_name)
                ) : []),
                m('.col-12', m('span.text-danger', vnode.state.error))
            ])
        ] : ''
    }
}