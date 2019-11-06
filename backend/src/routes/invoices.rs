use crate::invoices::actions::get_last_this_year;
use crate::error::Error;
use rocket::http::Status;
use rocket::request::Form;
use rocket::response::{Flash, Redirect};
use crate::user::User;

#[derive(FromForm)]
pub struct Update {
    invoice_passport: Option<i32>,
    invoice_amount: Option<i32>,
    paid_amount: Option<i32>,
    comment: Option<String>,
}

// _user: User,
#[post("/update/<id>", data = "<update>")]
pub fn update(id: i32, update: Form<Update>) -> Flash<Redirect> {
    let connection = crate::db::establish_connection();
    let mut invoice = crate::invoices::actions::get(&connection, id);
    match invoice {
        Ok(mut invoice) => {
            if let Some(invoice_passport) = update.invoice_passport {
                invoice.invoice_passport = invoice_passport;
            }
            if let Some(invoice_amount) = update.invoice_amount {
                invoice.invoice_amount = invoice_amount;
            }
            if let Some(paid_amount) = update.paid_amount {
                invoice.paid_amount = paid_amount;
            }
            if let Some(comment) = update.comment.clone() {
                invoice.comment = comment;
            }
            crate::invoices::actions::update(&connection, &invoice)
                .expect("Failed to update invoice.");

            Flash::success(
                Redirect::to("/members/stats"),
                "Successfully updated invoice.",
            )
        }
        Err(Error::Diesel(_)) => {
            Flash::error(Redirect::to("/members/stats"), "Internal Server Error")
        }
        Err(Error::NotFound) => Flash::error(Redirect::to("/members/stats"), "Invoice not found."),
    }
}

// _user: User,
#[post("/pay/<id>")]
pub fn pay(id: i32) -> Flash<Redirect> {
    let connection = crate::db::establish_connection();
    let mut invoice = crate::invoices::actions::get(&connection, id);
    dbg!(id);
    match invoice {
        Ok(mut invoice) => {
            invoice.paid = true;
            crate::invoices::actions::update(&connection, &invoice)
                .expect("Failed to update invoice.");

            Flash::success(
                Redirect::to("/members/stats"),
                "Successfully marked invoice as paid.",
            )
        }
        Err(Error::Diesel(_)) => {
            Flash::error(Redirect::to("/members/stats"), "Internal Server Error")
        }
        Err(Error::NotFound) => Flash::error(Redirect::to("/members/stats"), "Invoice not found."),
    }
}

#[post("/delete/<id>")]
pub fn delete(id: i32) -> Flash<Redirect> {
    let connection = crate::db::establish_connection();
    let mut invoice = crate::invoices::actions::get(&connection, id);
    match invoice {
        Ok(mut invoice) => {
            invoice.paid = true;
            crate::invoices::actions::delete(&connection, &invoice)
                .expect("Failed to delete invoice.");

            Flash::success(
                Redirect::to("/members/stats"),
                "Successfully deleted invoice.",
            )
        }
        Err(Error::Diesel(_)) => {
            Flash::error(Redirect::to("/members/stats"), "Internal Server Error")
        }
        Err(Error::NotFound) => Flash::error(Redirect::to("/members/stats"), "Invoice not found."),
    }
}

#[get("/pdf/<id>")]
pub fn pdf(id: i32) -> Result<crate::invoices::actions::InvoiceData, Status> {
    let connection = crate::db::establish_connection();
    let mut invoice = crate::invoices::actions::get(&connection, id);
    match invoice {
        Ok(mut invoice) => {
            let mut member = crate::members::actions::get(&connection, invoice.member_id)
                .unwrap()
                .0;
            Ok(crate::invoices::actions::InvoiceData { invoice, member })
        }
        Err(Error::Diesel(_)) => Err(Status::InternalServerError),
        Err(Error::NotFound) => Err(Status::NotFound),
    }
}

#[post("/generate_all")]
pub fn generate_all(_user: User) -> Redirect {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::generate_invoices(
        &connection,
        &chrono::Utc::now().date().naive_utc(),
        crate::invoices::actions::InvoiceType::All,
    );
    Redirect::to("/members/stats")
}

#[post("/generate_late_notice")]
pub fn generate_late_notice(_user: User) -> Redirect {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::generate_invoices(
        &connection,
        &chrono::Utc::now().date().naive_utc(),
        crate::invoices::actions::InvoiceType::LateNotice,
    );
    Redirect::to("/members/stats")
}

#[post("/generate_first")]
pub fn generate_first(_user: User) -> Redirect {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::generate_invoices(
        &connection,
        &chrono::Utc::now().date().naive_utc(),
        crate::invoices::actions::InvoiceType::First,
    );
    Redirect::to("/members/stats")
}

#[post("/send/<id>")]
pub fn send(_user: User, id: i32) -> Redirect {
    let connection = crate::db::establish_connection();
    let today = chrono::Utc::now().date().naive_utc();
    let last_invoice = crate::invoices::actions::get(&connection, id);
    // Diesel is retarded and does not implement Clone, so we are forced to use this for now.
    // TODO: FIX ASAP; MY EYES BLEED!
    let last_invoice2 = crate::invoices::actions::get(&connection, id);
    let member = crate::members::actions::get(&connection, last_invoice.unwrap().member_id).unwrap();
    crate::invoices::actions::send_invoice(
        &connection,
        &member.0,
        &today,
        last_invoice2,
        crate::invoices::actions::InvoiceType::All,
        false,
    );
    Redirect::to("/members/stats")
}

#[post("/send_all")]
pub fn send_all(_user: User) -> Redirect {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::send_invoices(
        &connection,
        crate::invoices::actions::InvoiceType::All,
        false,
    );
    Redirect::to("/members/stats")
}

#[post("/send_late_notice")]
pub fn send_late_notice(_user: User) -> Redirect {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::send_invoices(
        &connection,
        crate::invoices::actions::InvoiceType::LateNotice,
        false,
    );
    Redirect::to("/members/stats")
}

#[post("/send_first")]
pub fn send_first(_user: User) -> Redirect {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::send_invoices(
        &connection,
        crate::invoices::actions::InvoiceType::First,
        false,
    );
    Redirect::to("/members/stats")
}

// #[get("/generate_invoices", rank = 2)]
// pub fn generate_invoices_redirect() -> Redirect {
//     Redirect::to(uri!(crate::login::login_page))
// }
