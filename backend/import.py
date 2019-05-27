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
        if entry['member_type'] == 'Vollmitglied' or entry['membership'] == '_Aktivmitglieder (Jiu)':
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
            [
                entry['id'],
                None,
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
                entry['needs_mark_jujitsu'] == '1' or entry['needs_mark_judo'] == '1',
            ]
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
                    None,
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
                None,
            )
        )

        # Add Kyus
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
                            None,
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
                            None,
                        )
                    )

        # Honorary member
        if entry['honorary_member'] == '1':
            date = entry['nomination_honorary_member']
            if date == '0000-00-00' or date == None:
                date = '1970-01-01'

            transformed_events.append(
                (
                    entry['id'],
                    'honorary',
                    'promotion',
                    'club',
                    date,
                    entry['honorary_member_extra'],
                )
            )

        # Trainer Ju Jitsu
        if 'Ju Jitsu (Trainer)' in entry['trainer_role']:
            date = entry['nomination_trainer']
            if date == '0000-00-00' or date == None:
                date = '1970-01-01'

            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'promotion',
                    'jujitsu',
                    date,
                    None
                )
            )

        # Co-Trainer Ju Jitsu
        if 'Ju Jitsu (Co-Trainer)' in entry['trainer_role']:
            date = entry['nomination_trainer']
            if date == '0000-00-00' or date == None:
                date = '1970-01-01'

            transformed_events.append(
                (
                    entry['id'],
                    'co_trainer',
                    'promotion',
                    'jujitsu',
                    date,
                    None
                )
            )

        # Co-Trainer Judo
        if 'Judo (Co-Trainer)' in entry['trainer_role']:
            date = entry['nomination_trainer']
            if date == '0000-00-00' or date == None:
                date = '1970-01-01'

            transformed_events.append(
                (
                    entry['id'],
                    'co_trainer',
                    'promotion',
                    'judo',
                    date,
                    None
                )
            )

        # Trainer Judo
        if 'Judo (Trainer)' in entry['trainer_role']:
            date = entry['nomination_trainer']
            if date == '0000-00-00' or date == None:
                date = '1970-01-01'

            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'promotion',
                    'judo',
                    date,
                    None,
                )
            )

        # Board Member
        if entry['board_role'] != '':
            date = entry['nomination_board_role']
            if date == '0000-00-00' or date == None:
                date = '1970-01-01'

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'promotion',
                    'judo',
                    date,
                    entry['board_role'],
                )
            )

        if entry['comment'] != '':
            print('Comment ' + entry['first_name'] + ' ' + entry['last_name'] + ': ' + entry['comment'])

        if entry['jugendundsport_courses_judo'] != '':
            print('J+S Judo ' + entry['first_name'] + ' ' + entry['last_name'] + ': ' + entry['jugendundsport_courses_judo'])

        if entry['jugendundsport_courses_jujitsu'] != '':
            print('J+S Ju Jitsu ' + entry['first_name'] + ' ' + entry['last_name'] + ': ' + entry['jugendundsport_courses_jujitsu'])

    # Track families
    # Haller family (set all to Urs)
    # Urs
    next(filter(lambda x: x[0] == '965', transformed_member))[1] = '965'
    # Ina
    next(filter(lambda x: x[0] == '868', transformed_member))[1] = '965'
    # Pascale
    next(filter(lambda x: x[0] == '811', transformed_member))[1] = '965'
    # Rebecca
    next(filter(lambda x: x[0] == '900', transformed_member))[1] = '965'
    # Manuela
    next(filter(lambda x: x[0] == '1071', transformed_member))[1] = '965'
        

    conn = sqlite3.connect('db.sqlite3')

    c = conn.cursor()

    c.execute('DELETE FROM members')
    c.execute('DELETE FROM events')

    c.executemany(r"""
INSERT INTO members (
    id,
    family_id,
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
    needs_mark
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, transformed_member)

    c.executemany(r"""
INSERT INTO events (
    member_id,
    event_type,
    class,
    division,
    date,
    comment
) VALUES (?, ?, ?, ?, ?, ?)
    """, transformed_events)

    conn.commit()
    conn.close()