use super::model::{
    Member,
    NewMember,
};
use crate::schema::members;
use crate::events::model::Event;
use diesel::prelude::*;
use diesel::SaveChangesDsl;

pub fn list_all(
    connection: &SqliteConnection,
) -> Result<Vec<(Member, Vec<Event>)>, diesel::result::Error> {
    let member_list = members::table.load::<Member>(connection)?;
    let event_list = Event::belonging_to(&member_list)
        .load::<Event>(connection)?
        .grouped_by(&member_list);

    // let ids = member_list.iter().map(Member::id).collect::<Vec<_>>();
    // FilterDsl::filter(Event::table(), Event::foreign_key_column().eq_any(ids));

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