var Badges = {
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

        let left_badge = undefined;
        let joined_badge = undefined;
        let current_grade = []
        current_grade['Judo'] = false
        current_grade['Jujitsu'] = false

        events.forEach(function(event) {
            if (event.event_type == 'Club' && event.division == 'Club' && event.class == 'Demotion') {
                left_badge = { type: 'danger', text: 'Ausgetreten am ' + event.date };
            }

            if (event.event_type == 'Club' && event.division == 'Club' && event.class == 'Promotion') {
                joined_badge = { type: 'success', text: 'Beigetreten am ' + event.date };
            }

            if ((event.event_type.includes('Kyu') || event.event_type.includes('Dan')) && event.class == 'Promotion') {
                let grade = event.event_type.substring(event.event_type.length - 1)
                          + '. '
                          + event.event_type.substring(0, event.event_type.length - 1);

                current_grade[event.division] = { grade, date: event.date };
            }
        });

        if(left_badge) {
            badges.push(left_badge);
        } else if(joined_badge) {
            badges.push(joined_badge);
        }

        if(current_grade['Judo']) {
            badges.push({ type: 'success', text: current_grade['Judo'].grade + ' Judo' })
        }
        if(current_grade['Jujitsu']) {
            badges.push({ type: 'success', text: current_grade['Jujitsu'].grade + ' Jujitsu' })
        }

        return [
            m('h3', m('', badges.map(function(badge) {
                return m('span.badge.badge-pill.badge-' + badge.type , badge.text)
            }))),
        ]
    }
}