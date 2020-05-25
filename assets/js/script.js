const Mangadex = require("mangadex-api")
const unirest = require('unirest');
const fs = require('fs')
const request = require('request');
const swal = require("sweetalert")
const {
    electron,
    dialog
} = require("electron").remote
const {
    zip
} = require("zip-a-folder")
const tmp = require("tmp")

const version = "2.1"

document.getElementById("lang").value = "English"; //set lang automatically because Im lazy
document.getElementById("number").value = "1";

var i = 0;
var filePath;
const tmpobj = tmp.dirSync();

function loop(chaps, path, manga) {

    setTimeout(function () {
        console.log(chaps)
        console.log(i)
        let group = chaps[i].group_name
        Mangadex.getChapter(chaps[i].id).then(chapter => {
            if (chapter.page_array.length == 0) return swal("Error!", "There was an error fetching the pages of chapter\nMake sure that the chapter is not available on the author's page for free", "error")

            chapter.page_array.forEach(function (link, index, array) { //download each page of chapter

                console.log(chapter)
                if (chapter.volume == "" && chapter.chapter == "") {
                    dlChap("Unknown", chapter.title, link, index + 1, manga, path, chapter.group)
                } else if (chapter.volume == "" && chapter.volume !== "") {
                    dlChap("Unknown", chapter.chapter, link, index + 1, manga, path, chapter.group)
                } else if (chapter.volume !== "" && chapter.volume == "") {
                    dlChap(chapter.volume, chapter.title, link, index + 1, manga, path, chapter.group)
                } else {
                    dlChap(chapter.volume, chapter.chapter, link, index + 1, manga, path, group)
                }
            }, );
        })
        i++;
        if (i < chaps.length) {
            document.getElementById("percentage").innerHTML = `Downloaded ${i} chapters out of ${chaps.length}`
            loop(chaps, path, manga);
        } else {
            document.getElementById("percentage").innerHTML = `Download Complete`
        }
    }, 3000, chaps, path, manga)
}



async function dlChap(vol, chap, link, pos, manga, path, group) { //download function


    let mangatitle = manga.title.replace(/[/\\?%*:|"<>]/g, '')
    let groupname = group.replace(/[/\\?%*:|"<>]/g, '')
    if (document.getElementById("zipbox").checked == "off") {
        if (process.platform == "win32") {

            if (!fs.existsSync(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}`)) {
                fs.mkdirSync(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}`, {
                    recursive: true
                })
                console.log("Windows")
            }
            if (pos <= 9) {
                const file = fs.createWriteStream(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}\\0${pos}.${link.split('.').pop()}`);
                dlTO(file, link, chap, vol, groupname)
                return console.log("Downloaded")
            } else {
                const file = fs.createWriteStream(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}\\${pos}.${link.split('.').pop()}`);
                dlTO(file, link, chap, vol, groupname)

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
                dlTO(file, link, chap, vol, groupname)
                return console.log("Downloaded")
            } else {
                const file = fs.createWriteStream(`${path}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}/${pos}.${link.split('.').pop()}`);
                dlTO(file, link, chap, vol, groupname)

                return console.log("Downloaded")
            }
        } else if (process.platform == "darwin") {
            swal("Coming soon")
        }
    } else {
        if (process.platform == "win32") {

            if (!fs.existsSync(`${tmpobj.name}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}`)) {
                fs.mkdirSync(`${tmpobj.name}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}`, {
                    recursive: true
                })
                console.log("Windows")
            }
            if (pos <= 9) {
                let temp = `${tmpobj.name}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}`
                const file = fs.createWriteStream(`${tmpobj.name}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}\\0${pos}.${link.split('.').pop()}`);
                dlTO(file, link, chap, vol, groupname, path, temp)
                return console.log("Downloaded")
            } else {
                let temp = `${tmpobj.name}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}`
                const file = fs.createWriteStream(`${tmpobj.name}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${groupname}\\${pos}.${link.split('.').pop()}`);
                dlTO(file, link, chap, vol, groupname, path, temp)

                return console.log("Downloaded")
            }
        } else if (process.platform == "linux") {
            if (!fs.existsSync(`${tmpobj.name}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}`)) {
                fs.mkdirSync(`${tmpobj.name}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}`, {
                    recursive: true
                })
            }
            if (pos <= 9) {
                let temp = `${tmpobj.name}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}`
                const file = fs.createWriteStream(`${tmpobj.name}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}/0${pos}.${link.split('.').pop()}`);
                dlTO(file, link, chap, vol, groupname, path, temp)
                return console.log("Downloaded")
            } else {
                let temp = `${tmpobj.name}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}`
                const file = fs.createWriteStream(`${tmpobj.name}/${mangatitle}/Vol. ${vol} Ch. ${chap} - ${groupname}/${pos}.${link.split('.').pop()}`);
                dlTO(file, link, chap, vol, groupname, path, temp)

                return console.log("Downloaded")
            }
        } else if (process.platform == "darwin") {
            swal("Coming soon")
        }

    }



}

function change(value) { //function to display the "chapter number" input on frontend
    if (value == "all") {
        document.getElementById("numb").style.display = "none";
    } else {
        document.getElementById("numb").style.display = "contents";
    }
}

 function dlTO(file, link, chap, vol, groupname, path, temp) {
    setTimeout(function () {
        console.log(`Downloading ${link}`)
        var out = request({
            uri: link
        });
        out.on('response', async function (resp) {
            console.log(resp)
            if (resp.statusCode === 200) {
                out.pipe(file);

                console.log("OK")
            } else {
                console.error("No file found at given url.")
            }
        })
        out.on('complete', function(resp){
            console.log(resp)
            
            file.on('close', function () {
                ZipAFolder.main(temp, chap, vol, groupname, path)
            });
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
}

function openfolder() {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(result => {
        if (result.canceled) {
            console.log("cancelled selection")
            return;
        } else {
            console.log(result.filePaths[0])
            filePath = result.filePaths[0]
            console.log(filePath)
        }
    }).catch(err => {
        console.log(err)
    })
}

class ZipAFolder {

    static async main(path, chap, vol, groupname, actualpath) {
        if (process.platform == "win32") {
            console.log(path)
            await zip(path, `${actualpath}\\Vol. ${vol} Ch. ${chap} - ${groupname}.cbz`);
            console.log("Zipping to " + actualpath)
        }
    }
}

function scrape(id) {
    console.log(filePath)
    if (!id) {
        swal("Missing ID", "Please enter a manga ID from MangaDex", "error")
        return;
    }
    if (!filePath) {
        swal("Missing File Path", "Please choose a folder", "error")
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

            for (var i = 0; i < chapter.length; i++) { //filters chapters to selected language
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

                for (var i = 0; i < chapter.length; i++) { //filters chapters to selected language
                    if (chapter[i].lang_name.toLowerCase() == document.getElementById("lang").value.toLowerCase()) {
                        chaps.push(chapter[i])
                        console.log("Push success")
                    }
                }

                let filchap = [];
                for (var i = from - 1; i < to; i++) {
                    console.log(i)
                    filchap.push(chaps[i])
                    console.log("Push success")

                }

                console.log(filchap)
                loop(filchap, filePath, manga)
                return;
            } else {

                for (var i = 0; i < chapter.length; i++) { //filters chapters to selected language
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