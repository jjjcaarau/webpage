import m from 'mithril'

function belt_color(number) {
    switch(number) {
        case 5: return 'yellow'
        case 4: return 'orange'
        case 3: return 'green'
        case 2: return 'blue'
        case 1: return 'brown'
        default: return 'black'
    }
}

function member_type(member) {
    switch(member) {
        case 'Active': return 'Aktiv'
        case 'Passive': return 'Passiv'
        case 'Parent': return 'Vormund'
        case 'Student': return 'Student'
        case 'Kid': return 'Kind'
    }
}

export const Badges = {
    oninit: function(vnode) {
        vnode.state.events = vnode.attrs.events;
        vnode.state.member = vnode.attrs.member;
        vnode.state.tags = vnode.attrs.tags;
    },
    onbeforeupdate: function(vnode) {
        vnode.state.events = vnode.attrs.events;
        vnode.state.member = vnode.attrs.member;
        vnode.state.tags = vnode.attrs.tags;
    },
    view: function(vnode) {
        let member = vnode.state.member;
        let events = vnode.state.events;
        let tags = vnode.state.tags;

        let badges = []

        console.log(tags);
        // Trainer(Division),
        // CoTrainer(Division),
        // Grade(Grade),

        tags.forEach(tag => {
            switch(tag) {
                case 'Active':
                    badges.push({ type: 'success', text: 'Aktiv' })
                    break
                case 'Resigned':
                    badges.push({ type: 'danger', text: 'Ausgetreten' })
                    break
                case 'Passive':
                    badges.push({ type: 'success', text: 'Passiv' })
                    break
                case 'Student':
                    badges.push({ type: 'success', text: 'Passiv' })
                    break
                case 'Parent':
                    badges.push({ type: 'success', text: 'Passiv' })
                    break
                case 'Kid':
                    badges.push({ type: 'success', text: 'Passiv' })
                    break
                case 'Honorary':
                    badges.push({ type: 'light', text: 'Ehrenmitglied' })
                    break
                case 'Board':
                    badges.push({ type: 'warning', text: 'Vorstand' })
                    break
            }
            if(tag.Trainer) {
                badges.push({ type: 'primary', text: 'Trainer' })
            }
            if(tag.CoTrainer) {
                badges.push({ type: 'info', text: 'Co-Trainer' })
            }
            if(tag.Grade) {
                if(tag.Grade.Dan) {
                    badges.push({ type: 'belt-black', text: tag.Grade.Dan[1] + '. Dan ' + tag.Grade.Dan[0] })
                }
                if(tag.Grade.Kyu) {
                    badges.push({ type: 'belt-' + belt_color(tag.Grade.Kyu[1]), text: tag.Grade.Kyu[1] + '. Kyu ' + tag.Grade.Kyu[0] })
                }
            }
        })

        // PMatriarch
        if(member.id == member.family_id) {
            badges.push({ type: 'warning', text: 'Familienoberhaupt' })
        }

        return m('.row', m('.col', [
            m('h3', 'Status'),
            m('h3', m('', badges.map(function(badge) {
                return m('span.badge.badge-pill.badge-' + badge.type , badge.text)
            }))),
        ]))
    }
}