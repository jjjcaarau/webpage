use crate::invoices::model::Invoice;
use crate::members::model::Member;
use rocket::http::Status;
use rocket::request::Form;
use rocket::response::{Flash, Redirect};
use crate::error::Error;
use crate::user::User;
use rocket_contrib::templates::Template;
use crate::context::Context;

#[derive(FromForm)]
pub struct Update {
    amount_passport: Option<i32>,
    amount_membership: Option<i32>,
    amount_paid: Option<i32>,
    amount_rebate: Option<i32>,
    percentage_rebate: Option<i32>,
    rebate_reason: Option<String>,
    comment: Option<String>,
    paid: Option<bool>,
}

// _user: User,
#[post("/update/<id>", data = "<update>")]
pub fn update(id: i32, update: Form<Update>) -> Flash<Redirect> {
    let connection = crate::db::establish_connection();
    let invoice = crate::invoices::actions::get(&connection, id);
    match invoice {
        Ok(mut invoice) => {
            if let Some(amount_passport) = update.amount_passport {
                invoice.amount_passport = amount_passport;
            }
            if let Some(amount_membership) = update.amount_membership {
                invoice.amount_membership = amount_membership;
            }
            if let Some(amount_paid) = update.amount_paid {
                invoice.amount_paid = amount_paid;
            }
            if let Some(amount_rebate) = update.amount_rebate {
                invoice.amount_rebate = amount_rebate;
            }
            if let Some(percentage_rebate) = update.percentage_rebate {
                invoice.percentage_rebate = percentage_rebate;
            }
            if let Some(rebate_reason) = update.rebate_reason.clone() {
                invoice.rebate_reason = rebate_reason;
            }
            if let Some(comment) = update.comment.clone() {
                invoice.comment = comment;
            }
            if let Some(paid) = update.paid {
                invoice.paid = paid;
            }
            crate::invoices::actions::update(&connection, &invoice)
                .expect("Failed to update invoice.");

            Flash::success(
                Redirect::to("/invoices/manage"),
                "Successfully updated invoice.",
            )
        }
        Err(Error::Diesel(_)) => {
            Flash::error(Redirect::to("/invoices/manage"), "Internal Server Error")
        }
        Err(Error::NotFound) => Flash::error(Redirect::to("/invoices/manage"), "Invoice not found."),
    }
}

// _user: User,
#[post("/pay/<id>")]
pub fn pay(id: i32) -> Flash<Redirect> {
    let connection = crate::db::establish_connection();
    let invoice = crate::invoices::actions::get(&connection, id);
    match invoice {
        Ok(mut invoice) => {
            invoice.paid = true;
            crate::invoices::actions::update(&connection, &invoice)
                .expect("Failed to update invoice.");

            Flash::success(
                Redirect::to("/invoices/manage"),
                "Successfully marked invoice as paid.",
            )
        }
        Err(Error::Diesel(_)) => {
            Flash::error(Redirect::to("/invoices/manage"), "Internal Server Error")
        }
        Err(Error::NotFound) => Flash::error(Redirect::to("/invoices/manage"), "Invoice not found."),
    }
}

#[post("/delete/<id>")]
pub fn delete(id: i32) -> Flash<Redirect> {
    let connection = crate::db::establish_connection();
    let invoice = crate::invoices::actions::get(&connection, id);
    match invoice {
        Ok(mut invoice) => {
            invoice.paid = true;
            crate::invoices::actions::delete(&connection, &invoice)
                .expect("Failed to delete invoice.");

            Flash::success(
                Redirect::to("/invoices/manage"),
                "Successfully deleted invoice.",
            )
        }
        Err(Error::Diesel(_)) => {
            Flash::error(Redirect::to("/invoices/manage"), "Internal Server Error")
        }
        Err(Error::NotFound) => Flash::error(Redirect::to("/invoices/manage"), "Invoice not found."),
    }
}

#[get("/pdf/<id>")]
pub fn pdf(id: i32) -> Result<crate::invoices::actions::YearlyInvoiceData, Status> {
    let connection = crate::db::establish_connection();
    let invoice = crate::invoices::actions::get(&connection, id);
    match invoice {
        Ok(invoice) => {
            let member = crate::members::actions::get(&connection, invoice.member_id)
                .unwrap()
                .0;
            Ok(crate::invoices::actions::YearlyInvoiceData { invoice, member })
        }
        Err(Error::Diesel(_)) => Err(Status::InternalServerError),
        Err(Error::NotFound) => Err(Status::NotFound),
    }
}

#[derive(FromForm, Debug, Serialize)]
pub struct Generate {
    pub name: String,
    pub address: String,
    pub zip_code: String,
    pub city: String,
    pub date: Option<String>,
    pub due_date: Option<String>,
    pub title: String,
    pub text: String,
    pub position1: Option<String>,
    pub position_amount1: Option<i32>,
    pub position2: Option<String>,
    pub position_amount2: Option<i32>,
    pub position3: Option<String>,
    pub position_amount3: Option<i32>,
    pub position4: Option<String>,
    pub position_amount4: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct Invoices {
    pub invoices: Vec<(Invoice, Member)>,
}

#[get("/manage")]
pub fn manage(user: User) -> Result<Template, Status> {
    let connection = crate::db::establish_connection();
    let invoices = crate::invoices::actions::list_all_unpaid(&connection);
    match invoices {
        Ok(invoices) => {
            Ok(Template::render("pages/invoices/manage", Context::new(Some(user), Invoices { invoices })))
        }
        Err(_) => Err(Status::InternalServerError),
    }
}

#[get("/generate")]
pub fn generate_get(user: User) -> Template {
    Template::render("pages/invoices/generate", Context::new(Some(user), std::collections::HashMap::<u32, u32>::new()))
}

#[post("/generate", data = "<generate>")]
pub fn generate_post(_user: User, generate: Form<Generate>) -> Generate {
    generate.0
}

#[derive(FromForm, Debug)]
pub struct GenerateYearly {
    date: String,
    today: bool,
}

#[post("/generate_all", data = "<generate>")]
pub fn generate_all(_user: User, generate: Form<GenerateYearly>) -> Redirect {
    let date = if generate.today {
        chrono::Utc::now().date().naive_utc()
    } else {
        chrono::NaiveDate::parse_from_str(&generate.date, "%Y-%m-%d").unwrap()
    };
    let connection = crate::db::establish_connection();
    crate::invoices::actions::generate_invoices(
        &connection,
        &date,
        crate::invoices::actions::InvoiceType::All,
    );
    Redirect::to("/members/stats")
}

#[post("/generate_late_notice", data = "<generate>")]
pub fn generate_late_notice(_user: User, generate: Form<GenerateYearly>) -> Redirect {
    let date = if generate.today {
        chrono::Utc::now().date().naive_utc()
    } else {
        chrono::NaiveDate::parse_from_str(&generate.date, "%Y-%m-%d").unwrap()
    };
    let connection = crate::db::establish_connection();
    crate::invoices::actions::generate_invoices(
        &connection,
        &date,
        crate::invoices::actions::InvoiceType::LateNotice,
    );
    Redirect::to("/members/stats")
}

#[post("/generate_first", data = "<generate>")]
pub fn generate_first(_user: User, generate: Form<GenerateYearly>) -> Redirect {
    let date = if generate.today {
        chrono::Utc::now().date().naive_utc()
    } else {
        chrono::NaiveDate::parse_from_str(&generate.date, "%Y-%m-%d").unwrap()
    };
    let connection = crate::db::establish_connection();
    crate::invoices::actions::generate_invoices(
        &connection,
        &date,
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
