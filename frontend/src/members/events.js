import m from 'mithril'

function event_string(event) {
    switch(event.event_type) {
        case 'Trainer': {
            switch(event.class) {
                case 'Promotion': return 'Beförderung zum Trainer (' + event.division + ')'
                case 'Demotion': return 'Rücktritt vom Traineramt (' + event.division + ')'
            }
        }
        case 'CoTrainer': {
            switch(event.class) {
                case 'Promotion': return 'Beförderung zum Co-Trainer(' + event.division + ')'
                case 'Demotion': return 'Rücktritt vom Co-Traineramt (' + event.division + ')'
            }
        }
        case 'Club': {
            switch(event.class) {
                case 'Promotion': return 'Clubeintritt'
                case 'Demotion': return 'Clubaustritt'
            }
        }
        case 'Board': {
            switch(event.class) {
                case 'Promotion': return 'Wahl zum Vorstand'
                case 'Demotion': return 'Rücktritt aus dem Vorstand'
            }
        }
        case 'Honorary': {

        }
        case 'Kyu1': return 'Erhalt 1. Kyu ' + event.division
        case 'Kyu2': return 'Erhalt 2. Kyu ' + event.division
        case 'Kyu3': return 'Erhalt 3. Kyu ' + event.division
        case 'Kyu4': return 'Erhalt 4. Kyu ' + event.division
        case 'Kyu5': return 'Erhalt 5. Kyu ' + event.division
        case 'Dan1': return 'Erhalt 1. Dan ' + event.division
        case 'Dan2': return 'Erhalt 2. Dan ' + event.division
        case 'Dan3': return 'Erhalt 3. Dan ' + event.division
        case 'Dan4': return 'Erhalt 4. Dan ' + event.division
        case 'Dan5': return 'Erhalt 5. Dan ' + event.division
        case 'Dan6': return 'Erhalt 6. Dan ' + event.division
        case 'Dan7': return 'Erhalt 7. Dan ' + event.division
        case 'Dan8': return 'Erhalt 8. Dan ' + event.division
        case 'Dan9': return 'Erhalt 9. Dan ' + event.division
        case 'Dan10': return 'Erhalt 10. Dan ' + event.division
        default: return 'Unbekanntes Ereignis'
    }
}

function event_type_string(event) {
    switch(event) {
        case 'Trainer': return 'Trainer'
        case 'CoTrainer': return 'Co-Trainer'
        case 'Board': return 'Vorstand'
        case 'Honorary': return 'Ehrenmitglied'
        case 'Kyu': return 'Gurtprüfung'
    }
}

let event_types = [
    'Trainer',
    'CoTrainer',
    'Board',
    'Honorary',
    'Kyu',
]

function get_today() {
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0')
    var mm = String(today.getMonth() + 1).padStart(2, '0')
    var yyyy = today.getFullYear()

    today = yyyy + '-' + mm + '-' + dd
    return today
}

var TrainerEventAdd = {
    oninit: function(vnode) {
        vnode.attrs.transmitter.add = () => {
            m.request({
                method: 'POST',
                url: "/events/create_json",
                data: {
                    member_id: vnode.state.member.id,
                    event_type: vnode.state.type,
                    class: vnode.state.class,
                    division: vnode.state.division,
                    comment: vnode.state.comment,
                    date: get_today(),
                }
            })
        }
        vnode.state.class = 'Promotion'
        vnode.state.division = 'Jujitsu'
        vnode.state.comment = ''
        vnode.state.member = vnode.attrs.member;
    },
    onbeforeupdate: function(vnode) {
        vnode.state.member = vnode.attrs.member;
        vnode.state.type = vnode.attrs.type;
    },
    view: function(vnode) {
        return [
            m('select.form-control', {
                onchange: e => vnode.state.class = e.target.value,
                value: vnode.state.class,
            }, [
                m('option[value=Promotion]', 'Beförderung'),
                m('option[value=Demotion]', 'Rücktritt'),
            ]),
            m('select.form-control', {
                onchange: e => vnode.state.division = e.target.value,
                value: vnode.state.division,
            }, [
                m('option[value=Jujitsu]', 'Ju Jitsu'),
                m('option[value=Judo]', 'Judo'),
            ]),
            m('input.form-control[type=text][placeholder=Kommentar]', {
                onchange: e => vnode.state.comment = e.target.value,
                value: vnode.state.comment,
            }),
        ]
    }
}

var BoardEventAdd = {
    oninit: function(vnode) {
        vnode.attrs.transmitter.add = () => {
            m.request({
                method: 'POST',
                url: "/events/create_json",
                data: {
                    member_id: vnode.state.member.id,
                    event_type: 'Board',
                    class: vnode.state.class,
                    division: 'Club',
                    comment: vnode.state.comment,
                    date: get_today(),
                }
            })
        }
        vnode.state.class = 'Promotion'
        vnode.state.comment = ''
        vnode.state.member = vnode.attrs.member;
    },
    onbeforeupdate: function(vnode) {
        vnode.state.member = vnode.attrs.member;
    },
    view: function(vnode) {
        return [
            m('select.form-control', {
                onchange: e => vnode.state.class = e.target.value,
                value: vnode.state.class,
            }, [
                m('option[value=Promotion]', 'Wahl'),
                m('option[value=Demotion]', 'Rücktritt'),
            ]),
            m('input.form-control[type=text][placeholder=Kommentar]', {
                onchange: e => vnode.state.comment = e.target.value,
                value: vnode.state.comment,
            }),
        ]
    }
}

var HonoraryEventAdd = {
    oninit: function(vnode) {
        vnode.attrs.transmitter.add = () => {
            m.request({
                method: 'POST',
                url: "/events/create_json",
                data: {
                    member_id: vnode.state.member.id,
                    event_type: 'Honorary',
                    class: 'Promotion',
                    division: 'Club',
                    comment: vnode.state.comment,
                    date: get_today(),
                }
            })
        }
        vnode.state.comment = ''
        vnode.state.member = vnode.attrs.member;
    },
    onbeforeupdate: function(vnode) {
        vnode.state.member = vnode.attrs.member;
    },
    view: function(vnode) {
        return [
            m('input.form-control[type=text][placeholder=Grund]', {
                onchange: e => vnode.state.comment = e.target.value,
                value: vnode.state.comment,
            }),
        ]
    }
}

var KyuEventAdd = {
    oninit: function(vnode) {
        vnode.attrs.transmitter.add = () => {
            m.request({
                method: 'POST',
                url: "/events/create_json",
                data: {
                    member_id: vnode.state.member.id,
                    event_type: vnode.state.grade,
                    class: 'Promotion',
                    division: vnode.state.division,
                    date: vnode.state.date,
                }
            })
        }
        vnode.state.date = get_today()
        vnode.state.division = 'Jujitsu'
        vnode.state.grade = 'Kyu5'
        vnode.state.member = vnode.attrs.member;
    },
    onbeforeupdate: function(vnode) {
        vnode.state.member = vnode.attrs.member;
    },
    view: function(vnode) {
        return [
            m('select.form-control', {
                onchange: e => vnode.state.division = e.target.value,
                value: vnode.state.division,
            }, [
                m('option[value=Jujitsu]', 'Ju Jitsu'),
                m('option[value=Judo]', 'Judo'),
            ]),
            m('select.form-control', {
                onchange: e => vnode.state.grade = e.target.value,
                value: vnode.state.grade,
            }, [
                m('option[value=Kyu1]', '1. Kyu'),
                m('option[value=Kyu2]', '2. Kyu'),
                m('option[value=Kyu3]', '3. Kyu'),
                m('option[value=Kyu4]', '4. Kyu'),
                m('option[value=Kyu5]', '5. Kyu'),
                m('option[value=Dan1]', '1. Dan'),
                m('option[value=Dan2]', '2. Dan'),
                m('option[value=Dan3]', '3. Dan'),
                m('option[value=Dan4]', '4. Dan'),
                m('option[value=Dan5]', '5. Dan'),
                m('option[value=Dan6]', '6. Dan'),
                m('option[value=Dan7]', '7. Dan'),
                m('option[value=Dan8]', '8. Dan'),
                m('option[value=Dan9]', '9. Dan'),
                m('option[value=Dan10]', '10. Dan'),
            ]),
            m('input.form-control[type=text][placeholder=Datum(YYYY-MM-DD)][pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"].', {
                onchange: e => vnode.state.date = e.target.value,
                value: vnode.state.date,
            }),
        ]
    }
}

export const MemberEvents = {
    oninit: function(vnode) {
        vnode.state.events = vnode.attrs.events;
        vnode.state.member = vnode.attrs.member;
        vnode.state.type = 'Trainer'
        vnode.state.transmitter = {}
    },
    onbeforeupdate: function(vnode) {
        vnode.state.events = vnode.attrs.events;
        vnode.state.member = vnode.attrs.member;
    },
    view: function(vnode) {
        let member = vnode.state.member;
        let events = vnode.state.events;
        
        return [
            m('.row', m('.col', [
                m('h3', 'Verlauf'),
                m('table.table.table-hover', [
                    m('thead', m('tr', [
                            m('th', 'Was'),
                            m('th', 'Datum'),
                            m('th', 'Kommentar'),
                    ])),
                    m('tbody', [
                        events.slice(0).reverse().map(function(event) {
                            return [
                                m('tr', {
                                    class: event.class == 'Promotion' ? 'bg-success' : 'bg-danger'
                                }, [
                                    m('td', event_string(event)),
                                    m('td', event.date),
                                    m('td', event.comment),
                                ]),
                            ]
                        })
                    ])
                ])
            ])),
            m('form.form-inline', [
                m('select.form-control', {
                    onchange: e => vnode.state.type = e.target.value,
                    value: vnode.state.type
                }, event_types.map(event_type => m('option', { value: event_type }, event_type_string(event_type)))),
                (() => {
                    switch(vnode.state.type) {
                        case 'Trainer': return m(TrainerEventAdd, { transmitter: vnode.state.transmitter, member, type: 'Trainer' })
                        case 'CoTrainer': return m(TrainerEventAdd, { transmitter: vnode.state.transmitter, member, type: 'CoTrainer' })
                        case 'Board': return m(BoardEventAdd, { transmitter: vnode.state.transmitter, member })
                        case 'Honorary': return m(HonoraryEventAdd, { transmitter: vnode.state.transmitter, member })
                        case 'Kyu': return m(KyuEventAdd, { transmitter: vnode.state.transmitter, member })
                    }
                })(),
                m('button.form-control.btn-success', {
                    onclick: (e) => {
                        e.preventDefault()
                        vnode.state.transmitter.add()
                        location.reload()
                    }
                }, 'Hinzufügen')
            ])
        ]
    }
}