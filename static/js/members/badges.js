function belt_color(number) {
    switch(number) {
        case '5': return 'yellow'
        case '4': return 'orange'
        case '3': return 'green'
        case '2': return 'blue'
        case '1': return 'brown'
        default: return 'black'
    }
}

function member_type(member) {
    switch(member) {
        case 'Active': return 'Aktiv'
        case 'Passive': return 'Passiv'
        case 'Parent': return 'Vormund'
        case 'Honorary': return 'Ehrenmitglied'
        case 'Student': return 'Student'
        case 'Kid': return 'Kind'
    }
}

var Badges = {
    oninit: function(vnode) {
        vnode.state.events = vnode.attrs.events;
        vnode.state.member = vnode.attrs.member;
    },
    onbeforeupdate: function(vnode) {
        vnode.state.events = vnode.attrs.events;
        vnode.state.member = vnode.attrs.member;
    },
    view: function(vnode) {
        let member = vnode.state.member;
        let events = vnode.state.events;

        let badges = []

        let honorary_badge = false;
        let current_grade = []
        current_grade['Judo'] = false
        current_grade['Jujitsu'] = false
        let club_events = []
        let board_events = []
        let trainer_events = []
        let cotrainer_events = []

        events.forEach(function(event) {
            // Find club events.
            if (event.event_type == 'Club' && event.division == 'Club') {
                club_events.push(event)
            }

            // Find all kyus.
            if ((event.event_type.includes('Kyu') || event.event_type.includes('Dan')) && event.class == 'Promotion') {
                let grade_num = event.event_type.substring(event.event_type.length - 1)
                let grade = grade_num
                          + '. '
                          + event.event_type.substring(0, event.event_type.length - 1);

                current_grade[event.division] = { color: belt_color(event.event_type.includes('Dan') ? 0 : grade_num), grade, date: event.date };
            }

            // Check if honorary member.
            if (event.event_type == 'Honorary' && event.division == 'Club' && event.class == 'Promotion') {
                honorary_badge = true;
            }

            // Get board member events.
            if(event.event_type == 'Board') {
                board_events.push(event)
            }

            // Get trainer events.
            if(event.event_type == 'Trainer') {
                trainer_events.push(event)
            }

            // Get co trainer events.
            if(event.event_type == 'CoTrainer') {
                cotrainer_events.push(event)
            }
        });

        // Check member status (resigned, active, kid, student, etc.)
        club_events.sort((a, b) => new Date(b.date) - new Date(a.date))
        if(club_events.length > 0) {
            let last = club_events[0]
            if(last.class == 'Demotion') {
                badges.push({ type: 'danger', text: 'Ausgetreten am ' + last.date, class: 'Demotion' })
            } else {
                badges.push({ type: 'success', text: member_type(member.member_type) })
            }
        }

        // Get latest board promotional event.
        board_events.sort((a, b) => new Date(b.date) - new Date(a.date))
        if(board_events.length > 0 && board_events[0].class == 'Promotion') {
            badges.push({ type: 'warning', text: 'Vorstand' })
        }
        
        // Get latest trainer promotional event.
        trainer_events.sort((a, b) => new Date(b.date) - new Date(a.date))
        if(trainer_events.length > 0 && trainer_events[0].class == 'Promotion') {
            badges.push({ type: 'primary', text: 'Trainer' })
        }

        // Get latest cotrainer promotional event.
        cotrainer_events.sort((a, b) => new Date(b.date) - new Date(a.date))
        if(cotrainer_events.length > 0 && cotrainer_events[0].class == 'Promotion') {
            badges.push({ type: 'info', text: 'Co-Trainer' })
        }

        // Get current judo belt.
        if(current_grade['Judo']) {
            badges.push({ type: 'belt-' + current_grade['Judo'].color, text: current_grade['Judo'].grade + ' Judo' })
        }

        // Get current jujitsu belt.
        if(current_grade['Jujitsu']) {
            badges.push({ type: 'belt-' + current_grade['Jujitsu'].color, text: current_grade['Jujitsu'].grade + ' Jujitsu' })
        }

        // Get honorary member status.
        if(honorary_badge) {
            badges.push({ type: 'light', text: 'Ehrenmitglied' })
        }

        return m('.row', m('.col', [
            m('h3', 'Status'),
            m('h3', m('', badges.map(function(badge) {
                return m('span.badge.badge-pill.badge-' + badge.type , badge.text)
            }))),
        ]))
    }
}