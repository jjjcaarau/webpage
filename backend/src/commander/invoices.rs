pub fn generate_all() {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::generate_invoices(
        &connection,
        &chrono::Utc::now().date().naive_utc(),
        crate::invoices::actions::InvoiceType::All
    );
}

pub fn generate_late_notice() {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::generate_invoices(
        &connection,
        &chrono::Utc::now().date().naive_utc(),
        crate::invoices::actions::InvoiceType::LateNotice
    );
}

pub fn generate_first() {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::generate_invoices(
        &connection,
        &chrono::Utc::now().date().naive_utc(),
        crate::invoices::actions::InvoiceType::First
    );
}

pub fn send_all(force: bool) {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::send_invoices(
        &connection,
        crate::invoices::actions::InvoiceType::All,
        force
    );
}

pub fn send_late_notice(force: bool) {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::send_invoices(
        &connection,
        crate::invoices::actions::InvoiceType::LateNotice,
        force
    );
}

pub fn send_first(force: bool) {
    let connection = crate::db::establish_connection();
    crate::invoices::actions::send_invoices(
        &connection,
        crate::invoices::actions::InvoiceType::First,
        force
    );
}