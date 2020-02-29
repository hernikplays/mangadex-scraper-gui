const Mangadex = require("mangadex-api")
const https = require('https');
const fs = require('fs')


document.getElementById("folder").value = __dirname; // sets folder input to the current folder the EXE is located in
document.getElementById("lang").value = "English"; //set lang automatically because Im lazy

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
  


  
function scrape(id, filePath) {
    Mangadex.getManga(id).then(({
        manga,
        chapter
    }) => {
        console.log(chapter)
        let cover = manga.cover_url.replace("cdndex.com", "mangadex.org") //bad link in api, replace it with right
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
            let path = filePath.replace("/", "\\")
            for (var i = 0; i < chaps.length; i++) {
                
                Mangadex.getChapter(chaps[i].id).then(chapter => {
                    console.log(chapter)
                  })
                sleep(3000)
                console.log("Done sleeping...")
            }

        }



    }) //gets manga info


}

function doSetTimeout(chaps, i){
    setTimeout(function(){
        console.log(i)
    },2000)
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