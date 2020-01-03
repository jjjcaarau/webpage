use super::model::{Division, Grade, Member, NewMember, Tag};
use crate::events::model::{Event, EventClass, EventDivision, EventType};
use crate::invoices::model::Invoice;
use crate::schema::{events, invoices, members};
use diesel::prelude::*;
use chrono::Duration;

use crate::error::Error;

/// Fetches all known members from the DB.
pub fn list_all(
    connection: &SqliteConnection,
) -> Result<Vec<(Member, Vec<Event>, Vec<Member>, Vec<Tag>)>, diesel::result::Error> {
    let member_list = members::table
        .order_by(members::columns::first_name)
        .load::<Member>(connection)?;

    let event_list = Event::belonging_to(&member_list)
        .order_by((events::columns::date, events::columns::id))
        .load::<Event>(connection)?
        .grouped_by(&member_list);
    let family_list = member_list
        .iter()
        .map(|member| {
            member_list
                .iter()
                .filter(|inner| inner.family_id == Some(member.id) && inner.id != member.id)
                .cloned()
                .collect::<Vec<_>>()
        })
        .collect::<Vec<_>>();
    let tag_list = member_list
        .iter()
        .zip(event_list.iter())
        .map(|(m, e)| get_tags(m, e))
        .collect::<Vec<_>>();
    Ok(itertools::izip!(
        member_list.into_iter(),
        event_list,
        family_list.into_iter(),
        tag_list
    )
    .collect::<Vec<_>>())
}

/// Fetches an existing member from the DB.
pub fn get(
    connection: &SqliteConnection,
    id: i32,
) -> Result<(Member, Vec<Event>, Vec<Member>, Vec<Tag>), Error> {
    let member = {
        let mut members = members::table
            .filter(members::columns::id.eq(id))
            .load::<Member>(connection)?;
        if members.len() == 1 {
            members.remove(0)
        } else {
            return Err(Error::NotFound);
        }
    };
    let event_list = Event::belonging_to(&member)
        .order((events::columns::date, events::columns::id))
        .load::<Event>(connection)?;
    let family_list = members::table
        .filter({
            members::columns::family_id
                .eq(member.family_id)
                .and(members::columns::id.ne(member.id))
        })
        .order_by(members::columns::birthday)
        .load::<Member>(connection)?;
    let tag_list = get_tags(&member, &event_list);

    Ok((member, event_list, family_list, tag_list))
}

/// Fetches an existing member from the DB.
pub fn get_by_email(
    connection: &SqliteConnection,
    email: &str,
) -> Result<(Member, Vec<Event>, Vec<Member>, Vec<Tag>), Error> {
    let member = {
        let mut members = members::table
            .filter(members::columns::email.eq(email))
            .load::<Member>(connection)?;
        if members.len() == 1 {
            members.remove(0)
        } else {
            return Err(Error::NotFound);
        }
    };
    let event_list = Event::belonging_to(&member)
        .order((events::columns::date, events::columns::id))
        .load::<Event>(connection)?;
    let family_list = members::table
        .filter({
            members::columns::family_id
                .eq(member.family_id)
                .and(members::columns::id.ne(member.id))
        })
        .order_by(members::columns::birthday)
        .load::<Member>(connection)?;
    let tag_list = get_tags(&member, &event_list);

    Ok((member, event_list, family_list, tag_list))
}

pub fn get_by_recovery(connection: &SqliteConnection, hash: &str) -> Result<Member, Error> {
    let member = {
        let mut members = members::table
            .filter(members::columns::password_recovery.eq(hash))
            .load::<Member>(connection)?;
        if members.len() == 1 {
            members.remove(0)
        } else {
            return Err(Error::NotFound);
        }
    };
    Ok(member)
}

/// Creates a new member in the DB.
pub fn create(
    connection: &SqliteConnection,
    new_member: &NewMember,
) -> Result<Member, diesel::result::Error> {
    diesel::insert_into(members::table)
        .values(new_member)
        .execute(connection)
        .expect("Error saving new member.");
    members::table
        .order(members::columns::id.desc())
        .first(connection)
}

/// Updates a member model in the DB.
pub fn update(connection: &SqliteConnection, member: &Member) -> Result<(), diesel::result::Error> {
    diesel::update(member)
        .set(member)
        .execute(connection)
        .map(|_| ())
}

pub fn update_recovery(
    connection: &SqliteConnection,
    member: &Member,
    recovery: Option<String>,
) -> Result<(), diesel::result::Error> {
    diesel::update(member)
        .set(members::columns::password_recovery.eq(recovery))
        .execute(connection)
        .map(|_| ())
}

pub fn update_password(
    connection: &SqliteConnection,
    member: &Member,
    password: Option<String>,
) -> Result<(), diesel::result::Error> {
    diesel::update(member)
        .set(members::columns::password.eq(password.map(|p| pbkdf2::pbkdf2_simple(&p, 1).unwrap())))
        .execute(connection)
        .map(|_| ())
}

/// Updates the `family_id` of the Member with the given `member_id` to the given `family_id` in the DB.
pub fn update_family(
    connection: &SqliteConnection,
    member_id: i32,
    family_id: Option<i32>,
) -> Result<(), Error> {
    let result = diesel::update(members::table)
        .filter(members::columns::id.eq(member_id))
        .set(members::columns::family_id.eq(family_id))
        .execute(connection);
    match result {
        Ok(num_rows) => {
            if num_rows == 1 {
                Ok(())
            } else {
                Err(Error::NotFound)
            }
        }
        Err(err) => Err(Error::Diesel(err)),
    }
}

#[derive(Serialize)]
pub struct Stats {
    number_of_paying_members: usize,
    paying_members: Vec<(Member, Vec<Event>, Option<Invoice>)>,
    number_of_paying_kids: usize,
    paying_kids: Vec<(Member, Vec<Event>, Option<Invoice>)>,
    number_of_paying_students: usize,
    paying_students: Vec<(Member, Vec<Event>, Option<Invoice>)>,
}

/// Returns a struct of global club stats.
pub fn get_stats(connection: &SqliteConnection) -> Stats {
    let member_list = members::table
        .order_by(members::columns::first_name)
        .load::<Member>(connection)
        .expect("Load of member list failed.");
    let event_list = Event::belonging_to(&member_list)
        .order_by(events::columns::date)
        .load::<Event>(connection)
        .expect("Load of event list failed.")
        .grouped_by(&member_list);
    let invoice_list = Invoice::belonging_to(&member_list)
        .order_by(invoices::columns::number.desc())
        .load::<Invoice>(connection)
        .expect("Load of invoice list failed.")
        .grouped_by(&member_list);

    let zipped_members = itertools::izip!(
        member_list.into_iter(),
        event_list,
        invoice_list.into_iter().map(|mut item| if item.is_empty() {
            None
        } else {
            Some(item.remove(0))
        })
    )
    .collect::<Vec<_>>();

    let paying_members = zipped_members
        .clone()
        .into_iter()
        .filter(|m| {
            let tags = get_tags(&m.0, &m.1);
            is_active(&tags) && is_paying(&tags)
        })
        .collect::<Vec<_>>();
    let paying_kids = zipped_members
        .clone()
        .into_iter()
        .filter(|m| {
            let tags = get_tags(&m.0, &m.1);
            is_kid(&tags) && is_paying(&tags)
        })
        .collect::<Vec<_>>();
    let paying_students = zipped_members
        .clone()
        .into_iter()
        .filter(|m| {
            let tags = get_tags(&m.0, &m.1);
            is_student(&tags) && is_paying(&tags)
        })
        .collect::<Vec<_>>();

    Stats {
        number_of_paying_members: paying_members.len(),
        paying_members,
        number_of_paying_kids: paying_kids.len(),
        paying_kids,
        number_of_paying_students: paying_students.len(),
        paying_students,
    }
}

/// Returns whether a member has to pay fees.
pub fn is_paying(tags: &Vec<Tag>) -> bool {
    for tag in tags {
        match tag {
            Tag::Honorary => return false,
            Tag::Resigned => return false,
            Tag::Board => return false,
            Tag::Passive => return false,
            Tag::Trainer(_) => return false,
            Tag::CoTrainer(_) => return false,
            Tag::Extern => return false,
            _ => (),
        }
    }
    true
}

pub fn is_kid(tags: &Vec<Tag>) -> bool {
    for tag in tags {
        match tag {
            Tag::Kid => return true,
            _ => (),
        }
    }
    false
}

pub fn is_student(tags: &Vec<Tag>) -> bool {
    for tag in tags {
        match tag {
            Tag::Student => return true,
            _ => (),
        }
    }
    false
}

pub fn is_active(tags: &Vec<Tag>) -> bool {
    for tag in tags {
        match tag {
            Tag::Active => return true,
            _ => (),
        }
    }
    false
}

/// This function returns the membership type from the set of membership events.
/// The set should only contain membership events. Otherwise the result is unpredictable.
pub fn get_membership(member: &Member, membership_events: &mut Vec<&Event>) -> Tag {
    membership_events.sort_by(
        |a, b| match b.date.partial_cmp(&a.date).expect("Buggedi bug bug.") {
            std::cmp::Ordering::Equal => b.id.cmp(&a.id),
            other => other,
        },
    );

    if membership_events.len() > 0 {
        let last = membership_events[0];
        match last.event_type {
            EventType::Active => {
                let age = chrono::Utc::now().date().naive_utc() - member.birthday;
                if age <= Duration::days(15 * 365) {
                    Tag::Kid
                } else if age >= Duration::days(16 * 365) && age <= Duration::days(19 * 365) {
                    Tag::Student
                } else {
                    Tag::Active
                }
            },
            EventType::Passive => Tag::Passive,
            EventType::Parent => Tag::Parent,
            EventType::Extern => Tag::Extern,
            _ => Tag::Passive
        }
    } else {
        Tag::Passive
    }
}

/// Returns all tags a member is associated with.
pub fn get_tags(member: &Member, events: &Vec<Event>) -> Vec<Tag> {
    let mut club_events = Vec::new();
    let mut board_events = Vec::new();
    let mut trainer_events = Vec::new();
    let mut cotrainer_events = Vec::new();
    let mut judo_events = Vec::new();
    let mut jujitsu_events = Vec::new();
    let mut membership_events = Vec::new();

    let mut result = vec![];

    for event in events {
        // Find club events.
        if event.event_type == EventType::Club && event.division == EventDivision::Club {
            club_events.push(event);
        }

        // Check if honorary member.
        if event.event_type == EventType::Honorary
            && event.division == EventDivision::Club
            && event.class == EventClass::Promotion
        {
            result.push(Tag::Honorary);
        }

        // Get board member events.
        if event.event_type == EventType::Board {
            board_events.push(event)
        }

        // Get trainer events.
        if event.event_type == EventType::Trainer {
            trainer_events.push(event)
        }

        // Get cotrainer events.
        if event.event_type == EventType::CoTrainer {
            cotrainer_events.push(event)
        }

        // Get judo events.
        if event.division == EventDivision::Judo {
            match event.event_type {
                EventType::Kyu1 => judo_events.push(event),
                EventType::Kyu2 => judo_events.push(event),
                EventType::Kyu3 => judo_events.push(event),
                EventType::Kyu4 => judo_events.push(event),
                EventType::Kyu5 => judo_events.push(event),
                EventType::Dan1 => judo_events.push(event),
                EventType::Dan2 => judo_events.push(event),
                EventType::Dan3 => judo_events.push(event),
                EventType::Dan4 => judo_events.push(event),
                EventType::Dan5 => judo_events.push(event),
                EventType::Dan6 => judo_events.push(event),
                EventType::Dan7 => judo_events.push(event),
                EventType::Dan8 => judo_events.push(event),
                EventType::Dan9 => judo_events.push(event),
                EventType::Dan10 => judo_events.push(event),
                _ => (),
            }
        }

        // Get jujitsu events.
        if event.division == EventDivision::Jujitsu {
            match event.event_type {
                EventType::Kyu1 => jujitsu_events.push(event),
                EventType::Kyu2 => jujitsu_events.push(event),
                EventType::Kyu3 => jujitsu_events.push(event),
                EventType::Kyu4 => jujitsu_events.push(event),
                EventType::Kyu5 => jujitsu_events.push(event),
                EventType::Dan1 => jujitsu_events.push(event),
                EventType::Dan2 => jujitsu_events.push(event),
                EventType::Dan3 => jujitsu_events.push(event),
                EventType::Dan4 => jujitsu_events.push(event),
                EventType::Dan5 => jujitsu_events.push(event),
                EventType::Dan6 => jujitsu_events.push(event),
                EventType::Dan7 => jujitsu_events.push(event),
                EventType::Dan8 => jujitsu_events.push(event),
                EventType::Dan9 => jujitsu_events.push(event),
                EventType::Dan10 => jujitsu_events.push(event),
                _ => (),
            }
        }

        // Get all membership type events.
        match event.event_type {
            EventType::Active => membership_events.push(event),
            EventType::Passive => membership_events.push(event),
            EventType::Parent => membership_events.push(event),
            EventType::Extern => membership_events.push(event),
            _ => ()
        }
    }

    // Check if resigned
    club_events.sort_by(
        |a, b| match b.date.partial_cmp(&a.date).expect("Buggedi bug bug.") {
            std::cmp::Ordering::Equal => match a.class {
                EventClass::Promotion => std::cmp::Ordering::Greater,
                _ => std::cmp::Ordering::Less,
            },
            other => other,
        },
    );
    if club_events.len() > 0 {
        let last = club_events[0];
        if last.class == EventClass::Demotion {
            result.push(Tag::Resigned);
        } else {
            result.push(get_membership(member, &mut membership_events));
        }
    } else {
        result.push(get_membership(member, &mut membership_events));
    }

    board_events.sort_by(
        |a, b| match b.date.partial_cmp(&a.date).expect("Buggedi bug bug.") {
            std::cmp::Ordering::Equal => b.id.cmp(&a.id),
            other => other,
        },
    );
    if board_events.len() > 0 && board_events[0].class == EventClass::Promotion {
        result.push(Tag::Board);
    }

    trainer_events.sort_by(
        |a, b| match b.date.partial_cmp(&a.date).expect("Buggedi bug bug.") {
            std::cmp::Ordering::Equal => b.id.cmp(&a.id),
            other => other,
        },
    );
    if trainer_events.len() > 0 && trainer_events[0].class == EventClass::Promotion {
        result.push(Tag::Trainer(trainer_events[0].division.into()));
    }

    cotrainer_events.sort_by(
        |a, b| match b.date.partial_cmp(&a.date).expect("Buggedi bug bug.") {
            std::cmp::Ordering::Equal => b.id.cmp(&a.id),
            other => other,
        },
    );
    if cotrainer_events.len() > 0 && cotrainer_events[0].class == EventClass::Promotion {
        result.push(Tag::CoTrainer(cotrainer_events[0].division.into()));
    }

    judo_events.sort_by(
        |a, b| match b.date.partial_cmp(&a.date).expect("Buggedi bug bug.") {
            std::cmp::Ordering::Equal => b.id.cmp(&a.id),
            other => other,
        },
    );
    if judo_events.len() > 0 && judo_events[0].class == EventClass::Promotion {
        let event = judo_events[0];
        match event.event_type {
            EventType::Kyu1 => result.push(Tag::Grade(Grade::Kyu(Division::Judo, 1))),
            EventType::Kyu2 => result.push(Tag::Grade(Grade::Kyu(Division::Judo, 2))),
            EventType::Kyu3 => result.push(Tag::Grade(Grade::Kyu(Division::Judo, 3))),
            EventType::Kyu4 => result.push(Tag::Grade(Grade::Kyu(Division::Judo, 4))),
            EventType::Kyu5 => result.push(Tag::Grade(Grade::Kyu(Division::Judo, 5))),
            EventType::Dan1 => result.push(Tag::Grade(Grade::Dan(Division::Judo, 1))),
            EventType::Dan2 => result.push(Tag::Grade(Grade::Dan(Division::Judo, 2))),
            EventType::Dan3 => result.push(Tag::Grade(Grade::Dan(Division::Judo, 3))),
            EventType::Dan4 => result.push(Tag::Grade(Grade::Dan(Division::Judo, 4))),
            EventType::Dan5 => result.push(Tag::Grade(Grade::Dan(Division::Judo, 5))),
            EventType::Dan6 => result.push(Tag::Grade(Grade::Dan(Division::Judo, 6))),
            EventType::Dan7 => result.push(Tag::Grade(Grade::Dan(Division::Judo, 7))),
            EventType::Dan8 => result.push(Tag::Grade(Grade::Dan(Division::Judo, 8))),
            EventType::Dan9 => result.push(Tag::Grade(Grade::Dan(Division::Judo, 9))),
            EventType::Dan10 => result.push(Tag::Grade(Grade::Dan(Division::Judo, 10))),
            _ => (),
        };
    }

    jujitsu_events.sort_by(
        |a, b| match b.date.partial_cmp(&a.date).expect("Buggedi bug bug.") {
            std::cmp::Ordering::Equal => b.id.cmp(&a.id),
            other => other,
        },
    );
    if jujitsu_events.len() > 0 && jujitsu_events[0].class == EventClass::Promotion {
        let event = jujitsu_events[0];
        match event.event_type {
            EventType::Kyu1 => result.push(Tag::Grade(Grade::Kyu(Division::JuJitsu, 1))),
            EventType::Kyu2 => result.push(Tag::Grade(Grade::Kyu(Division::JuJitsu, 2))),
            EventType::Kyu3 => result.push(Tag::Grade(Grade::Kyu(Division::JuJitsu, 3))),
            EventType::Kyu4 => result.push(Tag::Grade(Grade::Kyu(Division::JuJitsu, 4))),
            EventType::Kyu5 => result.push(Tag::Grade(Grade::Kyu(Division::JuJitsu, 5))),
            EventType::Dan1 => result.push(Tag::Grade(Grade::Dan(Division::JuJitsu, 1))),
            EventType::Dan2 => result.push(Tag::Grade(Grade::Dan(Division::JuJitsu, 2))),
            EventType::Dan3 => result.push(Tag::Grade(Grade::Dan(Division::JuJitsu, 3))),
            EventType::Dan4 => result.push(Tag::Grade(Grade::Dan(Division::JuJitsu, 4))),
            EventType::Dan5 => result.push(Tag::Grade(Grade::Dan(Division::JuJitsu, 5))),
            EventType::Dan6 => result.push(Tag::Grade(Grade::Dan(Division::JuJitsu, 6))),
            EventType::Dan7 => result.push(Tag::Grade(Grade::Dan(Division::JuJitsu, 7))),
            EventType::Dan8 => result.push(Tag::Grade(Grade::Dan(Division::JuJitsu, 8))),
            EventType::Dan9 => result.push(Tag::Grade(Grade::Dan(Division::JuJitsu, 9))),
            EventType::Dan10 => result.push(Tag::Grade(Grade::Dan(Division::JuJitsu, 10))),
            _ => (),
        };
    }

    result
}
