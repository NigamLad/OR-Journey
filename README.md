# OR Journey

OR Journey is a web app that presents information about a patient's surgical intervention. This app is meant to demonstrate what a future application could look like to present intraoperative data to a patient. 

The information presented includes:

- Operating Room Patient Charting Information
- Diagnostic Medical Imaging
- Surgical Field Microscope Video Clips
- SmartForceps Analytics

*The information shown in this app is meant for demonstration purposes only and does not represent a real person's surgical procedures. Images and videos have been sourced online are anonymized and do not hold any copyrights. Sources will be listed below.*

## Features
- VueJS - Vue 3 web framework for ease of development of design and functionality
- TailwindCSS - Tailwind styling framework for ease of development of styling and mobile first design
- VitePWA - Progressive Web App can be installed on mobile devices for an app-like experience

## Project Setup

### Installation
```sh
npm install
```

### Compile and Hot-Reload for Development
```sh
npm run dev
```

### Browse
Visit [http://localhost:5173/](http://localhost:5173/) in a web browser to see the application

## Deployment

This application was meant to be deployed on Azure Web App Service with a Node 20 application runtime.

In the configuration on Azure portal for the web app, the following startup command is required and must be set for the web app to work
```sh
pm2 serve /home/site/wwwroot/dist --no-daemon --spa
```

The app is currently deployed at [https://orjourney.azurewebsites.net/](https://orjourney.azurewebsites.net/)