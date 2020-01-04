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
    pub secret_key: Option<String>,
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
    pub fee_passport: i32,
    pub grace_period: i64,
    pub grace_period_late: i64,
}

#[derive(Debug, Deserialize)]
pub struct Api {
    pub socket_path: String,
}

#[derive(Debug, Deserialize)]
pub struct Config {
    pub general: General,
    pub rocket: Rocket,
    pub api: Api,
}

impl Config {
    pub fn new() -> Result<Self, config::ConfigError> {
        let mut s = config::Config::new();

        // Start off by merging in the "default" configuration file
        s.merge(config::File::from_str(include_str!("config.toml"), config::FileFormat::Toml))?;

        // Add in a local configuration file
        // This file shouldn't be checked in to git
        s.merge(config::File::with_name("config/local").required(false))?;

        if let Ok(config_file) = std::env::var("JJJCA_CONFIG") {
            s.merge(config::File::new(&config_file, config::FileFormat::Toml).required(true))?;
        } else {
            log::warn!("No specific config was found. Continue with the default config.")
        }

        // You can deserialize (and thus freeze) the entire configuration as
        s.try_into()
    }
}
