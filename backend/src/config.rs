lazy_static! {
    /// This is an example for using doc comment attributes
    pub static ref CONFIG: Config = Config::new().expect("Config could not be loaded.");
}

#[derive(Debug, Deserialize)]
pub enum Environment {
    Development,
    Staging,
    Production,
}

#[derive(Debug, Deserialize)]
pub struct Rocket {
    pub environment: Environment,
    pub address: String,
    pub port: u16,
    pub log_level: log::Level,
    pub static_root: String,
    pub recaptcha_url: String,
    pub recaptcha_private_key: String,
}

#[derive(Debug, Deserialize)]
pub struct General {
    pub log_level: log::Level,
    pub blog_root: String,
    pub upload_root: String,
    pub site_url: String,
    pub email: String,
    pub smtp_server: String,
    pub smtp_port: u16,
    pub smtp_username: String,
    pub smtp_password: String,
    pub fee_actives: i32,
    pub fee_kids: i32,
    pub fee_students: i32,
}

#[derive(Debug, Deserialize)]
pub struct Config {
    pub general: General,
    pub rocket: Rocket,
}

impl Config {
    pub fn new() -> Result<Self, config::ConfigError> {
        let mut s = config::Config::new();

        // Start off by merging in the "default" configuration file
        s.merge(config::File::with_name("config/default"))?;

        // Add in a local configuration file
        // This file shouldn't be checked in to git
        s.merge(config::File::with_name("config/local").required(false))?;

        // You can deserialize (and thus freeze) the entire configuration as
        s.try_into()
    }
}