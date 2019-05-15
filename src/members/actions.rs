use super::model::*;
use crate::events::model::*;
use crate::schema::*;
use diesel::prelude::*;
use diesel::SaveChangesDsl;

pub fn list_all(connection: &SqliteConnection) -> Result<Vec<(Member, Vec<Event>)>, diesel::result::Error> {
    use crate::schema::members::dsl::*;

    let member_list = members.load::<Member>(connection)?;
    let event_list = <Event as BelongingToDsl<&Vec<Member>>>::belonging_to(&member_list)
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