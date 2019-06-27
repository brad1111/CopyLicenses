#!/usr/bin/env node

var os = require('os');
var fs = require('fs');
var path = require('path');

//get arguments
args = [];
verbose = false;
process.argv.forEach((val, index) => {
    if(index > 1){
        //Don't include first two since it isn't what we want
        args.push(val);
    }
})

if(args.length === 0){
    //If there is no text submitted run help command
    args.push("--help");
}

function helptext(){
    console.log("CopyLicenses help" + os.EOL +
                    "Usage: copylicenses [./path/to/node/licenses.json] [./path/to/destination] [/web/prefix/to/destination] <options>" + os.EOL +
                    "Options:" + os.EOL +
                    "--help Shows this page" + os.EOL +
                    "--verbose Makes sure to log everything");
}

//Give help text
switch (args[0].toLowerCase()) {
    case "--help":
    case "-help":
    case "help":
    case "h":
    case "/h":
    case "?":
    case "/help":
    case "/?":
    case "-?":
    case "--?":
        helptext();
        return;
    default:
        break;
}

if(args.includes("--verbose")){
    verbose = true;
}

if(args.length >= 3){
    //Correct length of arguemnts
    fs.readFile(args[0], 'utf8', (err, data) => {
        if(err){
            console.error(err);
        }
        else{
            //We've got the data therefore now convert it to json objects
            var jsonObject = JSON.parse(data);
            Object.keys(jsonObject).forEach((key) => {
                if(jsonObject[key].licenseFile){
                    //Make the destination directory for the file to be copied to
                    var src = jsonObject[key].licenseFile;

                    //Check for file name license
                    src = checkForLicense(src);

                    var destination = `${args[1]}/${key}/`;
                    fs.mkdirSync(destination, {recursive: true});
                    fs.copyFileSync(src, `${destination}/${path.basename(src)}`);
                    var absDestination = path.resolve(destination);
                    if(verbose){
                        console.log(`${src} was copied to ${absDestination}`);
                    }

                    // get the relative location from the containing folder to the actual location
                    var packageFullName = path.relative(args[1], destination);
                    //Replace all backslashes with forward splashes
                    if(packageFullName.includes("\\")){
                        packageFullName = packageFullName.replace("\\","/");
                    }
                    if(packageFullName.includes("@")){
                        
                    }
                    var relativeFromWeb = args[2] + packageFullName + "/" + path.basename(src);
                    jsonObject[key].licenseFile = relativeFromWeb;
                    if(verbose){
                        console.log(`Relative web link: ${relativeFromWeb}`)
                    }
                }
            });
            //Write back to the file
            var jsonString = JSON.stringify(jsonObject);
            fs.writeFile(args[0], jsonString, (err) => {
                if(err)
                    throw err;
                console.log(`${args[0]} updated successfully.`);
            });
        }
    });
} else {
    console.error("Error: Incorrect amount of arguments")
    helptext();
}

//Returns original string if there is no license file to replace the already given file, otherwise gives the new file
//Args types: (string (the fileName of the item to check the directory))
function checkForLicense(fullPathAndName){
    //Get the actual name of the file
    var fileName = path.basename(fullPathAndName);
    if(fileName.toLowerCase().includes("license")){
        return fullPathAndName;
    }
    //Otherwise check to see if there is a filenamed license in the folder
    var dirLocation = path.dirname(fullPathAndName);
    
    try {
        var listItems = fs.readdirSync(dirLocation);
        console.log(listItems);
        listItems.forEach((listItem) => {
            if(listItem.toLowerCase().includes("license")){
                var newLocation = path.resolve(dirLocation, listItem);
                if(verbose){
                    console.log(`Changed license file from ${fullPathAndName} to ${newLocation}`);
                }
                return newLocation;
            }
        });
    } catch (error) {
        console.error(`Error reading ${dirLocation}; ${JSON.stringify(error)}`);
    }
    //Coulnd't find a license
    return fullPathAndName;
}