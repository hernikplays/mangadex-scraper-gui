const Mangadex = require("mangadex-api")
const unirest = require('unirest');
const fs = require('fs')
const request = require('request');
const swal = require("sweetalert")
<<<<<<< HEAD
const {electron,dialog} = require("electron").remote
const {
    zip
} = require('zip-a-folder');


const version = "2.1"
=======
const electron = require("electron")

const version = "2.0"
>>>>>>> parent of 19c2a70... implementing automatic packaging into .cbz

//document.getElementById("folder").value = __dirname; // sets folder input to the current folder the EXE is located in
document.getElementById("lang").value = "English"; //set lang automatically because Im lazy
document.getElementById("number").value = "1";
console.log(process.platform)

/*if (process.platform == "linux") {
    document.getElementById("folder").placeholder = "/home/youruserhere/Documents";
} else if (process.platform == "win32") {
    document.getElementById("folder").placeholder = "C:/Users/You/Documents";
}*/
let i = 0;
let filePath;

function loop(chaps, path, manga) {

    setTimeout(function () {
        //console.log(chaps);
        if(chaps[i] == undefined) return swal("Error", "There was an error fetching the chapter list", "error")
        var group = chaps[i].group_name;
        Mangadex.getChapter(chaps[i].id).then(chapter => {
            
            console.log("Got chapter");
            console.log(chapter)
            if(chapter.page_array.length == "0") return swal("Error when getting chapters", "Please make sure there are pages in the chapters of the manga or report an issue on GitHub", "error");
            chapter.page_array.forEach(function (link, index, array) { //download each page of chapter

                
                if (chapter.volume == "" && chapter.chapter == "") {
                    dlChap("Unknown", chapter.title, link, index + 1, manga, path, chapter.group, chaps)
                } else if (chapter.volume == "" && chapter.volume !== "") {
                    dlChap("Unknown", chapter.chapter, link, index + 1, manga, path, chapter.group, chaps)
                } else if (chapter.volume !== "" && chapter.volume == "") {
                    dlChap(chapter.volume, chapter.title, link, index + 1, manga, path, chapter.group, chaps)
                } else {
                    dlChap(chapter.volume, chapter.chapter, link, index + 1, manga, path, group, chaps)
                }
            }, );
        })
<<<<<<< HEAD

        if (i = chaps.length) {
            if (document.getElementById("zipbox").checked == "on") {
                zipit(path)
            } else {
                document.getElementById("percentage").innerHTML = `Download Complete`
            }
=======
        i++;
        if (i < chaps.length) {
            document.getElementById("percentage").innerHTML = `Downloaded ${i} chapters out of ${chaps.length}`
            loop(chaps, path, manga);
        } else {
            document.getElementById("percentage").innerHTML = `Download Complete`
>>>>>>> parent of 19c2a70... implementing automatic packaging into .cbz
        }
    }, 3000, chaps, path, manga)
}

function scrape(id) {
    
    console.log(filePath)
    
    if (!id) {
        swal("Missing ID", "Please enter a manga ID from MangaDex", "error")
        return;
    }
    if (!filePath) {
        swal("Missing File Path", "Please choose a folder where to save the manga", "error")
        return
    }
    if (!document.getElementById("lang").value) {
        swal("Missing language", "Please enter a language e.g. English", "error")
    }

    Mangadex.getManga(id).then(({
        manga,
        chapter
    }) => {

        var cover = manga.cover_url.replace("cdndex.com", "mangadex.org") //bad link in api, replace it with right
        document.getElementById("cover").src = cover;
        document.getElementById("name").innerHTML = manga.title
        // document.getElementById("info").style.display = "initial"; //show info

        if (document.getElementById("selop").options[document.getElementById("selop").selectedIndex].value == "all") {


            var chaps = []

            for (var fori = 0; fori < chapter.length; fori++) { //filters chapters to selected language
                if (chapter[i].lang_name.toLowerCase() == document.getElementById("lang").value.toLowerCase()) {
                    chaps.push(chapter[i])
                    console.log("Push success")
                }
            }

            //console.log(chaps)
            
            loop(chaps, filePath, manga)

        } else if (document.getElementById("selop").options[document.getElementById("selop").selectedIndex].value == "ch") {
            
            let chapternum = document.getElementById('number').value
            if (chapternum == 0) {
                chapternum = 1;
            }

            if (!chapternum) {
                swal("Missing chapter number", "Enter a number (e.g. 1) or range of chapter (e.g 1-5)", "error")
                return
            }
            if (chapternum.includes("-")) {
                let to = chapternum.substring(chapternum.indexOf('-') + 1);
                let from = chapternum.substring(0, chapternum.indexOf('-'));
                console.log(from + "/" + to)
                var chaps = []

                for (var fori = 0; fori < chapter.length; fori++) { //filters chapters to selected language
                    if (chapter[i].lang_name.toLowerCase() == document.getElementById("lang").value.toLowerCase()) {
                        chaps.push(chapter[i])
                        console.log("Push success")
                    }
                }

                let filchap = [];
                for (var fori = from - 1; fori < to; fori++) {
                    console.log(i)
                    filchap.push(chaps[i])
                    console.log("Push success")

                }
                
                console.log(filchap)
                loop(filchap, filePath, manga)
                return;
            } else {
                var chaps = []
                for (var fori = 0; fori < chapter.length; fori++) { //filters chapters to selected language
                    if (chapter[i].lang_name.toLowerCase() == document.getElementById("lang").value.toLowerCase()) {
                        chaps.push(chapter[i])
                        console.log("Push success")
                    }
                }

                let id = chaps[chapternum - 1].id
                Mangadex.getChapter(id).then(chapter => {
                    console.log(chapter)
                    chapter.page_array.forEach(function (link, index, array) { 
                        console.log(chapter)
                        if (chapter.volume == "" && chapter.chapter == "") {
                            dlChap("Unknown", chapter.title, link, index + 1, manga, filePath, chapter.group)
                        } else if (chapter.volume == "" && chapter.volume !== "") {
                            dlChap("Unknown", chapter.chapter, link, index + 1, manga, filePath, chapter.group)
                        } else if (chapter.volume !== "" && chapter.volume == "") {
                            dlChap(chapter.volume, chapter.title, link, index + 1, manga, filePath, chapter.group)
                        } else {
                            dlChap(chapter.volume, chapter.chapter, link, index + 1, manga, filePath, group)
                        }
                    }, );

                })
            }
        }



    }) //gets manga info


}

async function dlChap(vol, chap, link, pos, manga, path, group, chapters) { //download function


    let mangatitle = manga.title.replace(/[/\\?%*:|"<>]/g, '')
    let groupname = group.replace(/[/\\?%*:|"<>]/g, '')
    if (process.platform == "win32") {
        if (!fs.existsSync(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}`)) {
            fs.mkdirSync(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}`, {
                recursive: true
            })
            console.log("Windows")
        }
        if (pos <= 9) {
            const file = fs.createWriteStream(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}\\0${pos}.${link.split('.').pop()}`);
            dlTO(file, link, manga, `${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}`, chapters)
            return console.log("Downloaded")
        } else {
            const file = fs.createWriteStream(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}\\${pos}.${link.split('.').pop()}`);
            dlTO(file, link, manga, `${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}`, chapters)

            return console.log("Downloaded")
        }
    } else if (process.platform == "linux") {
        console.log(path)
        if (!fs.existsSync(`${path}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}`)) {
            fs.mkdirSync(`${path}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}`, {
                recursive: true
            })
        }
        if (pos <= 9) {
            const file = fs.createWriteStream(`${path}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}/0${pos}.${link.split('.').pop()}`);
            dlTO(file, link, manga, `${path}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}`, chapters)
            return console.log("Downloaded")
        } else {
            const file = fs.createWriteStream(`${path}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}/${pos}.${link.split('.').pop()}`);
            dlTO(file, link, manga, `${path}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}`, chapters)

            return console.log("Downloaded")
        }
    } else if (process.platform == "darwin") {
        swal("Coming soon")
    }




}

function change(value) { //function to display the "chapter number" input on frontend
    if (value == "all") {
        document.getElementById("numb").style.display = "none";
    } else {
        document.getElementById("numb").style.display = "contents";
    }
}

function dlTO(file, link, manga, path, chaps) {
    setTimeout(function () {
        console.log(`Downloading ${link}`)
        var out = request({
            uri: link
        });
        out.on('response', function (resp) {
            console.log(resp)
            if (resp.statusCode === 200) {
                out.pipe(file);
                file.on('close', function () {
                    console.log("Done")
                    if (!chaps) {
                        if (document.getElementById("zipbox").checked == "on") {
                            console.log("Zipping single chapter")
                            zipit(path)
                        }
                        
                    } else {
                        console.log("Looping")
                        i++;
                        document.getElementById("percentage").innerHTML = `Downloaded ${i} chapters out of ${chaps.length}`
                        loop(chaps, path, manga);
                    }
                });
            } else {
                console.error("No file found at given url.")
            }
        })

    }, 3000)
}

function checkVersion() { //check if new version was released on GitHub
    unirest.get("https://api.github.com/repos/hernikplays/mangadex-scraper-gui/releases/latest")
        .header("User-Agent", "hernikplays")
        .end(function (response) {
            console.log(response.body.tag_name)
            if (response.body.tag_name > version) {
                swal({
                        title: "There is a new version available",
                        text: "Click on Download to open the browser and download the new version!",
                        icon: "warning",
                        buttons: ["Download", "Cancel"],
                    })
                    .then((value) => {
                        console.log(value)
                        if (!value) {
                            electron.shell.openExternal(response.body.html_url);
                        }
                    });

            } else console.log("Latest version")
        })
<<<<<<< HEAD
}

function zipit(path) {

    class ZipAFolder {

        static async main() {
            await zip(`${path}`, `${path}\\..`);
        }
    }

    ZipAFolder.main();

}

function openButton(){
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then(result => {
        if(result.canceled == true){
            console.log(result.canceled)
        }
        else{
        filePath = result.filePaths[0];
        console.log(result.filePaths)
    }
      })
=======
>>>>>>> parent of 19c2a70... implementing automatic packaging into .cbz
}