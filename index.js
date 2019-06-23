var os = require('os');
var fs = require('fs');
var path = require('path');

//get arguments
args = [];
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
                    "Required Arguments: [./path/to/node/licenses.json] [./path/to/destination] [/web/prefix/to/destination]" + os.EOL +
                    "Options:" + os.EOL +
                    "--help Shows this page");
}

console.log(args[0].toLowerCase());
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

if(args.length == 3){
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
                    var destination = `${args[1]}/${key}/`;
                    fs.mkdirSync(destination, {recursive: true});
                    fs.copyFileSync(src, `${destination}/${path.basename(src)}`);
                    var absDestination = path.resolve(destination);
                    console.log(`${src} was copied to ${absDestination}`);

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
                    console.log(`Relative web link: ${relativeFromWeb}`)
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
