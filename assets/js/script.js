const Mangadex = require("mangadex-api")


document.getElementById("folder").value = __dirname;  // sets folder input to the current folder the EXE is located in

function scrape(id, filePath){
    Mangadex.getManga(id).then(({ manga, chapter }) => {
        console.log(manga)
        let cover = manga.cover_url.replace("cdndex.com", "mangadex.org") //bad link in api, replace it with right
        document.getElementById("cover").src = cover;
        document.getElementById("name").innerHTML = manga.title 
        document.getElementById("info").style.display = "contents"; //show info
      }) //gets manga info


}