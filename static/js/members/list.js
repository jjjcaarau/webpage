window.onload = function() {
    var filterMembers = function(vnode, input) {
        if(input && input != '') {
            var options = {
                keys: ['first_name', 'last_name', 'email_1'],
                threshold: 0.00,
                tokenize: true,
            };
            var fuse = new Fuse(vnode.state.members, options);
            vnode.state.filteredMembers = fuse.search(input);
        } else {
            vnode.state.filteredMembers = vnode.state.members;
        }
    }

    var updateMember = function(member) {
        var data = new FormData(document.getElementById('update-member'));
        data.append('id', member.id);
        m.request({
            method: 'POST',
            url: '/members/update',
            data: data,
        })
        .then(function(result) {
            console.log('success');
        })
    }

    var q = '';

    var MemberDetails = {
        oninit: function(vnode) {
            vnode.state.member = vnode.attrs.member;
        },
        view: function(vnode) {
            var member = vnode.state.member;
            return [
                m('div.col-12', m('form#update-member',
                    m('.form-row', [
                        m('.col', [
                            m('label', 'First name'),
                            m('input[type="text"].form-control[placeholder="First name"]', { value: member.first_name })
                        ]),
                        m('.col', [
                            m('label', 'Middle name'),
                            m('input[type="text"].form-control[placeholder="Middle name"]', { value: member.middle_name })
                        ]),
                        m('.col', [
                            m('label', 'Last name'),
                            m('input[type="text"].form-control[placeholder="Last name"]', { value: member.last_name })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'Sex'),
                            m('input[type="text"].form-control[placeholder="Sex"]', { value: member.sex })
                        ]),
                        m('.col', [
                            m('label', 'Birthday'),
                            m('input[type="text"].form-control[placeholder="Birthday"]', { value: member.birthday })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'Email'),
                            m('input[type="text"].form-control[placeholder="Email"]', { value: member.email })
                        ]),
                        m('.col', [
                            m('label', 'Phone'),
                            m('input[type="text"].form-control[placeholder="Phone"]', { value: member.phone })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'Address'),
                            m('input[type="text"].form-control[placeholder="Address"]', { value: member.street })
                        ]),
                        m('.col', [
                            m('label', 'Address No'),
                            m('input[type="text"].form-control[placeholder="Address No"]', { value: member.street_nr })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'PLZ'),
                            m('input[type="text"].form-control[placeholder="PLZ"]', { value: member.zip_code })
                        ]),
                        m('.col', [
                            m('label', 'City'),
                            m('input[type="text"].form-control[placeholder="City"]', { value: member.city })
                        ]),
                    ]),
                    m('button[type="submit"].btn.btn-primary', {
                        onclick: function(e) {
                            e.preventDefault();

                            updateMember(member);
                        }
                    }, 'Save'),
                ))
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
                        m('input[type=text].form-control[placeholder="Search"]', {
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
                                }, [
                                    m('td[colspan=4]', 'Add new member'),
                                ]),
                                vnode.state.selected == 0 ? m('tr', [
                                    m('td[colspan=4]', m(MemberDetails, { member: { id: 0 } })),
                                ]) : '',
                            ],
                            vnode.state.filteredMembers ? vnode.state.filteredMembers.map(function(member) {
                                return [
                                    m('tr', {
                                        onclick: function() {
                                            vnode.state.selected = member.id;
                                        },
                                    }, [
                                        m('td', member.first_name),
                                        m('td', member.last_name),
                                        m('td', member.email_1),
                                        m('td', member.birthday),
                                    ]),
                                    vnode.state.selected == member.id ? m('tr', [
                                        m('td[colspan=4]', m(MemberDetails, { member: member })),
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