import m from 'mithril'

import './scss/main.scss'

import { MemberDetail } from '/detail'
import { Family } from '/family'
import { MemberEvents } from '/events'
import { Badges } from '/badges'

export const MemberView = {
    oninit: function(vnode) {
        vnode.state.member = { id: 0, sex: 'F', member_type: 'Active', email_allowed: false, needs_mark: false, section_jujitsu: false, section_judo: false };
        vnode.state.events = [];
        vnode.state.family = [];
        vnode.state.tags = [];
        let params = window.location.href.split('/');
        let param = params[params.length - 1];
        vnode.state.id = parseInt(param);

        vnode.state.reloader = () => {
            if(vnode.state.id != 0) {
                m.request({
                    method: 'GET',
                    url: "/members/view_json/" + vnode.state.id,
                })
                .then(function(result) {
                    vnode.state.member = result.member[0];
                    vnode.state.events = result.member[1];
                    vnode.state.family = result.member[2];
                    vnode.state.tags = result.member[3];
                })
            }
        }
        vnode.state.reloader()
    },
    view: function(vnode) {
        let member = vnode.state.member;
        let events = vnode.state.events;
        let family = vnode.state.family;
        let tags = vnode.state.tags;
        let reloader = vnode.state.reloader;
        return [
            m('a[href=/members/list]', '< Zurück zur Liste'),
            m(MemberDetail, { member, reloader }),
            m(Badges, { events, member, tags, reloader }),
            m(Family, { family, member, reloader }),
            m(MemberEvents, { events, member, reloader }),
        ]
    }
}

window.onload = function() {
    m.mount(document.getElementById('mount'), MemberView)
}