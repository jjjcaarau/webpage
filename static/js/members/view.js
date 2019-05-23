window.onload = function() {
    var MemberView = {
        oninit: function(vnode) {
            vnode.state.member = {};
            vnode.state.events = [];
            vnode.state.family = [];
            let params = window.location.href.split('/');
            let param = params[params.length - 1];
            vnode.state.id = param;

            m.request({
                method: 'GET',
                url: "/members/view_json/" + vnode.state.id,
            })
            .then(function(result) {
                vnode.state.member = result.member[0];
                vnode.state.events = result.member[1];
                vnode.state.family = result.member[2];
            })
        },
        view: function(vnode) {
            let member = vnode.state.member;
            let events = vnode.state.events;
            let family = vnode.state.family;
            console.log(family)
            return [
                m('div.col-12', m('form#update-member',
                m('button[type="back"].btn.btn-primary', {
                    onclick: function(e) {
                        e.preventDefault();
                        window.location='/members/list';
                    }
                }, 'Zurück'),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'Vorname'),
                            m('input[type="text"][name=first_name].form-control[placeholder="First name"]', { value: member.first_name })
                        ]),
                        m('.col', [
                            m('label', 'Zweitname(n)'),
                            m('input[type="text"][name=middle_name].form-control[placeholder="Middle name"]', { value: member.middle_name })
                        ]),
                        m('.col', [
                            m('label', 'Nachname(n)'),
                            m('input[type="text"][name=last_name].form-control[placeholder="Last name"]', { value: member.last_name })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'Geschlecht'),
                            m('input[type="text"][name=sex].form-control[placeholder="Sex"]', { value: member.sex })
                        ]),
                        m('.col', [
                            m('label', 'Geburtstag'),
                            m('input[type="text"][name=birthday].form-control[placeholder="Birthday"]', { value: member.birthday })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'E-Mail'),
                            m('input[type="text"][name=email].form-control[placeholder="Email"]', { value: member.email })
                        ]),
                        m('.col', [
                            m('label', 'Telefon'),
                            m('input[type="text"][name=phone_p].form-control[placeholder="Phone"]', { value: member.phone_p })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'Strasse'),
                            m('input[type="text"][name=address].form-control[placeholder="Address"]', { value: member.address })
                        ]),
                        m('.col', [
                            m('label', 'Hausnummer'),
                            m('input[type="text"][name=address_no].form-control[placeholder="Address No"]', { value: member.address_no })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'PLZ'),
                            m('input[type="text"][name=postcode].form-control[placeholder="PLZ"]', { value: member.postcode })
                        ]),
                        m('.col', [
                            m('label', 'Ort'),
                            m('input[type="text"][name=city].form-control[placeholder="City"]', { value: member.city })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'Beschreibung'),
                            m('textarea[name=comment].form-control[placeholder="Comment"]', { value: member.comment })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('button[type="submit"].btn.btn-primary', {
                                onclick: function(e) {
                                    e.preventDefault();

                                    updateMember(member);
                                }
                            }, 'Save'),
                        ]),
                    ]),
                    m('.form-row', [
                        m('div.col-12', [
                            m('table.table.table-hover.col-12', [
                                m('thead', m('tr', [
                                        m('th', 'ID'),
                                        m('th', 'First Name'),
                                        m('th', 'Last Name'),
                                        m('th', 'Email'),
                                        m('th', 'Birthday'),
                                ])),
                                m('tbody', [
                                    [
                                        m('tr', {
                                            onclick: function() {
                                                vnode.state.selected = 0;
                                            },
                                        }, //[
                                        //    m('td[colspan=4]', 'Add new member'),
                                        //]),
                                        ),
                                        vnode.state.selected == 0 ? m('tr', [
                                            m('td[colspan=4]', m(MemberDetails, { member: { id: 0 }, events: [] })),
                                        ]) : '',
                                    ],
                                    family ? family.map(function(member) {
                                        return [
                                            m('tr', {
                                                onclick: function() {
                                                    if (vnode.state.selected != member.id) {
                                                        vnode.state.selected = member.id;
                                                    } else {
                                                        vnode.state.selected = undefined;
                                                    }
                                                },
                                            }, [
                                                m('td', member.id),
                                                m('td', member.first_name),
                                                m('td', member.last_name),
                                                m('td', member.email),
                                                m('td', member.birthday),
                                            ]),
                                            vnode.state.selected == member.id ? m('tr', [
                                                m('td[colspan=4]', m(MemberDetails, { member: member, events: events })),
                                            ]) : '',
                                        ]
                                    }) : ''
                                ])
                            ])
                        ])
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('.badge.badge-pill.badge-primary', ''),
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m(MemberEvents, { events: events })
                        ]),
                    ]),
                ))
            ]
        }
    }
    
    m.mount(document.getElementById('mount'), MemberView)
}