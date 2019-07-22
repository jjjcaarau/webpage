use rocket_contrib::templates::Template;
use std::collections::HashMap;

use pulldown_cmark::{
    Parser,
    Options,
    html
};

#[get("/")]
pub fn index() -> Template {

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
    Template::render("pages/index", &Blog {
        entries,
    })
}


#[get("/club")]
pub fn club() -> Template {
    Template::render("pages/club", &HashMap::<String, u8>::new())
}


#[get("/judo")]
pub fn judo() -> Template {
    Template::render("pages/judo", &HashMap::<String, u8>::new())
}


#[get("/jujitsu")]
pub fn jujitsu() -> Template {
    Template::render("pages/jujitsu", &HashMap::<String, u8>::new())
}


#[get("/kontakt")]
pub fn kontakt() -> Template {
    Template::render("pages/kontakt", &HashMap::<String, u8>::new())
}