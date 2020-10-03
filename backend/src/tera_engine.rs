lazy_static! {
    pub static ref TERA: tera::Tera = {
        let tera = tera::Tera::new("templates/generic/**/*.tera").unwrap();
        tera
    };
}
