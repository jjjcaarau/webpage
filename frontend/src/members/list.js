window.onload = function() {
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

    var q = '';

    var MemberDetails = {
        oninit: function(vnode) {
            vnode.state.member = vnode.attrs.member;
            vnode.state.events = vnode.attrs.events;
        },
        view: function(vnode) {
            let member = vnode.state.member;
            let events = vnode.state.events;
            return [
                m('div.col-12', m('form#update-member',
                    m('.form-row', [
                        m('.col', [
                            console.log(member.birthday),
                            (member.birthday != '1970-01-01') ? m('label', member.first_name + ' ' + member.middle_name + ' ' + member.last_name + ', ' + member.birthday) : m('label', member.first_name + ' ' + member.middle_name + ' ' + member.last_name),
                            //m('input[type="text"][name=first_name].form-control[placeholder="First name"]', { value: member.first_name })
                        ]),
                        /* m('.col', [
                            m('label', member.middle_name),
                            //m('input[type="text"][name=middle_name].form-control[placeholder="Middle name"]', { value: member.middle_name })
                        ]),
                        m('.col', [
                            m('label', member.last_name),
                            //m('input[type="text"][name=last_name].form-control[placeholder="Last name"]', { value: member.last_name })
                        ]),
                        m('.col', [
                            m('label', member.birthday),
                            //m('input[type="text"][name=birthday].form-control[placeholder="Birthday"]', { value: member.birthday })
                        ]), */
                    ]),
                    m('.form-row', [
                        /* m('.col', [
                            m('label', 'Sex'),
                            m('input[type="text"][name=sex].form-control[placeholder="Sex"]', { value: member.sex })
                        ]),
                        m('.col', [
                            m('label', member.birthday),
                            //m('input[type="text"][name=birthday].form-control[placeholder="Birthday"]', { value: member.birthday })
                        ]), */
                    ]),
                    m('.form-row', [
                        m('.col', [
                            (member.postcode == '' && member.city == '' && member.address == '' && member.address_no == '') ? '' : m('label', member.postcode + ' ' + member.city + ', ' + member.address + ' ' + member.address_no),
                            //m('input[type="text"][name=address].form-control[placeholder="Address"]', { value: member.address })
                        ]),
                        /* m('.col', [
                            m('label', member.address_no),
                            //m('input[type="text"][name=address_no].form-control[placeholder="Address No"]', { value: member.address_no })
                        ]), */
                    ]),
                    m('.form-row', [
                        /*m('.col', [
                            m('label', member.postcode + ' ' + member.city),
                            //m('input[type="text"][name=postcode].form-control[placeholder="PLZ"]', { value: member.postcode })
                        ]),
                        m('.col', [
                            m('label', member.city),
                            //m('input[type="text"][name=city].form-control[placeholder="City"]', { value: member.city })
                        ]), */
                    ]),
                    m('.form-row', [
                        m('.col', [
                            (member.email != '' && member.phone_p != '') ? m('label', member.email + ' | ' + member.phone_p) : m('label', member.email + member.phone_p),
                            
                            //m('input[type="text"][name=email].form-control[placeholder="Email"]', { value: member.email })
                        ]),
                        /* m('.col', [
                            m('label', member.phone_p),
                            //m('input[type="text"][name=phone_p].form-control[placeholder="Phone"]', { value: member.phone_p })
                        ]), */
                    ]),
                    /*m('.form-row', [
                        m('.col', [
                            m('label', 'Comment'),
                            m('textarea[name=comment].form-control[placeholder="Comment"]', { value: member.comment })
                        ]),
                    ]), */
                    m('.form-row', [
                        m('.col', [
                            //m('button[type="submit"].btn.btn-primary', {
                            //    onclick: function(e) {
                            //        e.preventDefault();
                            //        updateMember(member);
                            //    }
                            //}, 'Save'),
                            m('button[type="view"].btn.btn-primary', {
                                onclick: function(e) {
                                    e.preventDefault();
                                    window.location='/members/view/' + member.id;
                                }
                            }, 'Details'),
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('.badge.badge-pill.badge-primary', ''),
                        ]),
                    ]),
                    /* m('.form-row', [
                        m('.col', [
                            m(MemberEvents, { events: events })
                        ]),
                    ]), */
                ))
            ]
        }
    }

    var MemberEvents = {
        oninit: function(vnode) {
            vnode.state.events = vnode.attrs.events;
        },
        view: function(vnode) {
            let member = vnode.state.member;
            let events = vnode.state.events;

            let badges = []

            let already_left = false
            let current_grade = []
            current_grade['Judo'] = false
            current_grade['Jujitsu'] = false

            events.forEach(function(event) {
                if (event.event_type == 'Club' && event.division == 'Club' && event.class == 'Demotion') {
                    badges.push({ type: 'danger', text: 'Left on ' + event.date })
                    already_left = true
                }

                if (!already_left && event.event_type == 'Club' && event.division == 'Club' && event.class == 'Promotion') {
                    badges.push({ type: 'success', text: 'Joined on ' + event.date })
                }

                if ((event.event_type.includes('Kyu') || event.event_type.includes('Dan')) && event.class == 'Promotion') {
                    let grade = event.event_type.substring(event.event_type.length - 1)
                              + '. '
                              + event.event_type.substring(0, event.event_type.length - 1);

                    current_grade[event.division] = { grade, date: event.date };
                }
            });

            if(current_grade['Judo']) {
                badges.push({ type: 'success', text: 'Promoted to ' + current_grade['Judo'].grade + ' on ' + current_grade['Judo'].date })
            }
            if(current_grade['Jujitsu']) {
                badges.push({ type: 'success', text: 'Promoted to ' + current_grade['Jujitsu'].grade + ' on ' + current_grade['Jujitsu'].date })
            }

            return [
                m('', badges.map(function(badge) {
                    return m('span.badge.badge-pill.badge-' + badge.type , badge.text)
                })),
                m('table.table.table-hover.col-12', [
                    m('thead', m('tr', [
                            m('th', 'Event'),
                            m('th', 'Division'),
                            m('th', 'Class'),
                            m('th', 'Date'),
                            m('th', 'Comment'),
                    ])),
                    m('tbody', [
                        [
                            m('tr', [
                                m('td[colspan=4]', 'Add new event'),
                            ]),
                        ],
                        events.slice(0).reverse().map(function(event) {
                            return [
                                m('tr', [
                                    m('td', event.event_type),
                                    m('td', event.division),
                                    m('td', event.class),
                                    m('td', event.date),
                                    m('td', event.comment),
                                ]),
                            ]
                        })
                    ])
                ])
            ]
        }
    }

    var MembersList = {
        oninit: function(vnode) {
            vnode.state.q = '';
            vnode.state.selected = undefined;

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
                            vnode.state.filteredMembers ? vnode.state.filteredMembers.map(function(entry) {
                                let member = entry[0];
                                let events = entry[1];
                                
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
            ]
        }
    }

    m.mount(document.getElementById('mount'), MembersList)
};