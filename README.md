# siggame/colisee-tournament

Service to generate a tournament schedule and monitor the progress of the tournament.

[![Travis](https://img.shields.io/travis/siggame/colisee-tournament.svg?style=flat-square)](https://travis-ci.org/siggame/colisee-tournament)
[![Docker Pulls](https://img.shields.io/docker/pulls/siggame/colisee-tournament.svg?style=flat-square)](https://hub.docker.com/r/siggame/colisee-tournament/)
[![GitHub Tag](https://img.shields.io/github/tag/siggame/colisee-tournament.svg?style=flat-square)](https://github.com/siggame/colisee-tournament/tags)
[![dependencies Status](https://david-dm.org/siggame/colisee-tournament/status.svg)](https://david-dm.org/siggame/colisee-tournament)
[![devDependencies Status](https://david-dm.org/siggame/colisee-tournament/dev-status.svg)](https://david-dm.org/siggame/colisee-tournament?type=dev)

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

### API

#### `POST /create/:name`

Create a tournament with the given name and settings.

##### Query Paramaters:

name: `string (required)`

##### Body:

```js
Content-Type: application/json

{
  settings: {
    bronzeFinals: boolean;
    randomize: boolean;
  }
}
```

#### `GET /pause/:name`

Pause the tournament with the given name.

##### Query Parameters:

name: `string (required)`

#### `DELETE /remove/:name`

Remove the tournament with the given name.

##### Query Parameters:

name: `string (required)`

#### `GET /resume/:name`

Resume a paused tournament with the given name.

##### Query Parameters:

name: `string (required)`

#### `GET /status/:name`

Get the status of a tournament with the given name.

##### Query Parameters:

name: `string (required)`

#### `GET /status`

Get the statuses of all tournaments.

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
