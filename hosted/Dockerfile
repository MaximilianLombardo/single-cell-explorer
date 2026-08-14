# Public Ubuntu base. Upstream pulls this same image through CZI's private ECR
# pull-through cache (533267185808.dkr.ecr.us-west-2.amazonaws.com/docker.io/sci/
# library/ubuntu:22.04), which is not readable outside CZI, so the image could not
# be built at all by a self-hoster. Same upstream image, public registry.
FROM ubuntu:22.04

ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y gettext nginx moreutils build-essential libxml2-dev python3-dev python3-pip zlib1g-dev python3-requests python3-aiohttp llvm jq git zip curl && \
    curl -sL https://deb.nodesource.com/setup_20.x  | bash - && \
    apt-get -y install nodejs && \
    node -v && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

COPY hosted/nginx.conf /etc/nginx/nginx.conf

# Python deps come from uv.lock, so the image gets the same versions as a developer
# machine. uv also provisions the interpreter -- pyproject.toml requires >=3.12 and
# this base image ships 3.10 -- so no deadsnakes PPA is needed.
ENV UV_INSTALL_DIR=/usr/local/bin
RUN curl -LsSf https://astral.sh/uv/install.sh | sh && uv --version

ADD pyproject.toml uv.lock ./
# --no-dev: runtime deps only, no pytest/mypy/black in the image.
# --frozen: fail rather than silently re-resolve if the lock is stale.
# --no-install-project: this is an application, not an installable package.
RUN uv sync --frozen --no-dev --no-install-project

# Put the venv first on PATH so the bare `gunicorn` in hosted/start.sh resolves to the
# locked one, leaving start.sh unchanged.
ENV PATH="/.venv/bin:$PATH"
ENV VIRTUAL_ENV=/.venv

ADD Makefile Makefile
ADD common.mk common.mk
ADD environment.default.json environment.default.json
ADD client/ client/
ENV DEPLOYMENT_TYPE=hosted
RUN make build-client

ADD server/ server/
RUN mkdir -p /server/common/web/templates/

WORKDIR /server/ecs
RUN make build-ecs
WORKDIR /

ADD hosted/config.yaml config.yaml
ADD hosted/start.sh start.sh
RUN chmod +x /start.sh
ENV CXG_CONFIG_FILE=/config.yaml

ARG IMAGE_TAG
LABEL commit=${IMAGE_TAG}
ENV IMAGE_TAG=${IMAGE_TAG}

CMD ["/start.sh"]
