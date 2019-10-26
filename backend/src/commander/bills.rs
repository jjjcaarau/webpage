pub fn generate_all() {
    let connection = crate::db::establish_connection();
    crate::bills::actions::generate_bills(
        &connection,
        &chrono::Utc::now().date().naive_utc(),
        crate::bills::actions::BillType::All
    );
}

pub fn generate_late_notice() {
    let connection = crate::db::establish_connection();
    crate::bills::actions::generate_bills(
        &connection,
        &chrono::Utc::now().date().naive_utc(),
        crate::bills::actions::BillType::LateNotice
    );
}

pub fn generate_first() {
    let connection = crate::db::establish_connection();
    crate::bills::actions::generate_bills(
        &connection,
        &chrono::Utc::now().date().naive_utc(),
        crate::bills::actions::BillType::First
    );
}

pub fn send_all() {
    let connection = crate::db::establish_connection();
    unimplemented!();
}

pub fn send_late_notice() {
    let connection = crate::db::establish_connection();
    unimplemented!();
}

pub fn send_first() {
    let connection = crate::db::establish_connection();
    unimplemented!();
}