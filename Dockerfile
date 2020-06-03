# ------------------------------------------------------------------------------
# Cargo Build Stage
# ------------------------------------------------------------------------------

FROM ekidd/rust-musl-builder:nightly-2020-05-07 as cargo-build

# Install diesel cli for migrations.
RUN cargo install diesel_cli --no-default-features --features sqlite-bundled

# Copy the source
COPY backend/src/ src/
COPY backend/Cargo.toml Cargo.toml

# Build the application.
RUN cargo build --release

# ------------------------------------------------------------------------------
# Final Stage
# ------------------------------------------------------------------------------

FROM alpine:3.12

RUN apk \
    --update \
    --upgrade \
    --no-cache \
    add \
    cairo-dev \
    pango-dev \
    gdk-pixbuf-dev \
    ttf-dejavu

ADD requirements.txt requirements.txt

RUN set \
    -ex \
    && apk \
    --no-cache \
    --virtual .build-deps \
    add \
    gcc \
    musl-dev \
    jpeg-dev \
    zlib-dev \
    libffi-dev \
    python3-dev \
    py3-pip \
    py3-wheel \
    && pip3 \
    install \
    --no-cache-dir \
    -r requirements.txt \
    && apk \
    del .build-deps

WORKDIR /app

RUN mkdir housekeeping
RUN mkdir data

COPY --from=cargo-build /home/rust/src/target/x86_64-unknown-linux-musl/release/jjjcaarau-webpage .
COPY --from=cargo-build /home/rust/.cargo/bin/diesel housekeeping/.

COPY backend/migrations/ housekeeping/migrations/
COPY scripts/startup.sh housekeeping/startup.sh
COPY backend/Cargo.toml housekeeping/Cargo.toml
COPY backend/config/ defaults/config/
COPY backend/templates/ defaults/templates/
COPY static/ static/

RUN mkdir data/config/
RUN mkdir data/blog/
RUN mkdir data/templates/

RUN chmod 777 housekeeping/startup.sh

EXPOSE 1337

CMD /app/housekeeping/startup.sh
