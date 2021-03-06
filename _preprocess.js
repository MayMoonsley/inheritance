const fs = require('fs');

const totals = {};

function makeDirectoryReferences(dir, ...lines) {
    let fulldir = `_source/${dir}`;
    let files = fs.readdirSync(fulldir);
    files = files.filter(x => x.endsWith('.ts'));
    totals[dir] = files.length;
    lines = lines.concat(files.map(x => `/// <reference path="${dir}/${x}" />`));
    let file = lines.join('\n');
    fs.writeFileSync(fulldir + '.ts', file + '\n');
}

// used to escape characters from the .txt file when generating the NoteResources.ts source code
function escapeString(str) {
    if (typeof(str) == "string") {
        str = str.replace(/\\/g, "\\\\"); // escape backslashes

        // we probably want our notes to use real tabs, not spaces, so that they display correctly in the browser
        // we're programmers, so our text editors are usually configured to replace tabs with 2 or 4 spaces, which is wrong for this case
        str = str.replace(/    /g, "\t"); // replace 4 consecutive spaces with a tab
        str = str.replace(/  /g, "\t"); // replace 2 consecutive spaces with a tab

        // replace tabs with 4 non-breaking spaces because our UI HTML builder doesn't render tabs
        fakeTab = "\u00A0".repeat(4);
        str = str.replace(/\t/g, fakeTab);


        str = str.replace(/"/g, "\\\""); // escape double quotes
        str = str.replace(/'/g, "\\\'"); // escape single quotes
        str = str.replace(/\r?\n|\r/g, "\\n"); // escape newlines (and convert CRLF to LF)
        return str;
    } else {
        console.log(typeof(str));
        throw "Attempted to escape something that is not a string";
    }
}

// generate NoteResources.ts from the .txt files in assets/notes
function generateNoteResources() {

    let notesDir = "assets/notes/";
    let files = fs.readdirSync(notesDir);
    files = files.filter(x => x.endsWith('.txt'));
    totals.notes = files.length;

    let codeLines = [];
    codeLines.push("// this file contains the titles and contents for each unlockable note");
    codeLines.push("// this file is generated by the pre-processor from .txt files in the assets/notes directory");
    codeLines.push("namespace NoteResources {");
    codeLines.push("    export function loadAllNoteResources() {")

    files.forEach(function(txtfile) {
        txtfile = notesDir + txtfile;

        let file = fs.readFileSync(txtfile, 'utf-8');
        let lines = file.split("\n");

        // check whether this is a character note
        if (lines[0].includes("Character:")) {
            // character note
            let characterName = lines.shift(); // the character is assigned on the first line of the file
            characterName = characterName.replace("Character:", "").replace(/\r?\n|\r/g, ""); // format character name

            let title = lines.shift(); //get title (second line of txt file)
            title = title.replace(/\r?\n|\r/g, ""); // remove any new-lines from the title
            title = escapeString(title); // escape special characters in title

            let content = escapeString(lines.join("\n")); // remaining lines make up the body

            let instruction = "        NotePool.loadCharacterNote(\"" + title + "\", \"" + content + "\", \"" + characterName + "\");";

            codeLines.push(instruction);
        } else {
            // normal note
            let title = lines.shift(); //get title (first line of txt file)
            title = title.replace(/\r?\n|\r/g, ""); // remove any new-lines from the title
            title = escapeString(title); // escape special characters in title

            let content = escapeString(lines.join("\n")); // remaining lines make up the body

            let instruction = "        NotePool.loadNote(\"" + title + "\", \"" + content + "\");";

            codeLines.push(instruction);
        }

    });
    codeLines.push("    }");
    codeLines.push("}");

    let resourceFile = "_source/NoteResources.ts"

    // remove previously generated code
    if (fs.existsSync(resourceFile)) {
        fs.unlinkSync(resourceFile);
    }

    // write generated code to file
    codeLines.forEach((element) => {
        fs.appendFileSync(resourceFile, element + "\n");
    });

}

makeDirectoryReferences('effects');
makeDirectoryReferences('tools');
makeDirectoryReferences('modifiers');
makeDirectoryReferences('characters');
makeDirectoryReferences('enemies');
makeDirectoryReferences('statuses');
makeDirectoryReferences('traits');
makeDirectoryReferences('predicates');

generateNoteResources();

console.log('The game contains:');
const keys = Object.keys(totals);
keys.forEach(x => console.log(`    ${totals[x]} ${x}.`));
console.log(`There are ${Math.pow(2, totals.modifiers) * totals.tools} possible tools.`);
