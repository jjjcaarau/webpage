use crate::members::actions::{is_kid, is_student, is_active};
use crate::routes::invoices::Generate;
use std::io::BufWriter;
use std::io::Write;
use std::process::{Command, Stdio};

use super::model::{Invoice, NewInvoice};
use crate::events::model::Event;
use crate::members::model::{Member, Tag, Grade};
use crate::schema::invoices;
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

pub fn list_all_unpaid(connection: &SqliteConnection) -> Result<Vec<(Invoice, Member)>, diesel::result::Error> {
    let invoice_list = invoices::table
        .order_by(invoices::columns::id)
        .filter(invoices::columns::paid.eq(false))
        .load::<Invoice>(connection)?;

    let invoice_list = invoice_list.into_iter().map(|invoice| {
        let member_data = crate::members::actions::get(connection, invoice.member_id).unwrap();
        (
            invoice,
            member_data.0,
        )
    }).collect();

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

pub fn confirm_paid(
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
) -> Option<NewInvoice> {
    let tags = crate::members::actions::get_tags(member, &events, date);
    use chrono::Datelike;
    let year = date.year();
    let last_invoice = get_last_this_year(connection, member, year);
    if !events.is_empty() && crate::members::actions::is_paying(&tags) && last_invoice.is_err() {
        // First invoice this year.
        let month = date.month();

        // Figure amount based on settings.
        let amount = if is_kid(&tags) {
            CONFIG.general.fee_kids
        } else if is_student(&tags) {
            CONFIG.general.fee_students
        } else if is_active(&tags) {
            CONFIG.general.fee_actives
        } else {
            0
        };

        let mut needs_passport = false;
        for tag in tags {
            if let Tag::Grade(grade) = tag {
                match grade {
                    Grade::Kyu(_division, n) => if n > 5 { needs_passport = true; },
                    Grade::Dan(_division, _n) => (),
                }
            }
        }

        // Return invoice data factoring in month of the year for under year entries.
        let factor = if month <= 3 {
            1.0
        } else if month > 3 && month <= 9 {
            0.5
        } else {
            // If there was no passport ordered and no fee is due
            // (members with a passport and club entry in months 10 to 12), do not create a invoice.
            return None;
        };

        // Create a new invoice.
        Some(NewInvoice {
            member_id: member.id,
            year,
            date: date.clone(),
            due_date: date.clone() + chrono::Duration::days(CONFIG.general.grace_period),
            sent: None,
            sent_as: Default::default(),
            number: 0,
            amount_passport: if needs_passport { CONFIG.general.fee_passport } else { 0 },
            amount_membership: (amount as f32 * factor) as i32,
            amount_paid: 0,
            amount_rebate: 0,
            percentage_rebate: 0,
            rebate_reason: String::new(),
            paid: false,
            comment: String::default(),
        })
    } else {
        None
    }
}

/// Creates a new invoice data object as a late notice from an existing invoice.
pub fn generate_late_notice(
    member: &Member,
    last_invoice: &Invoice,
    date: &chrono::NaiveDate,
) -> NewInvoice {
    NewInvoice {
        member_id: member.id,
        year: last_invoice.year,
        date: date.clone(),
        due_date: date.clone() + chrono::Duration::days(CONFIG.general.grace_period_late),
        sent: None,
        sent_as: Default::default(),
        number: last_invoice.number + 1,
        amount_passport: last_invoice.amount_passport,
        amount_membership: last_invoice.amount_membership,
        amount_paid: last_invoice.amount_paid,
        amount_rebate: last_invoice.amount_rebate,
        percentage_rebate: last_invoice.percentage_rebate,
        rebate_reason: last_invoice.rebate_reason.clone(),
        paid: false,
        comment: String::default(),
    }
}

/// Tries to create a new database entry for the given invoice.
/// Returns an Error if it fails.
fn try_create_late_notice(
    connection: &SqliteConnection,
    invoice: &NewInvoice,
    last_invoice: &Invoice,
    member: &Member,
) -> crate::error::Result<()> {
    if invoice.number > 0 && last_invoice.due_date < chrono::Utc::now().date().naive_utc() {
        create(connection, &invoice)?;
        confirm_paid(connection, last_invoice)?;
        println!(
            "Generated {}. late notice for {} {}.",
            invoice.number, member.first_name, member.last_name
        );
        Ok(())
    } else {
        Err(Error::NotDue)
    }
}

fn try_create_first(
    connection: &SqliteConnection,
    invoice: &NewInvoice,
    member: &Member,
) -> crate::error::Result<()> {
    if invoice.number == 0 {
        create(connection, &invoice)?;
        println!(
            "Generated first invoice for {} {}.",
            member.first_name, member.last_name
        );
        Ok(())
    } else {
        Err(Error::NotDue)
    }
}

pub fn generate_invoices(
    connection: &SqliteConnection,
    date: &chrono::NaiveDate,
    invoice_type: InvoiceType,
) {
    let members = crate::members::actions::list_all(connection).unwrap();

    let mut count = 0;
    match invoice_type {
        InvoiceType::All | InvoiceType::First => {
            for member in members {
                if let Some(invoice) = generate_invoice(connection, &member.0, &member.1, date) {
                    count += if try_create_first(connection, &invoice, &member.0).is_ok() {
                        1
                    } else {
                        0
                    };
                }
            }
        },
        _ => (),
    }

    println!("Generated {} invoices.", count);

    count = 0;
    match invoice_type {
        InvoiceType::All | InvoiceType::LateNotice => {
            let unpaid = list_all_unpaid(connection).unwrap();
            for (last_invoice, member) in unpaid {
                let invoice = generate_late_notice(&member, &last_invoice, date);
                count += if try_create_late_notice(connection, &invoice, &last_invoice, &member).is_ok() {
                    1
                } else {
                    0
                };
            }
        },
        _ => (),
    }

    println!("Generated {} late notices.", count);
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
        let mut pdf_stream = generate_yearly_pdf(&crate::invoices::actions::YearlyInvoiceData { invoice: last_invoice.clone(), member: member.clone() });
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
pub struct YearlyInvoiceData {
    pub invoice: crate::invoices::model::Invoice,
    pub member: crate::members::model::Member,
}

impl Responder<'static> for YearlyInvoiceData {
    fn respond_to(self, _req: &Request) -> Result<Response<'static>, Status> {
        let stdout = generate_yearly_pdf(&self);

        Response::build()
            .header(ContentType::new("application", "pdf"))
            .streamed_body(stdout)
            .ok()
    }
}

pub fn generate_yearly_pdf(data: &YearlyInvoiceData) -> std::process::ChildStdout {
    let normal_total = (data.invoice.amount_passport + data.invoice.amount_membership) as f32;
    let percentage_total = (normal_total * (1.0 - (data.invoice.percentage_rebate as f32 / 100.0)) as f32) as i32;
    let total = percentage_total - data.invoice.amount_rebate - data.invoice.amount_paid;

    let mut context = tera::Context::new();
    context.insert("invoice", &data.invoice);
    context.insert("member", &data.member);
    context.insert("invoice_total", &total);
    let render = crate::tera_engine::TERA.render("invoice_yearly.html.tera", &context).unwrap();

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

impl Responder<'static> for Generate {
    fn respond_to(self, _req: &Request) -> Result<Response<'static>, Status> {
        let stdout = generate_pdf(&self);

        Response::build()
            .header(ContentType::new("application", "pdf"))
            .streamed_body(stdout)
            .ok()
    }
}

pub fn generate_pdf(data: &Generate) -> std::process::ChildStdout {
    let total = data.position_amount1.unwrap_or(0)
              + data.position_amount2.unwrap_or(0)
              + data.position_amount3.unwrap_or(0)
              + data.position_amount4.unwrap_or(0);


    let date = chrono::Utc::now().date().naive_utc();
    let due_date = chrono::Utc::now().date().naive_utc() + chrono::Duration::days(CONFIG.general.grace_period);

    let mut context = tera::Context::new();
    context.insert("data", &data);
    context.insert("total", &total);
    context.insert("date", &date);
    context.insert("due_date", &due_date);
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
