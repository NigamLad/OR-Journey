# OR Journey

[OR Journey](https://orjourney.azurewebsites.net/) is a web app that presents information about a patient's surgical intervention. This app is meant to demonstrate what a future application could look like to present intraoperative data to a patient. 

The information presented includes:

- Operating Room Patient Charting Information
- Diagnostic Medical Imaging
- Surgical Field Microscope Video Clips
- SmartForceps Analytics

## Data Sources

The images and videos are not stored in this repository because it is served dynamically using JsDelivr from [https://github.com/NigamLad/OR-Journey-CDN](https://github.com/NigamLad/OR-Journey-CDN).

This was done for two reasons:
1. Keeping large data seperate from the website keeps the website lightweight.
2. The code is designed around ingesting data from APIs since this is how it would work if real data was being accessed securely.

There is a [simulated database](/src/scripts/simulatedDB.ts) that stores JSON objects that contain simulated patients and their data. *In a production scenario, the user data would not be stored in a file.* The structure of the JSON object has a relational structure meant to mimic an SQL Database, where each object acts as a table, and is indexed by the object keys.

The images and videos are from Dr. Farhad Limonadi MD, FAANS a Neurosurgery Solutions consultant and program director at Lucent Neuroscience Institute (LNI). His [youtube channel](https://www.youtube.com/@MicroNeuroSurgeryOrg) posts neurosurgery videos with descriptions of the procedure, imaging, and pathology descriptions. The following videos were used as sources for the edited images and video clips used in this app
- [https://www.youtube.com/watch?v=__HelmnvyBs](https://www.youtube.com/watch?v=__HelmnvyBs)
- [https://www.youtube.com/watch?v=cil034xgU0U](https://www.youtube.com/watch?v=cil034xgU0U)

*The information shown in this app is meant for demonstration purposes only and does not represent a real person's surgical procedures. Images and videos that have been sourced online are anonymized and do not hold any copyrights.*

## Features
- VueJS - Vue 3 web framework for ease of development of design and functionality
- Typescript - Ensures safer code and statically typed variables for reducing errors during development
- TailwindCSS - Tailwind CSS framework for ease of development of styling and mobile first design
- VitePWA - Progressive Web App can be installed on mobile devices for a native app experience

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

This application was meant to be deployed on [Azure App Service](https://azure.microsoft.com/en-us/products/app-service/web) Linux container with a Node 20 application runtime and a Free F1 subscription.

Instructions:
1. [Creating the Azure App Service resource](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs?tabs=linux&pivots=development-environment-azure-portal#create-azure-resources)
2. [Deploying to the web app](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs?tabs=linux&pivots=development-environment-vscode#deploy-to-azure)
3. In the configuration on Azure portal for the web app, the following startup command is required and must be set for the web app to work

        pm2 serve /home/site/wwwroot/dist --no-daemon --spa