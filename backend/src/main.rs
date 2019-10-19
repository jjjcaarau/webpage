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

mod config;
mod db;
mod members;
mod events;
mod schema;
mod routes;
mod blog;
mod login;
mod email;

use crate::config::CONFIG;

use rocket_contrib::{
    templates::Template,
    serve::StaticFiles,
};

fn main() {
    let config = rocket::config::Config::build(match CONFIG.rocket.environment {
        crate::config::Environment::Development => rocket::config::Environment::Development,
        crate::config::Environment::Staging => rocket::config::Environment::Staging,
        crate::config::Environment::Production => rocket::config::Environment::Production,
    })
    .address(&CONFIG.rocket.address)
        .port(CONFIG.rocket.port)
        .log_level(match CONFIG.rocket.log_level {
            log::Level::Error | log::Level::Warn => rocket::config::LoggingLevel::Critical,
            log::Level::Info => rocket::config::LoggingLevel::Normal,
            log::Level::Debug | log::Level::Trace => rocket::config::LoggingLevel::Debug,
        })
        .finalize()
        .expect("Failed to create rocket config.");
    rocket::custom(config)
        .mount("/static", StaticFiles::from(&CONFIG.rocket.static_root))
        .mount("/members", routes![
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
        ])
        .mount("/events", routes![
            crate::routes::events::create_json,
        ])
        .mount("/blog", routes![
            crate::routes::blog::edit_get,
            crate::routes::blog::edit_post,
        ])
        .mount("/", routes![
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
        ])
        .attach(Template::fairing())
        .launch();
}