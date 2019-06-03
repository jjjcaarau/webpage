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
        if entry['membership'] == '_Passivmitglieder':
            member_type = 'passive'
        elif entry['member_type'] == 'Vollmitglied' or entry['membership'] == '_Aktivmitglieder (Jiu)':
            member_type = 'active'
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
                    'club',
                    date,
                    entry['board_role'],
                )
            )

        if entry['id'] == '1064':
            transformed_events.append(
                (
                    entry['id'],
                    'club',
                    'promotion',
                    'club',
                    '2004-01-01',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'club',
                    'demotion',
                    'club',
                    '2008-12-31',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '1042':
            transformed_events.append(
                (
                    entry['id'],
                    'club',
                    'promotion',
                    'club',
                    '2017-11-09',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'club',
                    'demotion',
                    'club',
                    '2017-11-20',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '889':
            transformed_events.append(
                (
                    entry['id'],
                    'club',
                    'promotion',
                    'club',
                    '2012-11-10',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'club',
                    'demotion',
                    'club',
                    '2012-12-01',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '837':
            transformed_events.append(
                (
                    entry['id'],
                    'club',
                    'promotion',
                    'club',
                    '2011-09-01',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'club',
                    'demotion',
                    'club',
                    '2015-12-31',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '896':
            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'promotion',
                    'club',
                    '2018-03-23',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'demotion',
                    'club',
                    '2019-03-22',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '849':
            transformed_events.append(
                (
                    entry['id'],
                    'co_trainer',
                    'promotion',
                    'judo',
                    '2017-01-01',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'co_trainer',
                    'demotion',
                    'judo',
                    '2018-07-01',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '669':
            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'promotion',
                    'judo',
                    '2006-01-01',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'demotion',
                    'judo',
                    '2016-09-01',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'promotion',
                    'club',
                    '2012-03-23',
                    'Vizepräsident',
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'demotion',
                    'club',
                    '2018-03-01',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '672':
            transformed_events.append(
                (
                    entry['id'],
                    'club',
                    'promotion',
                    'club',
                    '2014-12-09',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'club',
                    'demotion',
                    'club',
                    '2017-01-01',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '465':
            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'promotion',
                    'jujitsu',
                    '1994-01-01',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'demotion',
                    'jujitsu',
                    '2013-31-12',
                    None,
                )
            )

        elif entry['id'] == '481':
            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'promotion',
                    'jujitsu',
                    '1998-01-01',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'demotion',
                    'jujitsu',
                    '2007-12-31',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'promotion',
                    'club',
                    '2002-03-23',
                    'Präsident',
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'demotion',
                    'club',
                    '2008-03-28',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '484':
            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'promotion',
                    'jujitsu',
                    '2013-03-12',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'demotion',
                    'jujitsu',
                    '2017-12-31',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '494':
            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'promotion',
                    'jujitsu',
                    '2000-01-01',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'demotion',
                    'jujitsu',
                    '2017-12-31',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '499':
            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'promotion',
                    'jujitsu',
                    '2014-02-25',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'demotion',
                    'jujitsu',
                    '2017-12-31',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '460':
            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'promotion',
                    'jujitsu',
                    '1999-09-01',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'demotion',
                    'jujitsu',
                    '2011-12-31',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '453':
            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'promotion',
                    'jujitsu',
                    '2005-06-01',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'demotion',
                    'jujitsu',
                    '2017-12-31',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'promotion',
                    'club',
                    '2005-03-23',
                    'Aktuar',
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'demotion',
                    'club',
                    '2013-03-22',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '458':
            event = [event for event in transformed_events if event[0] == '458' and event[1] == 'board'][0]

            transformed_events.append(
                (
                    event[0],
                    event[1],
                    event[2],
                    event[3],
                    '2018-03-23',
                    event[5],
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'promotion',
                    'club',
                    '2012-03-30',
                    'Aktuar',
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '461':
            transformed_events.append(
                (
                    entry['id'],
                    'co_trainer',
                    'promotion',
                    'jujitsu',
                    '2000-11-01',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'co_trainer',
                    'demotion',
                    'jujitsu',
                    '2005-12-31',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'promotion',
                    'club',
                    '2005-03-23',
                    'Vizepräsident',
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'demotion',
                    'club',
                    '2009-03-27',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '514':
            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'promotion',
                    'jujitsu',
                    '2007-04-15',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'trainer',
                    'demotion',
                    'jujitsu',
                    '2012-12-31',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'promotion',
                    'club',
                    '2008-03-28',
                    'Vizepräsident',
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'demotion',
                    'club',
                    '2012-03-23',
                    None,
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'promotion',
                    'club',
                    '2012-03-23',
                    'Aktuar',
                )
            )

            transformed_events.append(
                (
                    entry['id'],
                    'board',
                    'demotion',
                    'club',
                    '2018-03-23',
                    None,
                )
            )

            entry['comment'] = ''

        elif entry['id'] == '816':
            entry['member_type'] = 'extern'

        elif entry['id'] == '817':
            entry['member_type'] = 'extern'

        elif entry['id'] == '819':
            entry['member_type'] = 'extern'

        elif entry['id'] == '822':
            entry['member_type'] = 'extern'

        elif entry['id'] == '917':
            entry['member_type'] = 'extern'

        elif entry['id'] == '832':
            entry['member_type'] = 'extern'

        elif entry['id'] == '916':
            entry['member_type'] = 'extern'

        elif entry['id'] == '522':
            entry['member_type'] = 'passiv'
            entry['comment'] = ''

        elif entry['id'] == '1047':
            entry['comment'] = ''
            entry['email'] = 'coflytiti@yahoo.com'

        elif entry['id'] == '1010':
            entry['comment'] = ''

        elif entry['id'] == '992':
            entry['comment'] = ''

        elif entry['id'] == '1010':
            entry['comment'] = ''

        elif entry['id'] == '870':
            entry['comment'] = ''

        elif entry['id'] == '868':
            entry['comment'] = ''

        elif entry['id'] == '843':
            entry['comment'] = ''

        # elif entry['id'] == '843':
        #     transformed_member.append(
        #         [
        #             1099,
        #             1099,
        #             'Sophie',
        #             '',
        #             'Moor',
        #             'F',
        #             '01-01-1970',
        #             'sophie_moor@yahoo.com',
        #             '',
        #             '',
        #             '076 / 476 87 58',
        #             5024,
        #             'Küttigen',
        #             'Hüslimattweg',
        #             '6',
        #             '',
        #             1,
        #             '',
        #             'parent',
        #             entry['needs_mark_jujitsu'] == '1' or entry['needs_mark_judo'] == '1',
        #         ]
        #     )
        #     entry['family_id'] = 1099

        elif entry['id'] not in [
            '1026', '925', '917', '870', '845', '832', '916', '822', '819', '817', '816', '794',
            '734', '620', '521', '520', '376', '373', '464', '462', '474', '479', '482', '491',
            '489', '498', '503', '506', '509', '511', '797', '495'
        ]:

            if entry['comment'] != '':
                print('Comment ' + entry['id'] + ' ' + entry['first_name'] + ' ' + entry['last_name'] + ': ' + entry['comment'])
                print('--------------------------------')

            # if entry['jugendundsport_courses_judo'] != '':
            #     print('J+S Judo ' + entry['id'] + ' ' + entry['first_name'] + ' ' + entry['last_name'] + ': ' + entry['jugendundsport_courses_judo'])

            # if entry['jugendundsport_courses_jujitsu'] != '':
            #     print('J+S Ju Jitsu ' + entry['id'] + ' ' + entry['first_name'] + ' ' + entry['last_name'] + ': ' + entry['jugendundsport_courses_jujitsu'])

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