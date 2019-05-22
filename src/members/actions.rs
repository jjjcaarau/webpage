use super::model::{
    Member,
    NewMember,
};
use crate::schema::{
    members,
    events,
};
use crate::events::model::Event;
use diesel::prelude::*;
use diesel::SaveChangesDsl;

pub enum Error {
    Diesel(diesel::result::Error),
    NotFound,
}

impl From<diesel::result::Error> for Error {
    fn from(error: diesel::result::Error) -> Self {
        Error::Diesel(error)
    }
}

pub fn list_all(
    connection: &SqliteConnection,
) -> Result<Vec<(Member, Vec<Event>, Vec<Member>)>, diesel::result::Error> {
    let member_list = members::table
        .order_by(members::columns::first_name)
        .load::<Member>(connection)?;
    let event_list = Event::belonging_to(&member_list)
        .order_by(events::columns::date)
        .load::<Event>(connection)?
        .grouped_by(&member_list);
    let family_list = Member::belonging_to(&member_list)
        .order_by(members::columns::birthday)
        .load::<Member>(connection)?
        .grouped_by(&member_list);

    Ok(itertools::izip!(member_list.into_iter(), event_list, family_list).collect::<Vec<_>>())
}

pub fn get(
    connection: &SqliteConnection,
    id: i32,
) -> Result<(Member, Vec<Event>, Vec<Member>), Error> {
    let mut member = members::table
        .filter(members::columns::id.eq(id))
        .load::<Member>(connection)?;
    let event_list = Event::belonging_to(&member)
        .order_by(events::columns::date)
        .load::<Event>(connection)?;
    let family_list = Member::belonging_to(&member)
        .order_by(members::columns::birthday)
        .load::<Member>(connection)?;

    if member.len() == 1 {
        Ok((member.remove(0), event_list, family_list))
    } else {
        Err(Error::NotFound)
    }

}

pub fn create(connection: &SqliteConnection, new_member: NewMember) {
    let _ = diesel::insert_into(members::table)
        .values(&new_member)
        .execute(connection)
        .expect("Error saving new member.");
}

pub fn update(connection: &SqliteConnection, member: Member) {
    let _ = diesel::update(&member)
        .set(&member)
        .execute(connection)
        .expect("Error updating member.");
}