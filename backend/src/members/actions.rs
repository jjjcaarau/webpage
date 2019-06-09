use super::model::{
    Member,
    NewMember,
    MemberType,
    Tag,
    Division,
    Grade,
};
use crate::schema::{
    members,
    events,
};
use crate::events::model::{
    Event,
    EventClass,
    EventDivision,
    EventType,
};
use diesel::prelude::*;

#[derive(Debug)]
pub enum Error {
    Diesel(diesel::result::Error),
    NotFound,
}

impl From<diesel::result::Error> for Error {
    fn from(error: diesel::result::Error) -> Self {
        Error::Diesel(error)
    }
}

/// Fetches all known members from the DB.
pub fn list_all(connection: &SqliteConnection) -> Result<Vec<(Member, Vec<Event>, Vec<Member>, Vec<Tag>)>, diesel::result::Error> {
    let member_list = members::table
        .order_by(members::columns::first_name)
        .load::<Member>(connection)?;
    let event_list = Event::belonging_to(&member_list)
        .order_by(events::columns::date)
        .load::<Event>(connection)?
        .grouped_by(&member_list);
    let family_list = members::table
        .filter({
            let ids = member_list
                .iter()
                .map(|member| (member.id, member.family_id))
                .unzip::<i32, Option<i32>, Vec<i32>, Vec<Option<i32>>>();
            members::columns::family_id.eq_any(ids.1)
            .and(members::columns::id.ne_all(ids.0))
        })
        .order_by(members::columns::birthday)
        .load::<Member>(connection)?
        .grouped_by(&member_list);
    let tag_list = member_list
        .iter()
        .zip(event_list.iter())
        .map(|(m, e)| get_tags(m, e))
        .collect::<Vec<_>>();

    Ok(itertools::izip!(member_list.into_iter(), event_list, family_list, tag_list).collect::<Vec<_>>())
}

/// Fetches an existing member from the DB.
pub fn get(connection: &SqliteConnection, id: i32) -> Result<(Member, Vec<Event>, Vec<Member>, Vec<Tag>), Error> {
    let member = {
        let mut members = members::table
            .filter(members::columns::id.eq(id))
            .load::<Member>(connection)?;
        if members.len() == 1 {
            members.remove(0)
        } else {
            return Err(Error::NotFound)
        }
    };
    let event_list = Event::belonging_to(&member)
        .order_by(events::columns::date)
        .load::<Event>(connection)?;
    let family_list = members::table
        .filter({
            members::columns::family_id.eq(member.family_id)
            .and(members::columns::id.ne(member.id))
        })
        .order_by(members::columns::birthday)
        .load::<Member>(connection)?;
    let tag_list = get_tags(&member, &event_list);

    Ok((member, event_list, family_list, tag_list))

}

/// Creates a new member in the DB.
pub fn create(connection: &SqliteConnection, new_member: &NewMember) -> Result<Member, diesel::result::Error> {
    diesel::insert_into(members::table)
        .values(new_member)
        .execute(connection)
        .expect("Error saving new member.");
    members::table.order(members::columns::id.desc()).first(connection)
}

/// Updates a member model in the DB.
pub fn update(connection: &SqliteConnection, member: &Member) -> Result<(), diesel::result::Error>{
    diesel::update(member)
        .set(member)
        .execute(connection).map(|_| ())
}

/// Updates the `family_id` of the Member with the given `member_id` to the given `family_id` in the DB.
pub fn update_family(connection: &SqliteConnection, member_id: i32, family_id: Option<i32>) -> Result<(), Error> {
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
        },
        Err(err) => Err(Error::Diesel(err)),
    }
}

#[derive(Serialize)]
pub struct Stats {
    number_of_paying_members: usize,
    paying_members: Vec<(Member, Vec<Event>)>,
    paying_kids: usize,
    number_of_paying_students: usize,
    paying_students: Vec<(Member, Vec<Event>)>,
}

/// Returns a struct of global club stats.
pub fn get_stats(connection: &SqliteConnection) -> Stats {
    let member_list = members::table
        .order_by(members::columns::first_name)
        .load::<Member>(connection).expect("Load of member list failed.");
    let event_list = Event::belonging_to(&member_list)
        .order_by(events::columns::date)
        .load::<Event>(connection).expect("Load of event list failed.")
        .grouped_by(&member_list);

    let zipped_members = itertools::izip!(member_list.into_iter(), event_list).collect::<Vec<_>>();

    let paying_members = zipped_members
        .clone()
        .into_iter()
        .filter(|m| m.0.member_type == MemberType::Active && is_paying(&get_tags(&m.0, &m.1)))
        .collect::<Vec<_>>();
    let paying_kids = zipped_members
        .iter()
        .filter(|m| m.0.member_type == MemberType::Kid && is_paying(&get_tags(&m.0, &m.1)))
        .count();
    let paying_students = zipped_members
        .clone()
        .into_iter()
        .filter(|m| m.0.member_type == MemberType::Student && is_paying(&get_tags(&m.0, &m.1)))
        .collect::<Vec<_>>();

    Stats {
        number_of_paying_members: paying_members.len(),
        paying_members,
        paying_kids,
        number_of_paying_students: paying_students.len(),
        paying_students,
    }
}

/// Returns whether a member has to pay fees.
fn is_paying(tags: &Vec<Tag>) -> bool {
    for tag in tags {
        match tag {
            Tag::Honorary => return false,
            Tag::Resigned => return false,
            Tag::Board => return false,
            Tag::Trainer(_) => return false,
            Tag::CoTrainer(_) => return false,
            _ => ()
        }
    }
    return true;
}

/// Returns all tags a member is associated with.
fn get_tags(member: &Member, events: &Vec<Event>) -> Vec<Tag> {
    let mut club_events = Vec::new();
    let mut board_events = Vec::new();
    let mut trainer_events = Vec::new();
    let mut cotrainer_events = Vec::new();
    let mut judo_events = Vec::new();
    let mut jujitsu_events = Vec::new();

    let mut result = vec![];

    for event in events {
        // Find club events.
        if event.event_type == EventType::Club && event.division == EventDivision::Club {
            club_events.push(event);
        }

        // Check if honorary member.
        if event.event_type == EventType::Honorary
        && event.division == EventDivision::Club
        && event.class == EventClass::Promotion {
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
    }

    // Check if resigned
    club_events.sort_by(|a, b| b.date.partial_cmp(&a.date).expect("Buggedi bug bug."));
    if club_events.len() > 0 {
        let last = club_events[0];
        if last.class == EventClass::Demotion {
            result.push(Tag::Resigned);
        } else {
            result.push(member.member_type.into());
        }
    } else {
        result.push(member.member_type.into());
    }

    board_events.sort_by(|a, b| b.date.partial_cmp(&a.date).expect("Buggedi bug bug."));
    if board_events.len() > 0 && board_events[0].class == EventClass::Promotion {
        result.push(Tag::Board);
    }

    trainer_events.sort_by(|a, b| b.date.partial_cmp(&a.date).expect("Buggedi bug bug."));
    if trainer_events.len() > 0 && trainer_events[0].class == EventClass::Promotion {
        result.push(Tag::Trainer(trainer_events[0].division.into()));
    }

    cotrainer_events.sort_by(|a, b| b.date.partial_cmp(&a.date).expect("Buggedi bug bug."));
    if cotrainer_events.len() > 0 && cotrainer_events[0].class == EventClass::Promotion {
        result.push(Tag::CoTrainer(cotrainer_events[0].division.into()));
    }

    judo_events.sort_by(|a, b| b.date.partial_cmp(&a.date).expect("Buggedi bug bug."));
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

    jujitsu_events.sort_by(|a, b| b.date.partial_cmp(&a.date).expect("Buggedi bug bug."));
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