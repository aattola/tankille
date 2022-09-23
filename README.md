# Tankille API

#### Tankille npm paketissa.

### Asentaminen:

npm:

```shell
npm i @jeffe/tankille
```

yarn:

```shell
yarn add @jeffe/tankille
```

### Käyttäminen:

> Huom.
> Tämän ohjelman käyttäminen tankille rajapintaa vasten on kielletty tankille [käyttöehtojen](https://www.tankille.fi/ehdot/) mukaisesti.

```js
const { Client } = require('@jeffe/tankille');

const client = new Client({ apiUrl: 'https://example.com/' });

async function run() {
  await client.login({
    email: 'test@test.com',
    password: 'testpass',
  });

  const stations = await client.getStations();

  console.log(stations);
}

run();
```

### Kuinka tätä käyttää:

- Luet automaattisesti generoidut: [API dokumentaatiot](https://aattola.github.io/tankille/classes/Client.html)
- Luet [koodia](https://github.com/aattola/tankille/tree/main/src) ja selvität itse
- Parannat itse [koodaamalla ominaisuuksia](https://github.com/aattola/tankille/fork)
- Kysymällä [apua](https://github.com/aattola/tankille/issues/new)

### Julkaisu

1. Aseta ympäristömuuttujat `GITHUB_TOKEN` ja `NPM_TOKEN`, joilla on oikeudet GitHub-releasen ja npm-julkaisun luomiseen.
2. Varmista, että olet `main`-haarassa ja työpuu on puhdas.
3. Suorita `npm run release` (tai `npm run release:dry` testataksesi). Komento linttaa (`npm run test:lint`), kääntää (`npm run build`), päivittää dokumentaation (`npm run doc:html`), julkaisee uuden version GitHubissa ja npm:ssä sekä vie dokumentit `gh-pages`-haaraan.
