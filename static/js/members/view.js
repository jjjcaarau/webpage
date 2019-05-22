window.onload = function() {
    var MemberView = {
        oninit: function(vnode) {
            vnode.state.member = {};
            vnode.state.events = [];
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
            })
        },
        view: function(vnode) {
            let member = vnode.state.member;
            let events = vnode.state.events;
            return [
                m('div.col-12', m('form#update-member',
                    m('.form-row', [
                        m('.col', [
                            m('label', 'First name'),
                            m('input[type="text"][name=first_name].form-control[placeholder="First name"]', { value: member.first_name })
                        ]),
                        m('.col', [
                            m('label', 'Middle name'),
                            m('input[type="text"][name=middle_name].form-control[placeholder="Middle name"]', { value: member.middle_name })
                        ]),
                        m('.col', [
                            m('label', 'Last name'),
                            m('input[type="text"][name=last_name].form-control[placeholder="Last name"]', { value: member.last_name })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'Sex'),
                            m('input[type="text"][name=sex].form-control[placeholder="Sex"]', { value: member.sex })
                        ]),
                        m('.col', [
                            m('label', 'Birthday'),
                            m('input[type="text"][name=birthday].form-control[placeholder="Birthday"]', { value: member.birthday })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'Email'),
                            m('input[type="text"][name=email].form-control[placeholder="Email"]', { value: member.email })
                        ]),
                        m('.col', [
                            m('label', 'Phone'),
                            m('input[type="text"][name=phone_p].form-control[placeholder="Phone"]', { value: member.phone_p })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'Address'),
                            m('input[type="text"][name=address].form-control[placeholder="Address"]', { value: member.address })
                        ]),
                        m('.col', [
                            m('label', 'Address No'),
                            m('input[type="text"][name=address_no].form-control[placeholder="Address No"]', { value: member.address_no })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'PLZ'),
                            m('input[type="text"][name=postcode].form-control[placeholder="PLZ"]', { value: member.postcode })
                        ]),
                        m('.col', [
                            m('label', 'City'),
                            m('input[type="text"][name=city].form-control[placeholder="City"]', { value: member.city })
                        ]),
                    ]),
                    m('.form-row', [
                        m('.col', [
                            m('label', 'PLZ'),
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