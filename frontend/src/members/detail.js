import m from 'mithril'

// Creates an input field.
const input = (storage, key, text, pattern) =>
    m('.row.form-group', [
        m('label.col-lg-2.col-md-3.col-sm-4.col-form-label', text),
        m('input[type=text].col-lg-10.col-md-9.col-sm-8.form-control', {
            name: storage[key],
            placeholder: text,
            value: storage[key],
            pattern: pattern ? pattern : undefined,
            oninput: (e) => storage[key] = e.target.value,
        })
    ])

// Creates a checkbox field.
const checkbox = (storage, key, text) =>
    m('.row.form-group', [
        m('.col-lg-2.col-md-3.col-sm-4', m('label', { for: 'field-' + key }, text)),
        m('.form-check.col-lg-10.col-md-9.col-sm-8', [
            m('input[type=checkbox].form-check-input' + (storage[key] ? '[checked]' : ''), {
                name: storage[key],
                placeholder: text,
                id: 'field-' + key,
                onchange: (e) => storage[key] = !storage[key],
            }),
        ])
    ])

const updateMember = vnode => {
    vnode.state.working = true
    m.request({
        method: 'POST',
        url: '/members/update_json',
        data: vnode.state.member,
    })
    .then(r => {
        vnode.state.working = false
        if(vnode.state.member.id == 0) {
            let params = window.location.href.split('/');
            params[params.length - 1] = r.id
            window.location.href = params.join('/')
        }
    })
    .catch(_ => {
        vnode.state.error = 'Ein Fehler beim Speichern ist aufgetreten.'
        vnode.state.working = false
    })
}

export const MemberDetail = {
    oninit: function(vnode) {
        vnode.state.member = vnode.attrs.member;
        vnode.state.working = false
        vnode.state.error = ''
    },
    onbeforeupdate: (vnode) => vnode.state.member = vnode.attrs.member,
    view: function(vnode) {
        let member = vnode.state.member;
        return [
            m('.row', m('.col', [
                m('h3', 'Info'),
                m('form', [
                    input(member, 'first_name', 'Vorname*'),
                    input(member, 'middle_name', 'Zweitname(n)'),
                    input(member, 'last_name', 'Nachname(n)*'),
                    m('.row.form-group', [
                        m('label.col-lg-2.col-md-3.col-sm-4.col-form-label', 'Geschlecht'),
                        m('select.col-lg-10.col-md-9.col-sm-8.form-control', {
                            onchange: e => member.sex = e.target.value,
                            value: member.sex,
                        }, [
                            m('option[value=F]', 'Weiblich'),
                            m('option[value=M]', 'Männlich'),
                        ]),
                    ]),
                    input(member, 'birthday', 'Geburtstag*', '[0-9]{4}-[0-9]{2}-[0-9]{2}'),
                    checkbox(member, 'email_allowed', 'Möchte Emails'),
                    input(member, 'email', 'Email'),
                    input(member, 'phone_p', 'Telefon (P)'),
                    input(member, 'phone_w', 'Telefon (G)'),
                    input(member, 'mobile', 'Mobiltelefon'),
                    input(member, 'address', 'Strasse*'),
                    input(member, 'address_no', 'Hausnummer*'),
                    input(member, 'postcode', 'PLZ*'),
                    input(member, 'city', 'Wohnort*'),
                    m('.row.form-group', [
                        m('label.col-lg-2.col-md-3.col-sm-4.col-form-label', 'Bemerkungen'),
                        m('textarea[name=comment].col-lg-10.col-md-9.col-sm-8.form-control[placeholder="Bemerkungen"]', {
                            value: member.comment,
                            oninput: (e) => member.comment = e.target.value,
                        })
                    ]),
                    input(member, 'passport_no', 'Passnummer'),
                    checkbox(member, 'needs_mark', 'Jahresmarke benötigt'),
                    m('.row.form-group', [
                        m('label.col-lg-2.col-md-3.col-sm-4.col-form-label', 'Mitglieds-Art'),
                        m('select.col-lg-10.col-md-9.col-sm-8.form-control', {
                            onchange: e => member.member_type = e.target.value,
                            value: member.member_type,
                        }, [
                            m('option[value=Active]', 'Aktiv'),
                            m('option[value=Passive]', 'Passiv'),
                            m('option[value=Parent]', 'Vormund'),
                            m('option[value=Student]', 'Student'),
                            m('option[value=Kid]', 'Kind'),
                        ]),
                    ]),
                ]),
                m('.row', [
                    m('.col-1', [
                        !vnode.state.working
                        ? m('button[type="submit"].btn.btn-primary', {
                            onclick: function(e) {
                                e.preventDefault();
        
                                updateMember(vnode);
                            }
                        }, 'Save')
                        :  m('.spinner-border[role=status]', m('span.sr-only')),
                    ]),
                    m('.col-11', m('span.text-danger', vnode.state.error))
                ]),
            ]))
        ]
    }
}