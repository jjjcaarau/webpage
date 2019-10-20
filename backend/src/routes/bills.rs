use crate::error::Error;
use rocket::request::{Form};
use rocket::response::{Redirect, Flash};

#[derive(FromForm)]
pub struct Update {
    bill_passport: Option<i32>,
    bill_amount: Option<i32>,
    paid_amount: Option<i32>,
    comment: Option<String>,
}

// _user: crate::login::User, 
#[post("/update/<id>", data = "<update>")]
pub fn update(id: i32, update: Form<Update>) -> Flash<Redirect> {
    let connection = crate::db::establish_connection();
    let mut bill = crate::bills::actions::get(&connection, id);
    match bill {
        Ok(mut bill) => {
            if let Some(bill_passport) = update.bill_passport {
                bill.bill_passport = bill_passport;
            }
            if let Some(bill_amount) = update.bill_amount {
                bill.bill_amount = bill_amount;
            }
            if let Some(paid_amount) = update.paid_amount {
                bill.paid_amount = paid_amount;
            }
            if let Some(comment) = update.comment.clone() {
                bill.comment = comment;
            }
            crate::bills::actions::update(&connection, &bill)
                .expect("Failed to update bill.");
            
            Flash::success(Redirect::to("/members/stats"), "Successfully updated bill.")
        },
        Err(Error::Diesel(_)) => Flash::error(Redirect::to("/members/stats"), "Internal Server Error"),
        Err(Error::NotFound) => Flash::error(Redirect::to("/members/stats"), "Bill not found."),
    }
}

// _user: crate::login::User, 
#[post("/pay/<id>")]
pub fn pay(id: i32) -> Flash<Redirect> {
    let connection = crate::db::establish_connection();
    let mut bill = crate::bills::actions::get(&connection, id);
    dbg!(id);
    match bill {
        Ok(mut bill) => {
            bill.paid = true;
            crate::bills::actions::update(&connection, &bill)
                .expect("Failed to update bill.");
            
            Flash::success(Redirect::to("/members/stats"), "Successfully marked bill as paid.")
        },
        Err(Error::Diesel(_)) => Flash::error(Redirect::to("/members/stats"), "Internal Server Error"),
        Err(Error::NotFound) => Flash::error(Redirect::to("/members/stats"), "Bill not found."),
    }
}

#[post("/delete/<id>")]
pub fn delete(id: i32) -> Flash<Redirect> {
    let connection = crate::db::establish_connection();
    let mut bill = crate::bills::actions::get(&connection, id);
    match bill {
        Ok(mut bill) => {
            bill.paid = true;
            crate::bills::actions::delete(&connection, &bill)
                .expect("Failed to delete bill.");
            
            Flash::success(Redirect::to("/members/stats"), "Successfully deleted bill.")
        },
        Err(Error::Diesel(_)) => Flash::error(Redirect::to("/members/stats"), "Internal Server Error"),
        Err(Error::NotFound) => Flash::error(Redirect::to("/members/stats"), "Bill not found."),
    }
}

#[get("/pdf/<id>")]
pub fn pdf(id: i32) -> Flash<Redirect> {
    let connection = crate::db::establish_connection();
    let mut bill = crate::bills::actions::get(&connection, id);
    match bill {
        Ok(mut bill) => {
            let pdf = crate::bills::actions::generate_pdf(&connection, &bill);
            Flash::success(Redirect::to("/members/stats"), "Successfully marked bill as paid.")
        },
        Err(Error::Diesel(_)) => Flash::error(Redirect::to("/members/stats"), "Internal Server Error"),
        Err(Error::NotFound) => Flash::error(Redirect::to("/members/stats"), "Bill not found."),
    }
}