# Tankille API

#### [Tankille](https://www.tankille.fi/) applikaation yksityinen api hienossa ja kivassa npm paketissa.

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
```js
const { Client } = require("@jeffe/tankille");

const client = new Client()

async function run() {
  await client.login({
    email: "test@test.com",
    password: "testpass"
  })

  const stations = await client.getStations()

  console.log(stations)
}

run()
```
### Kuinka tätä käyttää:
* Luet automaattisesti generoidut: [API dokumentaatiot](https://jeffeeeee.github.io/tankille/classes/client.html)
* Luet [koodia](https://github.com/jeffeeeee/tankille/tree/main/src) ja selvität itse
* Parannat itse [koodaamalla ominaisuuksia](https://github.com/jeffeeeee/tankille/fork)
* Kysymällä [apua](https://github.com/jeffeeeee/tankille/issues/new)
