# Backend for Solar Hunt
The code here manages all data related stuff for the Solar Hunt app.

## How to run locally

1. Install postgresql.
2. Create a new DB.
3. Clone this repo.
4. Copy .env.example and rename it to .env.
5. Fill up .env, where DB_HOST=localhost, CORS_WHITELIST is unsused can be left as an empty array
6. Run `npm install`.
7. Install `typescript` if you haven't.
8. Under `./src/Seeders/index.ts`, edit the values. More info in the actual code.
9. Run `npm run migrate:seed`.
10. To Run the backend, use `npm run dev`. (nodemon should be installed)

More info in https://twitter.com/darksoulsfanlol/status/1693283532817432948 and https://www.cubik.so/project/62d152fa-d58c-42cc-b731-05420ab799b1/hackathon/8e23ade0-0dae-4c4b-83aa-67867749029c
