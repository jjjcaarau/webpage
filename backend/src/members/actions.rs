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

    Ok(itertools::izip!(member_list.into_iter(), event_list, family_list).collect::<Vec<_>>())
}

pub fn get(
    connection: &SqliteConnection,
    id: i32,
) -> Result<(Member, Vec<Event>, Vec<Member>), Error> {
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
    Ok((member, event_list, family_list))

}

pub fn create(connection: &SqliteConnection, new_member: NewMember) {
    diesel::insert_into(members::table)
        .values(&new_member)
        .execute(connection)
        .expect("Error saving new member.");
}

/// Updates a member model in the DB.
pub fn update(connection: &SqliteConnection, member: Member) {
    diesel::update(&member)
        .set(&member)
        .execute(connection)
        .expect("Error updating member.");
}

/// Updates the `family_id` of the Member with the given `member_id` to the given `family_id` in the DB.
pub fn update_family(connection: &SqliteConnection, member_id: i32, family_id: Option<i32>) -> Result<(), Error> {
    println!("{:?} -> {:?}", member_id, family_id);
    let result = diesel::update(members::table)
        .filter(members::columns::id.eq(member_id))
        .set(members::columns::family_id.eq(family_id))
        .execute(connection);
    if let Ok(num_rows) = result {
        Ok(())
    } else {
        Err(Error::NotFound)
    }
}