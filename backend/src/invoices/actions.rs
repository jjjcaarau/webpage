use std::io::BufWriter;
use std::io::Write;
use std::process::{Command, Stdio};

use super::model::{Invoice, NewInvoice};
use crate::events::model::Event;
use crate::members::model::{Member, MemberType};
use crate::schema::{invoices};
use diesel::prelude::*;
use rocket::http::ContentType;
use rocket::http::Status;
use rocket::response::Responder;
use rocket::Request;
use rocket::Response;

use crate::error::Error;

use crate::config::CONFIG;

/// Fetches all known invoices from the DB.
pub fn _list_all(connection: &SqliteConnection) -> Result<Vec<Invoice>, diesel::result::Error> {
    let invoice_list = invoices::table
        .order_by(invoices::columns::id)
        .load::<Invoice>(connection)?;

    Ok(invoice_list)
}

/// Fetches an existing invoice from the DB.
pub fn get(connection: &SqliteConnection, id: i32) -> Result<Invoice, Error> {
    let invoice = {
        let mut invoices = invoices::table
            .filter(invoices::columns::id.eq(id))
            .load::<Invoice>(connection)?;
        if invoices.len() == 1 {
            invoices.remove(0)
        } else {
            return Err(Error::NotFound);
        }
    };
    Ok(invoice)
}

/// Fetches the last unpaid invoice for a member from the DB.
pub fn get_last_this_year(
    connection: &SqliteConnection,
    member: &Member,
    year: i32,
) -> Result<Invoice, Error> {
    let invoice = {
        let mut invoices = invoices::table
            .filter(invoices::columns::member_id.eq(member.id))
            .filter(invoices::columns::year.eq(year))
            .order_by(invoices::columns::number.desc())
            .load::<Invoice>(connection)?;
        if invoices.len() > 0 {
            invoices.remove(0)
        } else {
            return Err(Error::NotFound);
        }
    };
    Ok(invoice)
}

/// Creates a new invoice in the DB.
pub fn create(
    connection: &SqliteConnection,
    new_invoice: &NewInvoice,
) -> Result<Invoice, diesel::result::Error> {
    diesel::insert_into(invoices::table)
        .values(new_invoice)
        .execute(connection)
        .expect("Error saving new invoice.");
    invoices::table
        .order(invoices::columns::id.desc())
        .first(connection)
}

/// Updates a invoice model in the DB.
pub fn update(
    connection: &SqliteConnection,
    invoice: &Invoice,
) -> Result<(), diesel::result::Error> {
    diesel::update(invoice)
        .set(invoice)
        .execute(connection)
        .map(|_| ())
}

pub fn _update_paid(
    connection: &SqliteConnection,
    invoice: &Invoice,
    amount: i32,
) -> Result<(), diesel::result::Error> {
    diesel::update(invoice)
        .set(invoices::columns::amount_paid.eq(amount))
        .execute(connection)
        .map(|_| ())
}

pub fn _confirm_paid(
    connection: &SqliteConnection,
    invoice: &Invoice,
) -> Result<(), diesel::result::Error> {
    diesel::update(invoice)
        .set(invoices::columns::paid.eq(true))
        .execute(connection)
        .map(|_| ())
}

pub fn delete(
    connection: &SqliteConnection,
    invoice: &Invoice,
) -> Result<(), diesel::result::Error> {
    diesel::delete(invoice).execute(connection).map(|_| ())
}

#[derive(Copy, Clone, Debug)]
pub enum InvoiceType {
    First,
    LateNotice,
    All,
}

/// Generates a new invoice at a due date.
/// This does not store the invoice to the DB.
/// The procedure honors all sorts of special rules and is aware of reminder invoices.
pub fn generate_invoice(
    connection: &SqliteConnection,
    member: &Member,
    events: &Vec<Event>,
    date: &chrono::NaiveDate,
) -> Option<(NewInvoice, chrono::NaiveDate)> {
    let events: Vec<_> = events
        .iter()
        .cloned()
        // .filter(|event| event.date <= *date)
        .collect();
    let tags = crate::members::actions::get_tags(member, &events);
    if crate::members::actions::is_paying(&tags) {
        use chrono::Datelike;
        let year = date.year();

        let last_invoice = get_last_this_year(connection, member, year);

        let (
            last_due_date,
            number,
            amount_paid,
            amount_membership,
            amount_passport,
            amount_rebate,
            percentage_rebate,
            rebate_reason,
        ) = if let Ok(last_invoice) = last_invoice {
            // First invoice this year was already created.

            // If invoice this year was already paid, don't take action ofc.
            if last_invoice.paid {
                return None;
            }

            // Make sure we advance the invoice number to account for unpaid history.
            (
                last_invoice.due_date,
                last_invoice.number + 1,
                last_invoice.amount_paid,
                last_invoice.amount_membership,
                last_invoice.amount_passport,
                last_invoice.amount_rebate,
                last_invoice.percentage_rebate,
                last_invoice.rebate_reason,
            )
        } else {
            // First invoice this year.
            let month = date.month();

            // Figure amount based on settings.
            let amount = match member.member_type {
                MemberType::Active => CONFIG.general.fee_actives,
                MemberType::Kid => CONFIG.general.fee_kids,
                MemberType::Student => CONFIG.general.fee_students,
                _ => 0,
            };

            // Return invoice data factoring in month of the year for under year entries.
            // TODO: fix numbers after testing!
            let factor = if month <= 3 {
                1.0
            } else if month > 3 && month <= 9 {
                0.5
            } else {
                1.0
            };
            (chrono::Utc::now().date().naive_utc(), 0, 0, (amount as f32 * factor) as i32, 0, 0, 0, String::new())
        };

        // If there was no passport ordered and no fee is due
        // (members with a passport and club entry in months 10 to 12), do not create a invoice.
        if amount_membership == 0 && amount_passport == 0 {
            return None;
        }

        let due_date = date.clone() + chrono::Duration::days(30);

        // Create a new invoice.
        let invoice = NewInvoice {
            member_id: member.id,
            year,
            date: date.clone(),
            due_date,
            sent: None,
            sent_as: Default::default(),
            number,
            amount_passport,
            amount_membership,
            amount_paid,
            amount_rebate,
            percentage_rebate,
            rebate_reason,
            paid: false,
            comment: String::default(),
        };

        return Some((invoice, last_due_date));
    }
    return None;
}

fn try_generate_late_notice(
    connection: &SqliteConnection,
    last_due_date: &chrono::NaiveDate,
    invoice: &NewInvoice,
    member: &Member,
) -> bool {
    if invoice.number > 0 && last_due_date < &chrono::Utc::now().date().naive_utc() {
        create(connection, &invoice).unwrap();
        println!(
            "Generated {}. late notice for {} {}.",
            invoice.number, member.first_name, member.last_name
        );
        true
    } else {
        false
    }
}

fn try_generate_first(
    connection: &SqliteConnection,
    invoice: &NewInvoice,
    member: &Member,
) -> bool {
    if invoice.number == 0 {
        create(connection, &invoice).unwrap();
        println!(
            "Generated first invoice for {} {}.",
            member.first_name, member.last_name
        );
        true
    } else {
        false
    }
}

pub fn generate_invoices(
    connection: &SqliteConnection,
    date: &chrono::NaiveDate,
    invoice_type: InvoiceType,
) {
    let members = crate::members::actions::list_all(connection).unwrap();

    let mut count = 0;
    for member in members {
        if let Some((invoice, last_due_date)) = generate_invoice(connection, &member.0, &member.1, date) {
            match invoice_type {
                InvoiceType::All => {
                    count += if try_generate_late_notice(connection, &last_due_date, &invoice, &member.0) {
                        1
                    } else {
                        0
                    };
                    count += if try_generate_first(connection, &invoice, &member.0) {
                        1
                    } else {
                        0
                    };
                }
                InvoiceType::First => {
                    count += if try_generate_first(connection, &invoice, &member.0) {
                        1
                    } else {
                        0
                    };
                }
                InvoiceType::LateNotice => {
                    count += if try_generate_late_notice(connection, &last_due_date, &invoice, &member.0) {
                        1
                    } else {
                        0
                    };
                }
            }
        }
    }

    println!("Generated {} invoices.", count);
}

pub fn send_invoice(
    connection: &SqliteConnection,
    member: &Member,
    today: &chrono::NaiveDate,
    last_invoice: Result<Invoice, Error>,
    invoice_type: InvoiceType,
    force: bool,
) -> bool {
    // Check if the invoice to send even exists.
    if let Ok(mut last_invoice) = last_invoice {
        match invoice_type {
            InvoiceType::All => {}
            // If we only want to send first time invoices and the invoice is not of that type, return false.
            InvoiceType::First => {
                if last_invoice.number > 0 {
                    return false;
                }
            }
            // If we only want to send late notice invoices and the invoice is not of that type, return false.
            InvoiceType::LateNotice => {
                if last_invoice.number == 0 {
                    return false;
                }
            }
        }

        // If we do not want to force send, we do not send again sent invoices.
        if !force && last_invoice.sent.is_some() {
            log::info!("Invoice was already sent. Not sending it again.");
            return false;
        }

        // Try send the email.
        let mut context = tera::Context::new();
        context.insert("member", &member);
        let render = crate::tera_engine::TERA.render("invoice_email.tera", &context).unwrap();

        println!("{}", &render);

        // All checks have passed until here, so try send the email.
        let mut pdf_stream = generate_pdf(&crate::invoices::actions::InvoiceData { invoice: last_invoice.clone(), member: member.clone() });
        let mut pdf_data = vec![];
        use std::io::Read;
        pdf_stream.read_to_end(&mut pdf_data).unwrap();
        if crate::email::send(
            CONFIG.general.email.clone(),
            member.email.clone(),
            "Neue Mitgliederrechnung".into(),
            render,
            Some((
                &pdf_data,
                "Rechnung.pdf"
            ))
        )
        .is_ok()
        {
            // If all checks are passed, update the sent date for the DB entry of the invoice.
            last_invoice.sent = Some(*today);
            update(connection, &last_invoice).unwrap();
            true
        } else {
            false
        }
    } else {
        false
    }
}

pub fn send_invoices(connection: &SqliteConnection, invoice_type: InvoiceType, force: bool) {
    let members = crate::members::actions::list_all(connection).unwrap();

    let mut count = 0;
    for member in members {
        use chrono::Datelike;
        let today = chrono::Utc::now().date().naive_utc();
        let year = today.year();
        let last_invoice = get_last_this_year(connection, &member.0, year);
        if send_invoice(
            connection,
            &member.0,
            &today,
            last_invoice,
            invoice_type,
            force,
        ) {
            count += 1;
            log::info!("Sent invoice to {}.", member.0.email);
        }
    }

    println!("Sent {} invoices.", count);
}

#[derive(Debug, Serialize)]
pub struct InvoiceData {
    pub invoice: crate::invoices::model::Invoice,
    pub member: crate::members::model::Member,
}

impl Responder<'static> for InvoiceData {
    fn respond_to(self, _req: &Request) -> Result<Response<'static>, Status> {
        let stdout = generate_pdf(&self);

        Response::build()
            .header(ContentType::new("application", "pdf"))
            .streamed_body(stdout)
            .ok()
    }
}

pub fn generate_pdf(data: &InvoiceData) -> std::process::ChildStdout {
    let normal_total = (data.invoice.amount_passport + data.invoice.amount_membership) as f32;
    let percentage_total = (normal_total * (1.0 - (data.invoice.percentage_rebate as f32 / 100.0)) as f32) as i32;
    let total = percentage_total - data.invoice.amount_rebate - data.invoice.amount_paid;

    let mut context = tera::Context::new();
    context.insert("invoice", &data.invoice);
    context.insert("member", &data.member);
    context.insert("invoice_total", &total);
    let render = crate::tera_engine::TERA.render("invoice.html.tera", &context).unwrap();

    let weasyprint = Command::new("python3")
        .args(&["-m", "weasyprint"])
        .args(&["-f", "pdf"])
        .args(&["-e", "utf8"])
        .arg("-")
        .arg("-")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .spawn()
        .expect("failed to execute process");

    let mut stdin = weasyprint.stdin.unwrap();
    let stdout = weasyprint.stdout.unwrap();
    let mut writer = BufWriter::new(&mut stdin);

    writer.write_all(&render.into_bytes()).unwrap();

    stdout
}
