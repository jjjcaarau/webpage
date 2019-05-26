#![feature(proc_macro_hygiene, decl_macro)]#[macro_use]

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

mod db;
mod members;
mod events;
mod schema;
mod routes;

use rocket_contrib::{
    templates::Template,
    serve::StaticFiles,
};

fn main() {
    rocket::ignite()
        .mount("/static", StaticFiles::from(concat!(env!("CARGO_MANIFEST_DIR"), "/../static")))
        .mount("/members", routes![
            crate::routes::members::list,
            crate::routes::members::list_json,
            crate::routes::members::view_json,
            crate::routes::members::view,
            crate::routes::members::update_json,
            crate::routes::members::update_family_json,
            crate::routes::members::stats,
        ])
        .mount("/events", routes![
            crate::routes::events::create_json,
        ])
        .mount("/", routes![
            crate::routes::root::index,
            crate::routes::root::club,
            crate::routes::root::judo,
            crate::routes::root::jujitsu,
            crate::routes::root::kontakt,
        ])
        .attach(Template::fairing())
        .launch();
}