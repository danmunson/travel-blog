This is a basic blog implementation, supporting text and photos.

## Features
- Password-protected admin dashboard for creating and managing blog posts
- Simple persistence model based on JSON files
- Image resizing for faster "thumbnail" performance

## Setup
1. Clone the repo to your machine and install dependencies: `npm i`
2. Create the directory structure needed for persistence: `bash setup-persistence.sh` (you should get a directory structure that matches the one described below)
3. Create the environment file: `cp env-template .env.local`
4. Smash the keybord or do whatever you need to in order to set `SECRET_COOKIE_PASSWORD` to random value
5. Pick a password and generate its SHA256 hash: `npm run hash-pwd -- "your password"`
6. Set `ADMIN_SHA256` variable in `.env.local`
7. Set the `DATA_DIRECTORY` variable to the FULL path to your `.blogdata` directory
8. If you're using HTTPS for your website, uncomment the `SESSION_RESTRICTION` variable
9. Generate a build using `npm run build`
10. To run your server, just run `npm run start`

## Running
Note that "deletions" are performed by dereferencing at the level of the JSON files.
In order to free up space on your machine by actually deleting the files that have
been derefenced, run `npm run garbage-collector`

## Persistence Structure
.blogdata/
    |-- admin.json
    |-- content/
    |-- media/
    |-- compressed-media/

