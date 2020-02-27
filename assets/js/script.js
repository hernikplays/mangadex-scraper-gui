const Mangadex = require("mangadex-api")
const fs = require('fs')

document.getElementById("folder").value = __dirname;  // sets folder input to the current folder the EXE is located in

function scrape(id, filePath){
    Mangadex.getManga(id).then(({ manga, chapter }) => {
        console.log(chapter)
        let cover = manga.cover_url.replace("cdndex.com", "mangadex.org") //bad link in api, replace it with right
        document.getElementById("cover").src = cover;
        document.getElementById("name").innerHTML = manga.title 
        document.getElementById("info").style.display = "contents"; //show info

        if(document.getElementById("selop").options[document.getElementById("selop").selectedIndex].value == "all"){
            var chaps = []

            for (var i = 0; i < chapter.length ; i++){ //filters chapters to selected language
                if (chapter[i].lang_name.toLowerCase() == document.getElementById("lang").value.toLowerCase()){
                    chaps.push(chapter[i])
                    console.log("Push success")
                }
            }

            console.log(chaps)

        }
        
        
          
      }) //gets manga info


}