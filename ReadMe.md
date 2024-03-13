# Fillout Form Responses Test

This is a simple REST API server which interacts with [Fillout.com’s](https://www.fillout.com/) API to fetch form responses, but with an option to filter based on certain answers.

## Technology Stack

- Express.js
- Node.js
- MongoDB

## Requirements

For development, you will need MongoDB v7.x, Node.js v20.x (recommended) and a node global package, NPM, installed in your environment.

### Prerequisites

Node.js (lts)

## App Setup

You can configure this app by following the instructions mentioned below:

### Clone Repository

Run command `git clone https://github.com/Arham-ifran/fillout-form-responses-test` to clone this public repository.

### Install Packages

At the root directory of the application, run the following command to install packages:

`npm install`

### Configure App

Add the .env file at the root of the project. Sample values available in .env.template file.

### Run Project

Start running project with following command:

`npm start`   

### Automated Test Cases

Test cases are written for the provided solution in *./src/api/tests/form.test.mjs*. Run the following command from the root directory:

`npm run test`   

### Port

This backend would run on port *8080*, if you provide PORT *8080* in .env

The required PORT can be added in the .env file.

## Documentation

### App Working

- The *./src/index.mjs* is the starting point of this app.
- When the server starts, the function *connectDatabase* is called to connect the database and it pre-populates the local database with the demo form reponses by calling *demoFormSeed* function.
- I've considered up to **150** demo Fillout form responses for this assignment.

### API Working

- When the API is hit, it first sanitizes and validates the given input. Once its validated, the function *getResponses* is called which holds the requested logic of the API.
- In the provided solution the function *getResponses*, is designed to filter the data fetched from a Fillout form, makings sure that the pagination still works.
- [Published API Documentation](https://documenter.getpostman.com/view/31062642/2sA2xh1CY3)

### Error Handling

- The error messages returned by the API are iformative. 
- Handled unexpected errors using try-catch statement where needed.
- Returned the error messages where required.
- Tested error scenarios and unexpected errors.

### Additional Information

- Only the required dependencies and devDepndencies are installed in the app.
- I have tried my best to send the required data where ever required.
- I have made the project structure as flexible as possible, so it can be expanded any time.
- I have created the controllers, routes, validators, and tests in separate directories for the purpose of maintinability, scalability, and flexibility.