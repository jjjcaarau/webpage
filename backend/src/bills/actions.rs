use super::model::{
    Bill,
    NewBill,
};
use crate::members::model::{
    Member,
    MemberType,
};
use crate::events::model::{
    Event
};
use crate::schema::{
    members,
    bills,
};
use diesel::prelude::*;

use crate::config::CONFIG;

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

/// Fetches all known bills from the DB.
pub fn list_all(connection: &SqliteConnection) -> Result<Vec<Bill>, diesel::result::Error> {
    let bill_list = bills::table
        .order_by(bills::columns::id)
        .load::<Bill>(connection)?;

    Ok(bill_list)
}

/// Fetches an existing bill from the DB.
pub fn get(connection: &SqliteConnection, id: i32) -> Result<Bill, Error> {
    let bill = {
        let mut bills = bills::table
            .filter(bills::columns::id.eq(id))
            .load::<Bill>(connection)?;
        if bills.len() == 1 {
            bills.remove(0)
        } else {
            return Err(Error::NotFound)
        }
    };
    Ok(bill)
}

/// Fetches the last unpaid bill for a member from the DB.
pub fn get_last_this_year(connection: &SqliteConnection, member: &Member, year: i32) -> Result<Bill, Error> {
    let bill = {
        let mut bills = bills::table
            .filter(bills::columns::member_id.eq(member.id))
            .filter(bills::columns::year.eq(year))
            .load::<Bill>(connection)?;
        if bills.len() == 1 {
            bills.remove(0)
        } else {
            return Err(Error::NotFound)
        }
    };
    Ok(bill)
}

/// Creates a new bill in the DB.
pub fn create(connection: &SqliteConnection, new_bill: &NewBill) -> Result<Bill, diesel::result::Error> {
    diesel::insert_into(bills::table)
        .values(new_bill)
        .execute(connection)
        .expect("Error saving new bill.");
    bills::table.order(bills::columns::id.desc()).first(connection)
}

/// Updates a bill model in the DB.
pub fn update(connection: &SqliteConnection, bill: &Bill) -> Result<(), diesel::result::Error>{
    diesel::update(bill)
        .set(bill)
        .execute(connection).map(|_| ())
}

pub fn update_paid(connection: &SqliteConnection, bill: &Bill, amount: i32) -> Result<(), diesel::result::Error>{
    diesel::update(bill)
        .set(bills::columns::paid_amount.eq(amount))
        .execute(connection).map(|_| ())
}

pub fn confirm_paid(connection: &SqliteConnection, bill: &Bill) -> Result<(), diesel::result::Error>{
    diesel::update(bill)
        .set(bills::columns::paid.eq(true))
        .execute(connection).map(|_| ())
}

/// Generates a new bill at a due date.
/// This does not store the bill to the DB.
/// The procedure honors all sorts of special rules and is aware of reminder bills.
pub fn generate_bill(connection: &SqliteConnection, member: &Member, events: &Vec<Event>, date: &chrono::NaiveDate) -> Option<NewBill> {
    let events: Vec<_> = events
        .iter()
        .cloned()
        // .filter(|event| event.date <= *date)
        .collect();
    let tags = crate::members::actions::get_tags(member, &events);
    if crate::members::actions::is_paying(&tags) {
        use chrono::Datelike;
        let year = date.year();

        let last_bill = get_last_this_year(connection, member, year);

        let (number, paid_amount, bill_amount, bill_passport) = if let Ok(last_bill) = last_bill {
            // First bill this year was already created.
            
            // If bill this year was already paid, don't take action ofc.
            if last_bill.paid {
                return None;
            }

            // Make sure we advance the bill number to account for unpaid history.
            (last_bill.number + 1, last_bill.paid_amount, last_bill.bill_amount, last_bill.bill_passport)
        } else {
            // First bill this year.
            let year = date.year();
            let month = date.month();

            // Figure amount based on settings.
            let amount = match member.member_type {
                MemberType::Active => CONFIG.general.fee_actives,
                MemberType::Kid => CONFIG.general.fee_kids,
                MemberType::Student => CONFIG.general.fee_students,
                _ => 0,
            };

            // Return bill data factoring in month of the year for under year entries.
            // TODO: fix numbers after testing!
            let factor = if month <= 3 { 1.0 } else if month > 3 && month <= 9 { 0.5 } else { 1.0 };
            (0, 0, (amount as f32 * factor) as i32 , 0)
        };

        // If there was no passport ordered and no fee is due
        // (members with a passport and club entry in months 10 to 12), do not create a bill.
        if bill_amount == 0 && bill_passport == 0 {
            return None;
        }

        // Create a new bill.
        let bill = NewBill {
            member_id: member.id,
            year,
            number,
            bill_passport,
            bill_amount,
            paid_amount,
            paid: false,
            comment: String::default(),
        };

        return Some(bill);
    }
    return None;
}

pub fn generate_bills(connection: &SqliteConnection, date: &chrono::NaiveDate) {
    let members = crate::members::actions::list_all(connection).unwrap();

    let mut count = 0;
    for member in members {
        
        if let Some(bill) = generate_bill(connection, &member.0, &member.1, date) {
            create(connection, &bill);
            println!("{} {}", member.0.first_name, member.0.last_name);
            count += 1;
        }
    }

    println!("count: {}", count);
}