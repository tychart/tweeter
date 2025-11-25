# Project Architecture

This project is a full stack web application with a backend server (`tweeter-server`) built in typescript to run on AWS Lambda. The frontend is a react application (`tweeter-web`) built in typescript to run localy. Both applications depend on a custom `tweeter-shared` package that contains shared types, interfaces and functions. The `tweeter-shared` package is a dependency of both applications.

The React application is built with the MVP model, and contains:

- Components in `/src/components`
- Presenters in `/src/presenter`
- Models in `/src/model`

## Coding Standards

- Use TypeScript for all new files
- Follow the existing naming conventions
