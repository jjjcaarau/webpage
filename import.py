import json
import sqlite3

with open('members.json', 'r') as file:
    data = json.load(file)

    transformed_member = []

    transformed_events = []

    for entry in data:
        passport_no = None
        if entry['judo_passport_nr'] != '':
            passport_no = entry['judo_passport_nr']
        else:
            passport_no = entry['jujitsu_passport_nr']
        
        member_type = None
        if entry['honorary_member'] == '1':
            member_type = 'honorary'
        elif entry['member_type'] == 'Vollmitglied' or entry['membership'] == '_Aktivmitglieder (Jiu)':
            member_type = 'active'
        elif entry['membership'] == '_Passivmitglieder':
            member_type = 'passive'
        elif entry['member_type'] == 'Student / Junior':
            member_type = 'student'
        elif entry['member_type'] == 'Kind' or entry['member_type'] == 'Kind (1 pro Familie)' or entry['member_type'] == 'Kind (2 pro Familie)':
            member_type = 'kid'
        else:
            member_type = 'active'

        if entry['birthday'] == '0000-00-00':
            entry['birthday'] = '1970-01-01'

        transformed_member.append(
            (
                entry['id'],
                entry['first_name'],
                entry['middle_name'],
                entry['last_name'],
                entry['sex'],
                entry['birthday'],
                entry['email'],
                entry['home_phone'],
                entry['work_phone'],
                entry['cellular'],
                entry['zip'],
                entry['city'],
                entry['address'],
                entry['address_no'],
                entry['comment'],
                entry['email_allowed'] == '1',
                passport_no,
                member_type,
                entry['honorary_member_extra'],
                entry['needs_mark_jujitsu'] == '1',
                entry['needs_mark_judo'] == '1'
            )
        )

        if entry['membership'] == '_Ausgetreten':
            date = entry['resignation']
            if date == '0000-00-00' or date == None:
                date = '1970-01-01'

            transformed_events.append(
                (
                    entry['id'],
                    'club',
                    'demotion',
                    'club',
                    date,
                )
            )

        date = entry['join_date']
        if date == '0000-00-00' or date == None:
                date = '1970-01-01'

        transformed_events.append(
            (
                entry['id'],
                'club',
                'promotion',
                'club',
                date,
            )
        )
        for division in ['judo', 'jujitsu']:
            for kyu in range(1, 6):
                kyu = str(kyu)
                date = entry['date_kyu_' + kyu + '_' + division]
                if date and date != '0000-00-00':
                    transformed_events.append(
                        (
                            entry['id'],
                            'kyu' + kyu,
                            'promotion',
                            division,
                            date,
                        )
                    )
            for dan in range(1, 7):
                dan = str(dan)
                date = entry['date_dan_' + dan + '_' + division]
                if date and date != '0000-00-00':
                    transformed_events.append(
                        (
                            entry['id'],
                            'dan' + dan,
                            'promotion',
                            division,
                            date,
                        )
                    )
        

    conn = sqlite3.connect('db.sqlite3')

    c = conn.cursor()

    c.execute('DELETE FROM members')
    c.execute('DELETE FROM events')

    c.executemany(r"""
INSERT INTO members (
    id,
    first_name,
    middle_name,
    last_name,
    sex,
    birthday,
    email,
    phone_p,
    phone_w,
    mobile,
    postcode,
    city,
    address,
    address_no,
    comment,
    email_allowed,
    passport_no,
    member_type,
    honorary_member_reason,
    needs_mark_jujitsu,
    needs_mark_judo
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, transformed_member)

    c.executemany(r"""
INSERT INTO events (
    member_id,
    event_type,
    class,
    division,
    date
) VALUES (?, ?, ?, ?, ?)
    """, transformed_events)

    conn.commit()
    conn.close()