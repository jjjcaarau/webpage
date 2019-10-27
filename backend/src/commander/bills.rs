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

pub fn send_all(force: bool) {
    let connection = crate::db::establish_connection();
    crate::bills::actions::send_bills(
        &connection,
        crate::bills::actions::BillType::All,
        force
    );
}

pub fn send_late_notice(force: bool) {
    let connection = crate::db::establish_connection();
    crate::bills::actions::send_bills(
        &connection,
        crate::bills::actions::BillType::LateNotice,
        force
    );
}

pub fn send_first(force: bool) {
    let connection = crate::db::establish_connection();
    crate::bills::actions::send_bills(
        &connection,
        crate::bills::actions::BillType::First,
        force
    );
}