use std::path::PathBuf;
use structopt::StructOpt;

#[derive(Debug, StructOpt)]
#[structopt(
    name = "jjjcaarau webpage api",
    about = "An API to interact with the jjjcaarau webapplication through the UNIX commandline."
)]
pub enum Opt {
    #[structopt(name = "invoice")]
    Invoice(Invoice),
}

#[derive(Debug, StructOpt)]
#[structopt(name = "example", about = "An example of StructOpt usage.")]
pub enum Invoice {
    #[structopt(name = "generate")]
    Generate { typ: String },
    #[structopt(name = "send")]
    Send {
        #[structopt(name = "force", short = "f")]
        force: bool,
        typ: String,
    },
}
