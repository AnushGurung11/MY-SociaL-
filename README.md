# MySocial

Social media API — users can post, comment, and react to posts.

## Tech Stack

Node.js, Express, MongoDB (Mongoose), JWT, bcrypt

## Installation

npm init -y
npm install express mongoose bcryptjs cors jsonwebtoken
npm install -D nodemon dotenv mocha chai

## Run

npm run dev # start dev server
npm test # run tests

## Folder Structure

src/
├── models/ # schema definitions
├── controllers/ # business logic
├── routes/ # URL → controller mapping
├── middleware/ # auth checks, error handling
├── config/ # DB connection, env setup
└── utils/ # password hashing, helpers
