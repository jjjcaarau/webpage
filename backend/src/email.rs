extern crate lettre;
extern crate lettre_email;
extern crate native_tls;

use crate::config::CONFIG;

use lettre::{ClientSecurity, ClientTlsParameters, SmtpClient, Transport};

use lettre::smtp::authentication::{Credentials, Mechanism};
use lettre::smtp::ConnectionReuseParameters;
use native_tls::{Protocol, TlsConnector};

#[derive(Debug)]
pub enum EmailError {
    Email(lettre_email::error::Error),
    Smtp(lettre::smtp::error::Error),
    Tls,
}

impl From<lettre_email::error::Error> for EmailError {
    fn from(value: lettre_email::error::Error) -> Self {
        EmailError::Email(value)
    }
}

impl From<lettre::smtp::error::Error> for EmailError {
    fn from(value: lettre::smtp::error::Error) -> Self {
        EmailError::Smtp(value)
    }
}

pub fn send(
    from: String,
    to: String,
    subject: String,
    content_text: String,
    attachment: Option<(&[u8], &str)>
) -> Result<(), EmailError> {
    let mut builder = lettre_email::Email::builder()
        .to(to)
        .from(from)
        .subject(subject)
        .text(content_text);

    if let Some(attachment) = attachment {
        builder = builder.attachment(attachment.0, attachment.1, &mime::APPLICATION_PDF)?;
    }

    let build_result = builder.build();
    let email = build_result?;

    dbg!(&CONFIG.general);

    let smtp_server = CONFIG.general.smtp_server.clone();
    let smtp_port = CONFIG.general.smtp_port;
    let smtp_username = CONFIG.general.smtp_username.clone();
    let smtp_password = CONFIG.general.smtp_password.clone();

    let mut tls_builder = TlsConnector::builder();
    tls_builder.min_protocol_version(Some(Protocol::Tlsv10));
    let tls_parameters = ClientTlsParameters::new(
        smtp_server.clone(),
        tls_builder.build().map_err(|_e| EmailError::Tls)?,
    );

    let mut mailer = SmtpClient::new(
        (&*smtp_server, smtp_port),
        ClientSecurity::Opportunistic(tls_parameters),
    )
    .unwrap()
    .authentication_mechanism(Mechanism::Login)
    .credentials(Credentials::new(smtp_username, smtp_password))
    .connection_reuse(ConnectionReuseParameters::ReuseUnlimited)
    .transport();

    mailer.send(email.into()).map_err(|e| {
        log::error!("Could not send email. Reason:\r\n\t{:?}", e);
        e
    })?;

    Ok(())
}
