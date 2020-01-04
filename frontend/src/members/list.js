import XLSX from 'xlsx'
import { saveAs } from 'file-saver'

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).catch(function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

const filterMembers = function(vnode) {
    let filters = vnode.state.tags.map(
        t => t
            .trim()
            .split(':')
            .map(t => t.trim())
        )

    let firstName = undefined
    let secondName = undefined
    let idx = filters.findIndex(f => f[0] == 'vorname' || f[0] == 'v')
    if (idx > -1) {
        firstName = filters.splice(idx, 1)[0]
    }
    idx = filters.findIndex(f => f[0] == 'nachname' || f[0] == 'n')
    if (idx > -1) {
        secondName = filters.splice(idx, 1)[0]
    }

    if(firstName) {
        var options = {
            keys: ['0.first_name'],
            threshold: 0.00,
            tokenize: true,
        }
        var fuse = new Fuse(vnode.state.members, options)
        vnode.state.filteredMembers = fuse.search(firstName[1])
    } else {
        vnode.state.filteredMembers = vnode.state.members
    }

    if(secondName) {
        var options = {
            keys: ['0.last_name'],
            threshold: 0.00,
            tokenize: true,
        }
        var fuse = new Fuse(vnode.state.members, options)
        vnode.state.filteredMembers = fuse.search(secondName[1])
    } else {
        vnode.state.filteredMembers = vnode.state.filteredMembers
    }

    let len = filters.length
    vnode.state.filteredMembers = vnode.state.filteredMembers.map(m => {
        let count = filters
            .map(f => {
                if (f[0] == 'sektion' || f[0] == 's') {
                    if(f[1] == 'jujitsu' || f[1] == 'ju jitsu' || f[1] == 'jj') {
                        return m[0].section_jujitsu
                    }
                    if(f[1] == 'judo', f[1] == 'j') {
                        return m[0].section_judo
                    }
                    if(f[1] == 'kinder', f[1] == 'k') {
                        return m[0].section_judo_kids
                    }
                    return true
                }

                if (f[0] == 'typ' || f[0] == 't') {
                    let tags = m[3]

                    if(f[1] == 'aktiv' || f[1] == 'a') {
                        return tags.filter(t => t == 'Active').length > 0
                    }
                    if(f[1] == 'passiv' || f[1] == 'p') {
                        return tags.filter(t => t == 'Passive').length > 0
                    }
                    if(f[1] == 'kind' || f[1] == 'k') {
                        return tags.filter(t => t == 'Kid').length > 0
                    }
                    if(f[1] == 'jugendlich' || f[1] == 'j') {
                        return tags.filter(t => t == 'Student').length > 0
                    }
                    if(f[1] == 'ausgetreten' || f[1] == 'r') {
                        return tags.filter(t => t == 'Resigned').length > 0
                    }
                    if(f[1] == 'extern' || f[1] == 'e') {
                        return tags.filter(t => t == 'Extern').length > 0
                    }
                    return true
                }

                if (f[0] == 'range' || f[0] == 'r') {
                    let range = f[1].split('-').map(t => t.trim())
                    let year = new Date(m[0].birthday).getFullYear()

                    if(range[0] <= year && year <= range[1]) {
                        return true
                    }
                    return false
                }

                let name = f[0].toLowerCase().split(' ')
                if(m[0].first_name.toLowerCase().includes(name[0])) {
                    if(name.length > 1) {
                        return m[0].last_name.toLowerCase().includes(name[name.length - 1])
                    } else {
                        return true
                    }
                } else {
                    return false
                }
            })
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0)

        if(count == len) {
            return m
        }
        return undefined
    }).filter(m => m !== undefined)

    vnode.state.filteredMembers.sort(function(a, b){
        let nameA = a[0][vnode.state.order.value].toLowerCase()
        let nameB = b[0][vnode.state.order.value].toLowerCase()
        if (nameA < nameB) {
            return vnode.state.orderDirection ? -1 : 1
        }
        if (nameA > nameB) {
            return vnode.state.orderDirection ? 1 : -1
        }
        return 0; //default return value (no sorting)
    });

    vnode.state.mails = vnode.state.filteredMembers
        .map(m => m[0].email)
        .join(',')
}

const generateExcel = function(vnode) {
    let wb = XLSX.utils.book_new();

    wb.Props = {
        Title: "JJJCAarau Members List",
        Subject: "",
        Author: "JJJCAarau Webpage",
        CreatedDate: new Date().now
    };
    wb.SheetNames.push("Members");

    let ws_data = [[
        'Ausgetreten',
        'Vorname',
        'Zweitname',
        'Nachname',
        'Geburtsdatum',
        'Geschlecht',
        'E-Mail',
        'Telefon Privat',
        'Telefon Geschäft',
        'Telefon Mobil',
        'PLZ',
        'Wohnort',
        'Strasse',
        'Hausnummer',
        'Bemerkungen',
        'Sektion Ju Jitsu',
        'Sektion Judo Erwachsene',
        'Sektion Judo Kinder',
        'Passnummer',
        'Benötigt Jahresmarke',
        'Mitgliedsart',
        'Trainer',
        'Kyu Judo',
        'Kyu Ju-Jitsu',
        'Ehrenmittglied',
        'Vorstand'
    ]];

    vnode.state.filteredMembers.forEach(member => {
        let memberType = 'Ausgetreten';
        let trainerType = 'Nein';
        let kyu = {
            Judo: '6. Kyu',
            JuJitsu: '6. Kyu',
        };
        let honorary = 'Nein';
        let board = 'Nein';

        member[3].forEach((tag) => {
            switch(tag) {
                case 'Active':
                    memberType = 'Aktiv';
                    break;
                case 'Passive':
                    memberType = 'Passiv';
                    break;
                case 'Student':
                    memberType = 'Schüler';
                    break;
                case 'Parent':
                    memberType = 'Elternteil';
                    break;
                case 'Kid':
                    memberType = 'Kind';
                    break;
                case 'Extern':
                    memberType = 'Extern';
                    break;
                case 'Trainer':
                    trainerType = 'Trainer';
                    break;
                case 'CoTrainer':
                    trainerType = 'Co-Trainer';
                    break;
                case 'Honorary':
                    honorary = 'Ja';
                    break;
                case 'Board':
                    board = 'Ja';
                    break;
                default:
                    break;
            }

            if(tag.Grade) {
                console.log(tag.Grade)
                if(tag.Grade.Dan) {
                    kyu[tag.Grade.Dan[0]] = tag.Grade.Dan[1] + '. Dan ';
                }
                if(tag.Grade.Kyu) {
                    kyu[tag.Grade.Kyu[0]] = tag.Grade.Kyu[1] + '. Kyu ';
                }
            }
        })

        ws_data.push([
            member[3].includes('Resigned') ? 'Ja' : 'Nein',
            member[0].first_name,
            member[0].second_name,
            member[0].last_name,
            member[0].birthday,
            member[0].sex,
            member[0].email,
            member[0].phone_p,
            member[0].phone_w,
            member[0].mobile,
            member[0].postcode,
            member[0].city,
            member[0].address,
            member[0].address_no,
            member[0].comment,
            member[0].section_jujitsu ? 'Ja' : 'Nein',
            member[0].section_judo ? 'Ja' : 'Nein',
            member[0].section_judo_kids ? 'Ja' : 'Nein',
            member[0].passport_no,
            member[0].needs_mark ? 'Ja' : 'Nein',
            memberType,
            trainerType,
            kyu.Judo,
            kyu.JuJitsu,
            honorary,
            board,
        ])
    });

    let ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Members"] = ws;

    let wbout = XLSX.write(wb, { bookType:'xlsx',  type: 'binary' });
    return wbout;
}

const downloadExcel = function(vnode) {
    let data = generateExcel(vnode)

    function s2ab(s) { 
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;    
    }

    saveAs(new Blob([s2ab(data)],{type:"application/octet-stream"}), 'test.xlsx');
}

import { TagInput, Tag, Icon, Icons, Intent, Size, CustomSelect, Button, Collapse, ControlGroup, Card } from 'construct-ui'

const ordering = [
    {
        value: 'first_name', label: 'Vorname'
    }, {

        value: 'last_name', label: 'Nachname'
    }, {

        value: 'birthday', label: 'Geburtstag'
    }
]

var MembersList = {
    oninit: function(vnode) {
        vnode.state.q = ''
        vnode.state.kids = true
        vnode.state.judo = true
        vnode.state.jujitsu = true
        vnode.state.passive = true
        vnode.state.active = true
        vnode.state.resigned = true
        vnode.state.extern = true
        vnode.state.mails = ''
        let possibleTags = window.sessionStorage.getItem('searchTags')
        let possibleOrder = window.sessionStorage.getItem('listOrder')
        let possibleOrderDirection = window.sessionStorage.getItem('listOrderDirection')
        vnode.state.tags = possibleTags ? JSON.parse(possibleTags) : []
        vnode.state.order = possibleOrder ? JSON.parse(possibleOrder) : ordering[0]
        vnode.state.orderDirection = possibleOrderDirection ? JSON.parse(possibleOrderDirection) : true
        let possibleHelpIsOpen = JSON.parse(window.sessionStorage.getItem('helpIsOpen'))
        vnode.state.helpIsOpen = possibleHelpIsOpen === null ? false : possibleHelpIsOpen

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
        const isEmpty = this.tags.length === 0;
        return [
            m('div.col-9', m(ControlGroup, { style: 'display:flex;' }, [
                m(Button, {
                    iconLeft: Icons.PLUS,
                    label: 'Neues Mitglied hinzufügen',
                    intent: 'primary',
                    onclick: () => {
                        window.location = '/members/view/0'
                    },
                }),
                m(Button, {
                    iconLeft: Icons.PLUS,
                    label: 'Exel-Liste exportieren',
                    intent: 'primary',
                    onclick: () => downloadExcel(vnode),
                }),
                // m(Button, {
                //     label: 'Filter-Hilfe anzeigen',
                //     onclick: () => {
                //         vnode.state.helpIsOpen = !vnode.state.helpIsOpen
                //         console.log(vnode.state.helpIsOpen)
                //         window.sessionStorage.setItem('helpIsOpen', JSON.stringify(vnode.state.helpIsOpen))
                //     }
                // }),
            ])),
            m('div.col-3', m('p.text-right', [
                m('a[href=#]', {
                    onclick: e => {
                        e.preventDefault()
                        copyTextToClipboard(vnode.state.mails)
                    }
                }, 'Email-Liste kopieren ...'),
                m('br'),
                m('a', { href: 'mailto:' + vnode.state.mails }, 'Email an Liste schreiben ...'),
            ])),
            
            m('div.col-12', [
                'Filter sind einzugeben mit dem Format ', m('b', 'filter:wert'), '. Zum Beispiel ', m('b', 'sektion:jujitsu'), ' oder ', m('b', 's:jj'), '.',
                m('br'),
                'Mögliche Filter sind, wobei mögliche Werte in eckigen Klammern und Kürzel in runden Klammern sind:',
                m('ul', [
                    m('li', 'sektion(s):[judo(j), jujitsu(jj), kinder(k)], z.B. s:jj'),
                    m('li', 'typ(t):[aktiv(a), passiv(p), kind(k), jugendlich(j), ausgetreten(r), extern(e)], z.B. t:a'),
                    m('li', 'vorname(v):[beliebiger wert], z.B. v:Thomas'),
                    m('li', 'nachname(n):[beliebiger wert], z.B. n:Gabrielli'),
                    m('li', 'range(r):yyyy-yyyy, z.B. r:1999-2003'),
                ]),
                'Gibt es Input ohne Selektor, z.B. "Cris To", dann wird direkt nach Vor- und Nachnamen gesucht.',
                m('br'),
                'Es können mehrere Filter angewandt werden, wobei alle erfüllt sein müssen damit ein Eintrag erscheint!'
            ]),
            m('div.col-12', [
                m(ControlGroup, { style: 'display:flex;' }, [
                    m(TagInput, {
                        addOnBlur: this.addOnBlur,
                        tags: this.tags.map(tag => m(Tag, {
                            label: tag,
                            onRemove: () => this.removeTag(vnode, tag)
                        })),
                        disabled: false,
                        intent: Intent.DEFAULT,
                        size: Size.DEFAULT,
                        contentLeft: m(Icon, { name: Icons.SEARCH }),
                        contentRight: isEmpty ? '' : m(Icon, {
                            name: Icons.X,
                            onclick: v => this.clear(vnode, v)
                            }),
                        class: 'search-input',
                        onAdd: v => this.onAdd(vnode, v),
                    }),
                    m(CustomSelect, {
                        value: vnode.state.order.value,
                        options: ordering,
                        onSelect: item => this.handleSelect(vnode, item)
                    }),
                    m(Button, {
                        iconLeft: vnode.state.orderDirection ? Icons.ARROW_UP : Icons.ARROW_DOWN,
                        onclick: () => {
                            vnode.state.orderDirection = !vnode.state.orderDirection
                            window.sessionStorage.setItem('listOrderDirection', JSON.stringify(vnode.state.orderDirection))
                            filterMembers(vnode)
                        },
                        style: '',
                    }),
                ]),
            ]),
            m('div.col-12', [
                m('table.table.table-hover.col-12', [
                    m('thead', m('tr', [
                            m('th', 'ID'),
                            m('th', 'Vorname'),
                            m('th', 'Nachname(n)'),
                            m('th', 'E-Mail'),
                            m('th', 'Geburtstag'),
                    ])),
                    m('tbody', [
                        vnode.state.filteredMembers ? vnode.state.filteredMembers.map(function(entry) {
                            let member = entry[0];
                            let events = entry[1];
                            
                            return [
                                m('tr', {
                                    onclick: function(e) {
                                        e.preventDefault();
                                        window.location = '/members/view/' + member.id;
                                    },
                                }, [
                                    m('td', member.id),
                                    m('td', member.first_name),
                                    m('td', member.last_name),
                                    m('td', member.email),
                                    m('td', member.birthday),
                                ]),
                            ]
                        }) : ''
                    ])
                ])
            ])
        ]
    },
    onAdd(vnode, value) {
        vnode.state.tags.push(value)
        window.sessionStorage.setItem('searchTags', JSON.stringify(vnode.state.tags))
        filterMembers(vnode)
    },
    removeTag(vnode, tag) {
        const index = vnode.state.tags.indexOf(tag)
        vnode.state.tags.splice(index, 1)
        window.sessionStorage.setItem('searchTags', JSON.stringify(vnode.state.tags))

        filterMembers(vnode)
    },
    clear(vnode){
        vnode.state.tags = []
        window.sessionStorage.setItem('searchTags', JSON.stringify(vnode.state.tags))
        filterMembers(vnode)
    },
    handleSelect(vnode, item) {
        vnode.state.order = item;
        window.sessionStorage.setItem('listOrder', JSON.stringify(vnode.state.order))
        filterMembers(vnode)
    }
}

window.onload = function() {
    m.mount(document.getElementById('mount'), MembersList)
};