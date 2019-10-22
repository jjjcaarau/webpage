# ------------------------------------------------------------------------------
# Cargo Build Stage
# ------------------------------------------------------------------------------

FROM ekidd/rust-musl-builder:nightly-2019-08-13-openssl11 as cargo-build

# Install diesel cli for migrations.
RUN cargo install diesel_cli --no-default-features --features sqlite-bundled

# Copy the source
COPY src/ src/
COPY Cargo.toml Cargo.toml

# Build the application.
RUN cargo build --release

# ------------------------------------------------------------------------------
# Final Stage
# ------------------------------------------------------------------------------

FROM alpine:latest

WORKDIR /app

RUN mkdir housekeeping
RUN mkdir data

COPY --from=cargo-build /home/rust/src/target/x86_64-unknown-linux-musl/release/jjjcaarau-webpage .
COPY --from=cargo-build /home/rust/.cargo/bin/diesel housekeeping/.

COPY migrations/ housekeeping/migrations/
COPY scripts/startup.sh housekeeping/startup.sh
COPY Cargo.toml housekeeping/Cargo.toml
COPY config/ defaults/config/
COPY templates/ defaults/templates/
COPY GeoLite2Country.mmdb defaults/GeoLite2Country.mmdb
COPY static/ static/

RUN mkdir data/config/

RUN chmod 777 housekeeping/startup.sh

EXPOSE 1337

CMD /app/housekeeping/startup.sh
