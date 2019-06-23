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
                    "Required Arguments: [./path/to/node/licenses.json] [./path/to/destination]" + os.EOL +
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

if(args.length == 2){
    //Correct length of arguemnts
    fs.readFile(args[0], 'utf8', (err, data) => {
        if(err){
            console.error(err);
        }
        else{
            var filesToCopy = [];
            var objectNames = [];
            //We've got the data therefore now convert it to json objects
            var jsonObject = JSON.parse(data);
            Object.keys(jsonObject).forEach((key) => {
                if(jsonObject[key].licenseFile){
                    filesToCopy.push(jsonObject[key].licenseFile);
                    objectNames.push(key);
                }
            });
            filesToCopy.forEach((src,index) => {

                //Make the directory for the destination
                var destination = `${args[1]}/${objectNames[index]}/`;
                fs.mkdir(destination, { recursive: true}, (err) => {
                    if(err)
                        throw err;
                    fs.copyFile(src, `${destination}/${path.basename(src)}`, (err) => {
                        if(err)
                            throw err;
                        console.log(`${src} was copied to ${destination}`);
                    });
                });
            });
        }
    });
} else {
    console.error("Error: Incorrect amount of arguments")
    helptext();
}
