# MetroPro

Web application for searching, adding and updating organisational skills per person level.

## Installation : 

Create Openshift Node.js 0.1.0 cartridge. Import code from this repository in cartridge settings.

Remember to add mongodb to node.js cartridge!

Get Google Web Sign in credentials from https://console.developers.google.com (under credentials) and make sure that authorized javascript origins contain your host. Add sign in credentials to /static/index.html header.

If problems with installation, restart the app cartridge.

## Testing REST api & api documentation : 

API documentation is located at url /api.html

Open up REST simulator ( Postman recommended )

Try the following URL's : 

- /GET host/users
- /POST host/users - send data in JSON format ( check API documentation for correct format )
- /PUT host/users/:id
- /DELETE host/users/:id
 
## Demo implementation : 

http://app-metropro.rhcloud.com

## Folder structure : 

/server.js - node.js server implementation
/model/ - user & skill Mongoose models
/static/ - static html content
/static/js/ - javascript files for UI
/static/css/ - css files for UI

## License : 

Distributed under the MIT license.

