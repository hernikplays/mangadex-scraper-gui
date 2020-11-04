const Mangadex = require("mangadex-api")
const axios = require('axios').default;
const fs = require('fs')
const request = require('request');
const Swal = require('sweetalert2')
const {
    electron,
    dialog,
    shell
} = require("electron").remote
const mangadex = require("mangadex-api")

const version = "4.0"
document.getElementById("info").style.display = "none";

function checkVersion() { //check if new version was released on GitHub
    axios.get("https://api.github.com/repos/hernikplays/mangadex-scraper-gui/releases/latest")
        .then((res) => {
            if (res.data.tag_name > version) return Swal.fire({
                title: "New version found",
                text: "New version has been released, press OK to open your browser and download it.",
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel'
            })
            .then((result)=>{
                console.log(result)
                console.log(res)
                if(result.isConfirmed) {
                    shell.openExternal(res.data.html_url);
                }
            })
            console.log(res.data.tag_name)
        })
        .catch((e) => {
            console.log(e)
            if (e) {
                Swal.fire("Something happened...", e.message, "error")
            }
        })

}
// Prechecks
function start(){
    let url = document.getElementById("dexlink").value;
    if(!url||!/mangadex\.org\/title\/[0-9]+\/[a-z\-]*/gm.test(url)) return Swal.fire("Error!", "You need to enter a MangaDex Title/Manga URL, like <u>https://mangadex.org/title/40646/nega-kun-and-posi-chan</u>",'error')
    let id = /\/[0-9]+\//g.exec(url)
    if(!id) return Swal.fire("Error!","There was an error finding ID from the URL you submitted","error")
    scrape(id)
}
// Start scraping!!!
function scrape(id){
    mangadex.getManga(id).then(({manga, chapter, group})=>{
        console.log(manga)
        document.getElementById("info").style.display = "block";
        document.getElementById("cover").src = manga.cover_url
        document.getElementById("title").innerText = manga.title
    })
}