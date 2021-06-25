# Place List

> Find the best places to visit, based on reviews from the community of travelers.

## Description 

You can sign up and add reviews, places ranking is automatically created. The app is inspired by [Nomad List](https://nomadlist.com/).

## Running Locally

### Dependencies

- PostgreSQL database

### Config

#### Configuring the Google provider for authentication

Documentation: https://developers.google.com/identity/protocols/oauth2

Configuration: https://console.developers.google.com/apis/credentials

#### Environment variables

Copy the [.env.example](.env.example) file to `.env` and update the values.

#### Running the development server

```bash
$ git clone https://github.com/mateuszwszola/placelist
$ cd placelist
$ npm install # or yarn
$ npm run dev # or yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
