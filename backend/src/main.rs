#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate diesel;
#[macro_use]
extern crate diesel_derive_enum;
#[macro_use]
extern crate derivative;
#[macro_use]
extern crate rocket;
extern crate rocket_contrib;
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate itertools;
#[macro_use]
extern crate lazy_static;
extern crate tera;

mod blog;
#[cfg(not(target_os = "windows"))]
mod commander;
mod config;
mod db;
mod email;
mod error;
mod events;
mod invoices;
mod login;
mod members;
mod routes;
mod schema;
mod tera_engine;
mod context;
mod user;

use crate::config::CONFIG;

use rocket_contrib::{serve::StaticFiles, templates::Template};

fn main() {
    let address = std::env::var("JJJCAARAU_WEB_ADDRESS").unwrap_or(CONFIG.rocket.address.clone());
    let port = std::env::var("JJJCAARAU_WEB_PORT")
        .and_then(|p: String| p.parse::<u16>().map_err(|_| std::env::VarError::NotPresent))
        .unwrap_or(CONFIG.rocket.port.clone());
    let static_root =
        std::env::var("JJJCAARAU_WEB_STATIC_ROOT").unwrap_or(CONFIG.rocket.static_root.clone());

    let config = rocket::config::Config::build(match CONFIG.rocket.environment {
        crate::config::Environment::Development => rocket::config::Environment::Development,
        crate::config::Environment::Staging => rocket::config::Environment::Staging,
        crate::config::Environment::Production => rocket::config::Environment::Production,
    })
    .address(&address)
    .port(port)
    .log_level(match CONFIG.rocket.log_level {
        log::Level::Error | log::Level::Warn => rocket::config::LoggingLevel::Critical,
        log::Level::Info => rocket::config::LoggingLevel::Normal,
        log::Level::Debug | log::Level::Trace => rocket::config::LoggingLevel::Debug,
    });
    let config = if let Some(secret_key) = CONFIG.rocket.secret_key.as_ref() {
        config.secret_key(secret_key)
    } else {
        config
    }
    .finalize()
    .expect("Failed to create rocket config.");

    #[cfg(not(target_os = "windows"))]
    let handle = commander::init();

    rocket::custom(config)
        .mount("/static", StaticFiles::from(static_root))
        .mount(
            "/members",
            routes![
                crate::routes::members::list,
                crate::routes::members::list_redirect,
                crate::routes::members::list_json,
                crate::routes::members::list_json_redirect,
                crate::routes::members::view_json,
                crate::routes::members::view_json_redirect,
                crate::routes::members::view,
                crate::routes::members::view_redirect,
                crate::routes::members::update_json,
                crate::routes::members::update_family_json,
                crate::routes::members::stats,
                crate::routes::members::stats_redirect,
                // crate::routes::members::generate_invoices_redirect,
            ],
        )
        .mount("/events", routes![crate::routes::events::create_json,])
        .mount(
            "/invoices",
            routes![
                crate::routes::invoices::update,
                crate::routes::invoices::pay,
                crate::routes::invoices::delete,
                crate::routes::invoices::pdf,
                crate::routes::invoices::generate_all,
                crate::routes::invoices::generate_first,
                crate::routes::invoices::generate_late_notice,
                crate::routes::invoices::send,
                crate::routes::invoices::send_all,
                crate::routes::invoices::send_first,
                crate::routes::invoices::send_late_notice,
            ],
        )
        .mount(
            "/blog",
            routes![
                crate::routes::blog::edit_get,
                crate::routes::blog::edit_post,
            ],
        )
        .mount(
            "/",
            routes![
                crate::routes::root::index,
                crate::routes::root::club,
                crate::routes::root::judo,
                crate::routes::root::jujitsu,
                crate::routes::root::kontakt,
                crate::login::login,
                crate::login::logout,
                crate::login::login_user,
                crate::login::login_page,
                crate::login::password_recovery_get,
                crate::login::password_recovery_post,
            ],
        )
        .attach(Template::fairing())
        .launch();
}
