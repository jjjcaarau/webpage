use crate::blog::entry::Entry;
use rocket_contrib::json::Json;
use rocket_contrib::templates::Template;
use std::io::Write;

use crate::config::CONFIG;

#[get("/edit/<date>")]
pub fn edit_get(date: Option<String>) -> Template {
    let entry = if let Some(date) = date {
        Entry::new_from_path(CONFIG.general.blog_root.clone() + &date + ".md")
    } else {
        Entry::new()
    };

    Template::render("pages/blog/edit", &entry)
}

#[post("/edit/<date>", format = "json", data = "<entry>")]
pub fn edit_post(date: String, entry: Json<Entry>) {
    let entry = entry.0;
    let mut file = match std::fs::File::create(
        CONFIG.general.blog_root.clone() + &entry.name.clone() + ".tmp",
    ) {
        Ok(file) => std::io::LineWriter::new(file),
        Err(_) => panic!(
            "Unable to read title from {:?}",
            entry.name.clone() + ".tmp"
        ),
    };

    writeln!(file, "{}", entry.title);
    write!(file, "{}", entry.body);
    file.flush();
    std::fs::rename(
        CONFIG.general.blog_root.clone() + &entry.name.clone() + ".tmp",
        CONFIG.general.blog_root.clone() + &entry.name + ".md",
    );
}
