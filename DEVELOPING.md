# Development / Tech Notes

Here's what to know from a tech perspective.

## Git Hooks Setup 👈 (do not skip this!)

This repository uses Git hooks for

- preventing accidentally pushing secrets or other sensitive information

In order to make use of these, do install the following tools:

- [`lefthook`](https://github.com/evilmartians/lefthook) (Git hooks)
- [`trivy`](https://github.com/aquasecurity/trivy) (Secret and Vulnerability scanning)
- [`jq`](https://github.com/jqlang/jq) (cli json processor)

then install the hooks via

```bash
lefthook install
```

The git hook installed always executes lefthook which reads the configuration in `lefthook.yml`. Therefore, even the file is changed, re-running the `install` command is _not_ needed.

## Run Frontend with Docker

```bash
docker build --tag ris-adm-vwv-frontend-local:dev .
docker run -p 5173:5173 ris-adm-vwv-frontend-local:dev
```

Visit [http://localhost:5173/](http://localhost:5173/)

## Run Frontend bare metal

See [frontend/DEVELOPING.md](./frontend/DEVELOPING.md)

## Run backend

A docker container is started automatically with a local build.

```shell
cd backend
./gradlew bootRun
```
