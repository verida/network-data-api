
# Verida Network Data API

This is a generic API that fetches public data from the Verida network.

This server is hosted publicly at: [https://data.verida.network](https://data.verida.network)

## Running the server

```
yarn install
yarn run dev
```

## Usage

Make HTTP GET requests to fetch data from the network in the following format:

```
https://localhost:8182/<did>/<contextName>/<databaseName>/<recordId>/<attribute>/<...deepAttributes>
```

`did`, `contextName`, `databaseName` and `recordId` are required. The rest are optional.

If an `attribute` is specified, just that attribute value from the record is returned.

### Deep attributes

`deepAttributes` represent an unlimited number of levels that can be retrevied with in a JSON result.

Assume there is a record with the following data:

```
{
    _id: 'test-record',
    data: {
        name: {
            firstName: 'steve',
            lastName: 'jones'
        }
    }
}
```

It's possible to fetch just `lastName` with:

```
/<did>/<contextName>/<databaseName>/test-record/data/name/lastName
```

## Examples

### Fetch a record

Fetch a user's public profile:

```
/did:vda:testnet:0x84746Ff2bC4E998fB23815f242d192912076e767/Verida:%20Vault/profile_public/basicProfile
```

This returns the full record with `_id=basicProfile`

```json
{"_id":"basicProfile","_rev":"13-402d249600cfe3984a6a90e459d348dc","avatar":{"uri":"data:image/undefined;base64,/9j/4A....<truncated>"},"country":"Australia","description":"Help building user-centric and privacy-preserving applications with Verida","modifiedAt":"2023-03-03T04:50:32.227Z","name":"Aurel","schema":"https://common.schemas.verida.io/profile/basicProfile/v0.1.0/schema.json","signatures":{"did:vda:testnet:0x84746ff2bc4e998fb23815f242d192912076e767?context=0x3c51af440094f5e93e3421504b8203228804ea2bbcfb11a2790d25e5f8898f01":"0x4d173694cf32990e7fcea45b46da5f6b9af507a2ffc3904b3c71bf1a87817f7f671b55bc820c17a68384467039dddda4aaa5fada898fb91c0013fe44daf934ab1b"}}
```

### Fetch the attribute for a record

Fetch a user's public profile avatar:

```
/did:vda:testnet:0x84746Ff2bC4E998fB23815f242d192912076e767/Verida:%20Vault/profile_public/basicProfile/avatar
```

This returns just the `avatar` attribute from the public profile record:

```json
{"avatar":{"uri":"data:image/undefined;base64,/9j/4A....<truncated>"}}
```

### Fetch a deep attribute for a record

```
/did:vda:testnet:0x84746Ff2bC4E998fB23815f242d192912076e767/Verida:%20Vault/profile_public/basicProfile/avatar/uri
```

Returns just the `uri` part of the `avatar` attribute

```json
{"avatar":{"uri":"data:image/undefined;base64,/9j/4A....<truncated>"}}
```