use rocket_contrib::templates::Template;
use std::collections::HashMap;

#[get("/")]
pub fn index() -> Template {
    Template::render("pages/club", &HashMap::<String, u8>::new())
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