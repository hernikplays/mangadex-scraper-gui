const Mangadex = require("mangadex-api")
const https = require('https');
const fs = require('fs')


document.getElementById("folder").value = __dirname; // sets folder input to the current folder the EXE is located in
document.getElementById("lang").value = "English"; //set lang automatically because Im lazy
var i = 0;

function loop(chaps, path, manga) {

    setTimeout(function () {
        let group = chaps[i].group_name
        Mangadex.getChapter(chaps[i].id).then(chapter => {
            //console.log(manga)
            chapter.page_array.forEach(function (link, index, array) { //download each page of chapter
                console.log(chaps[i - 1])
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
            loop(chaps, path, manga);
        }
    }, 3000, chaps, path, manga)
}

function scrape(id, filePath) {
    Mangadex.getManga(id).then(({
        manga,
        chapter
    }) => {

        console.log(chapter[0])
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

            console.log(chaps)
            var path = filePath.replace("/", "\\")
            loop(chaps, path, manga)

        }



    }) //gets manga info


}

function dlChap(vol, chap, link, pos, manga, path, group) { //download function
    console.log(`Vol. ${vol} - Chap. ${chap} page number ${pos} at ${link}`)
    
        let mangatitle = manga.title.replace(/[/\\?%*:|"<>]/g, '')
        if (!fs.existsSync(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${group}`)) {
            fs.mkdirSync(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${group}`, {
                recursive: true
            })
        } 
        if (pos <= 9) {
            const file = fs.createWriteStream(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${group}\\0${pos}.${link.split('.').pop()}`);
            const request = https.get(link, function (response) {
                 response.pipe(file);
                return console.log("done")
            });
        } else {
            const file = fs.createWriteStream(`${path}\\${mangatitle}\\Vol. ${vol} Ch. ${chap} - ${group}\\${pos}.${link.split('.').pop()}`);
            const request = https.get(link, function (response) {
                 response.pipe(file);
                return console.log("done")
            });
        }
    

}

function change(value){
    if(value == "all"){
        document.getElementById("numb").style.display = "none";
    }
    else{
        document.getElementById("numb").style.display = "contents";
    }
}

