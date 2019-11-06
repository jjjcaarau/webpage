mod cli;
mod invoices;

use bufstream::BufStream;
use std::io::{BufRead, Write};
use std::os::unix::net::{UnixListener, UnixStream};
use std::thread::{self, JoinHandle};
use structopt::StructOpt;

use crate::config::CONFIG;

fn handle_client(stream: UnixStream) {
    let mut stream = BufStream::new(stream);
    loop {
        let mut s = String::new();
        s += "cli ";
        stream.read_line(&mut s).unwrap();
        let opt = cli::Opt::from_iter(s.trim().split(" "));

        match opt {
            cli::Opt::Invoice(invoice) => match invoice {
                cli::Invoice::Generate { typ } => match &typ[..] {
                    "all" => invoices::generate_all(),
                    "first" => invoices::generate_first(),
                    "late" => invoices::generate_late_notice(),
                    t => println!("Action type \"{}\" does not exist.", t),
                },
                cli::Invoice::Send { typ, force } => match &typ[..] {
                    "all" => invoices::send_all(force),
                    "first" => invoices::send_first(force),
                    "late" => invoices::send_late_notice(force),
                    t => println!("Action type \"{}\" does not exist.", t),
                },
            },
        }

        stream.flush().unwrap();
    }
}

pub fn init() -> JoinHandle<()> {
    thread::spawn(|| {
        let listener = UnixListener::bind(&CONFIG.api.socket_path).unwrap();

        for stream in listener.incoming() {
            match stream {
                Ok(stream) => {
                    thread::spawn(|| handle_client(stream));
                }
                Err(err) => {
                    println!("Error: {}", err);
                    break;
                }
            }
        }
    })
}
