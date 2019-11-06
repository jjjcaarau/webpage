use rocket_contrib::templates::Template;
use std::collections::HashMap;

use pulldown_cmark::{html, Options, Parser};

use crate::context::Context;
use crate::user::MaybeUser;

#[get("/")]
pub fn index(maybe_user: MaybeUser) -> Template {
    #[derive(Deserialize, Serialize)]
    pub struct Blog {
        pub entries: Vec<crate::blog::entry::Entry>,
    }

    let entries = crate::blog::get_entries()
        .into_iter()
        .map(|mut entry| {
            let mut options = Options::empty();
            options.insert(Options::ENABLE_TABLES);
            let parser = Parser::new_ext(&entry.body, options);

            let mut body = String::new();
            html::push_html(&mut body, parser);
            entry.body = body;
            entry
        })
        .collect();
    Template::render("pages/index", Context::new(*maybe_user, &Blog { entries }))
}

#[get("/club")]
pub fn club(maybe_user: MaybeUser) -> Template {
    Template::render("pages/club", Context::new(*maybe_user, &HashMap::<String, u8>::new()))
}

#[get("/judo")]
pub fn judo(maybe_user: MaybeUser) -> Template {
    Template::render("pages/judo", Context::new(*maybe_user, &HashMap::<String, u8>::new()))
}

#[get("/jujitsu")]
pub fn jujitsu(maybe_user: MaybeUser) -> Template {
    Template::render("pages/jujitsu", Context::new(*maybe_user, &HashMap::<String, u8>::new()))
}

#[get("/kontakt")]
pub fn kontakt(maybe_user: MaybeUser) -> Template {
    Template::render("pages/kontakt", Context::new(*maybe_user, &HashMap::<String, u8>::new()))
}
