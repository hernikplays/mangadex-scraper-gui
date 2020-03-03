const Mangadex = require("mangadex-api")
const https = require('https');
const fs = require('fs')


document.getElementById("folder").value = __dirname; // sets folder input to the current folder the EXE is located in
document.getElementById("lang").value = "English"; //set lang automatically because Im lazy


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
            for (var i = 0; i < chaps.length; i++) { //for every chapter it fetches from API the link to images
                    Mangadex.getChapter(chaps[i].id).then(chapter => {
                        //console.log(chapter)
                        chapter.page_array.forEach(function(link, index, array){ //download each page of chapter
                            //console.log(item)
                            if(chapter.volume == "" && chapter.chapter == ""){
                                dlChap("??","??",link,index+1)
                            }
                            else if(chapter.volume == "" && chapter.volume !== ""){
                                dlChap("??",chapter.chapter,link,index+1)
                            }
                            else if(chapter.volume !== "" && chapter.volume == ""){
                                dlChap(chapter.volume,"??",link,index+1)
                            }
                            else{
                                dlChap(chapter.volume,chapter.chapter,link,index+1)
                            }
                        },chapter);
                    })
                    break;
            }

        }



    }) //gets manga info


}

function dlChap(vol,chap,link,pos){
    console.log(`Vol. ${vol} - Chap. ${chap} page number ${pos} at ${link}`)
}


/*
 if (chaps[i].volume == "" || chaps[i].chapter == "") {
                    fs.mkdirSync(`${path}\\${manga.title}\\Vol. ? Ch. ${chaps[i].title} - ${chaps[i].group_name}`, {
                        recursive: true
                    })
                } else {
                    if (!fs.existsSync(`${path}\\${manga.title}\\Vol. ${chaps[i].volume} Ch. ${chaps[i].chapter} - ${chaps[i].group_name}`)) {
                        fs.mkdirSync(`${path}\\${manga.title}\\Vol. ${chaps[i].volume} Ch. ${chaps[i].chapter} - ${chaps[i].group_name}`, {
                            recursive: true
                        })
                    }
                    if (i <= 9) {
                        const file = fs.createWriteStream(`${path}\\${manga.title}\\Vol. ${chaps[i].volume} Ch. ${chaps[i].chapter} - ${chaps[i].group_name}\\0${i +1}.png`);
                    } else {
                        const file = fs.createWriteStream(`${path}\\${manga.title}\\Vol. ${chaps[i].volume} Ch. ${chaps[i].chapter} - ${chaps[i].group_name}\\${i +1}.png`);
                    }
                }
                */