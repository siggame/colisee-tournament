# siggame/colisee-tournament

Service to generate a tournament schedule and monitor the progress of the tournament.

[![Travis](https://img.shields.io/travis/siggame/colisee-tournament.svg?style=flat-square)](https://travis-ci.org/siggame/colisee-tournament)
[![Docker Pulls](https://img.shields.io/docker/pulls/siggame/colisee-tournament.svg?style=flat-square)](https://hub.docker.com/r/siggame/colisee-tournament/)
[![GitHub Tag](https://img.shields.io/github/tag/siggame/colisee-tournament.svg?style=flat-square)](https://github.com/siggame/colisee-tournament/tags)
[![Dependencies](https://img.shields.io/david/siggame/colisee-tournament.svg)](https://github.com/siggame/colisee-tournament)
[![NPM Version](https://img.shields.io/npm/@siggame/colisee-tournament.svg?style=flat-square)](https://www.npmjs.com/package/@siggame/colisee-tournament)
[![NPM Total Downloads](https://img.shields.io/npm/dt/@siggame/colisee-tournament.svg?style=flat-square)](https://www.npmjs.com/package/@siggame/colisee-tournament)

## Table Of Contents

- [Description](#description)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributors](#contributors)
- [Change Log](#change-log)
- [License](#license)
- [Contributing](#contributing)

## Description

A long description of the project.

## Getting Started

Using docker.

```bash
docker pull siggame/colisee-tournament
```

```npm
npm install
```

## Usage

Create `.env` file. (see [.env options](#environment-options))

```bash
echo "PORT=8080" > .env
```

Using docker.

```bash
docker run --init --rm --env-file .env -p 8080:8080 siggame/colisee-tournament
```

Using npm.

```bash
npm run start:prod
```

### Environment Options

- `PORT`: the port the tournament scheduler will listen on.

## Contributors

- [Russley Shaw](https://github.com/russleyshaw)
- [user404d](https://github.com/user404d)
- [Hannah Reinbolt](https://github.com/LoneGalaxy)
- [Matthew Qualls](https://github.com/MatthewQualls)

## Change Log

View our [CHANGELOG.md](https://github.com/siggame/colisee-tournament/blob/master/CHANGELOG.md)

## License

View our [LICENSE.md](https://github.com/siggame/colisee/blob/master/LICENSE.md)

## Contributing

View our [CONTRIBUTING.md](https://github.com/siggame/colisee/blob/master/CONTRIBUTING.md)