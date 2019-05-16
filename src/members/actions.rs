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

pub fn list_all(
    connection: &SqliteConnection,
) -> Result<Vec<(Member, Vec<Event>)>, diesel::result::Error> {
    let member_list = members::table
        .order_by(members::columns::first_name)
        .load::<Member>(connection)?;
    let event_list = Event::belonging_to(&member_list)
        .order_by(events::columns::date)
        .load::<Event>(connection)?
        .grouped_by(&member_list);

    Ok(member_list.into_iter().zip(event_list).collect::<Vec<_>>())
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