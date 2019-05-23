var MemberEvents = {
    oninit: function(vnode) {
        vnode.state.events = vnode.attrs.events;
    },
    onbeforeupdate: function(vnode) {
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
            m(Badges, { events }),
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