const Mangadex = require("mangadex-api")
const https = require('https');
const fs = require('fs')
const request = require('request');

//document.getElementById("folder").value = __dirname; // sets folder input to the current folder the EXE is located in
document.getElementById("lang").value = "English"; //set lang automatically because Im lazy
document.getElementById("number").value = "1";

var i = 0;

function loop(chaps, path, manga) {

    setTimeout(function () {
        let group = chaps[i].group_name
        Mangadex.getChapter(chaps[i].id).then(chapter => {


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

function scrape(id, filePath) {
    if (!id) {
        alert("Missing ID, please enter a manga ID from MangaDex")
        return;
    }
    if (!filePath) {
        alert("Missing File Path, please enter a path to a folder e.g. C:/Users/YourName/Documents")
        return
    }
    if (!document.getElementById("lang").value) {
        alert("Missing language, please enter a language e.g. English")
    }

    Mangadex.getManga(id).then(({
        manga,
        chapter
    }) => {

        var cover = manga.cover_url.replace("cdndex.com", "mangadex.org") //bad link in api, replace it with right
        document.getElementById("cover").src = cover;
        document.getElementById("name").innerHTML = manga.title
        document.getElementById("info").style.display = "contents"; //show info

        if (document.getElementById("selop").options[document.getElementById("selop").selectedIndex].value == "all") {
            var chaps = []

            for (var i = 0; i < chapter.length; i++) { //filters chapters to selected language
                if (chapter[i].lang_name.toLowerCase() == document.getElementById("lang").value.toLowerCase()) {
                    chaps.push(chapter[i])
                    console.log("Push success")
                }
            }

            //console.log(chaps)
            var path = filePath.replace("/", "\\")
            loop(chaps, path, manga)

        } else if (document.getElementById("selop").options[document.getElementById("selop").selectedIndex].value == "ch") {
            var path = filePath.replace("/", "\\")
            let chapternum = document.getElementById('number').value
            if (chapternum == 0) {
                chapternum = 1;
            }

            if (!chapternum) {
                alert("Missing chapter number, enter a number (e.g. 1) or range of chapter (e.g 1-5)")
                return
            }
            if (chapternum.includes("-")) {
                let from = chapternum.substring(chapternum.indexOf('-')+ 1 );
                let to = chapternum.substring(0, chapternum.indexOf('-'));
                console.log(to + "/" + from)
                return;
            } else {
                
                let id = chapter[chapternum - 1].id
                Mangadex.getChapter(id).then(chapter => {
                    console.log(chapter)
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
            }
        }



    }) //gets manga info


}

async function dlChap(vol, chap, link, pos, manga, path, group) { //download function


    let mangatitle = manga.title.replace(/[/\\?%*:|"<>]/g, '')
    if (!fs.existsSync(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${group}`)) {
        fs.mkdirSync(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${group}`, {
            recursive: true
        })
    }
    if (pos <= 9) {
        const file = fs.createWriteStream(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${group}\\0${pos}.${link.split('.').pop()}`);
        dlTO(file, link)
        return console.log("Downloaded")
    } else {
        const file = fs.createWriteStream(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${group}\\${pos}.${link.split('.').pop()}`);
        dlTO(file, link)

        return console.log("Downloaded")
    }



}

function change(value) { //function to display the "chapter number" input on frontend
    if (value == "all") {
        document.getElementById("numb").style.display = "none";
    } else {
        document.getElementById("numb").style.display = "contents";
    }
}

function dlTO(file, link) {
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
                });
            } else {
                console.error("No file found at given url.")
            }
        })

    }, 5000)
}