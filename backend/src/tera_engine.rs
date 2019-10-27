lazy_static! {
    pub static ref TERA: tera::Tera = {
        let tera = tera::compile_templates!("templates/generic/**/*.tera");
        tera
    };
}