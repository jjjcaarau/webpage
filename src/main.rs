#![feature(proc_macro_hygiene, decl_macro)]#[macro_use]

extern crate diesel;
#[macro_use]
extern crate diesel_derive_enum;
#[macro_use]
extern crate derivative;
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;
#[macro_use]
extern crate serde_derive;

mod db;
mod members;
mod events;
mod schema;
mod routes;

use rocket_contrib::{
    templates::Template,
    serve::StaticFiles,
};


// fn main() {
//     let connection = crate::db::establish_connection();
//     crate::members::actions::list_all(&connection);
//     let mut new_member = crate::members::model::NewMember::new();
//     new_member.first_name = "Adio".into();
//     new_member.last_name = "Gabrielli".into();
//     crate::members::actions::create_member(&connection, new_member);
// }

fn main() {
    rocket::ignite()
        .mount("/static", StaticFiles::from(concat!(env!("CARGO_MANIFEST_DIR"), "/static")))
        .mount("/members", routes![
            crate::routes::members::list,
            crate::routes::members::list_json,
            crate::routes::members::view,
            // crate::routes::members::update,
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