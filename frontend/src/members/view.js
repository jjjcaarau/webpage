import m from 'mithril'

import { MemberDetail } from '/detail'
import { Family } from '/family'
import { MemberEvents } from '/events'
import { Badges } from '/badges'

export const MemberView = {
    oninit: function(vnode) {
        vnode.state.member = {};
        vnode.state.events = [];
        vnode.state.family = [];
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
            vnode.state.family = result.member[2];
        })
    },
    view: function(vnode) {
        let member = vnode.state.member;
        let events = vnode.state.events;
        let family = vnode.state.family;
        return [
            m('a[href=/members/list]', '< Zurück zur Liste'),
            m(MemberDetail, { member }),
            m(Badges, { events, member }),
            m(Family, { member, family }),
            m(MemberEvents, { events, member }),
        ]
    }
}

window.onload = function() {
    m.mount(document.getElementById('mount'), MemberView)
}