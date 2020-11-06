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
const $ = require("jquery")

const version = "4.0"
document.getElementById("info").style.display = "none";

let chapterNum = 1
let mangaTitle = ""
let pagePos = 0;

let buttons = []
let path;

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
                .then((result) => {
                    console.log(result)
                    console.log(res)
                    if (result.isConfirmed) {
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
function start() {
    let url = document.getElementById("dexlink").value;
    if (!url || !/mangadex\.org\/title\/[0-9]+\/[a-z\-]*/gm.test(url)) return Swal.fire("Error!", "You need to enter a MangaDex Title/Manga URL, like <u>https://mangadex.org/title/40646/nega-kun-and-posi-chan</u>", 'error')
    let id = /\/[0-9]+\//g.exec(url)
    if (!id) return Swal.fire("Error!", "There was an error finding ID from the URL you submitted", "error")
    //if(!path) return Swal.fire("Error!", "You need to select a folder where to save the manga!", "error")
    getChapters(id)
}
// Find chapters
function getChapters(id) {
    mangadex.getManga(id).then(({
        manga,
        chapter,
        group
    }) => {
        console.log(chapter)
        document.getElementById("info").style.display = "block";
        document.getElementById("cover").src = manga.cover_url
        document.getElementById("title").innerText = manga.title

        let filteredChapters = filterChapters(chapter)
        if (!filteredChapters) return Swal.fire("Oh no!", "No chapters were found in your selected language!\nTry another language or report a bug.", 'error')
        console.log(filteredChapters)
        let code = '<button onclick="selectAll(this)" data-enabledall="false">Select All</button><br>';
        let x = 0;
        filteredChapters.forEach(ch => {
            if (x > 3) {
                x = 0
                code += `<br><button class='disabled' data-enabled="false" data-chapterid='${ch.id}' onclick="chapterSel(this)">Chapter No. ${(ch.chapter !=""&&ch.chapter!=undefined)?ch.chapter:"?"}</button>`
            } else {
                x++
                code += `<button class='disabled' data-enabled="false" data-chapterid='${ch.id}' onclick="chapterSel(this)">Chapter No. ${(ch.chapter !=""&&ch.chapter!=undefined)?ch.chapter:"?"}</button>`
            }
        });
        code += "<br><button onclick='scrape()'>Scrape</button>"
        $("#chapters").html(code)
        let children = Array.prototype.slice.call($("#chapters").children())
        buttons = []
        children.forEach(e => {
            if ($(e).hasClass("enabled") || $(e).hasClass("disabled")) buttons.push(e)
        })
        mangaTitle = manga.title.replace(/[/\\?%*:|"<>]/g, '')
    })
}
// This function filters chapters to only the ones, that are in the language selected
function filterChapters(chapterObj) {
    let filteredChapters = []
    let lang = document.getElementById("lang").options[document.getElementById("lang").selectedIndex].value.toLowerCase()
    for (var i = 0; i < chapterObj.length; i++) {
        if (chapterObj[i].lang_name.toLowerCase() == lang) {
            filteredChapters.push(chapterObj[i])
            console.log("Found chapter in " + lang)
        }
    }
    if (filteredChapters.length == 0) return undefined;
    else return filteredChapters
}

function chapterSel(button) {
    console.log($(button).data("chapterid"))
    if ($(button).hasClass("enabled")) {
        $(button).removeClass("enabled")
        $(button).addClass("disabled")
    } else {
        $(button).removeClass("disabled")
        $(button).addClass("enabled")
    }
}

function selectAll(button) {
    console.log($(button).data("enabledall"))
    let children = Array.prototype.slice.call($("#chapters").children())
    buttons = []
    children.forEach(e => {
        if ($(e).hasClass("enabled") || $(e).hasClass("disabled")) buttons.push(e)
    })
    if ($(button).data("enabledall") == false) {
        buttons.forEach(b => {
            $(b).removeClass("disabled")
            $(b).addClass("enabled")
        })
        $(button).data("enabledall", true)
        $(button).text("Deselect All")
    } else {
        buttons.forEach(b => {
            $(b).removeClass("enabled")
            $(b).addClass("disabled")
        })
        $(button).data("enabledall", false)
        $(button).text("Select All")
    }
}

function scrape() {
    let enabledButtons = []
    buttons.forEach(e => {
        if ($(e).hasClass("enabled")) enabledButtons.push(e)
    })
    let chapterIds = []
    enabledButtons.forEach(b => {
        console.log($(b).data("chapterid"))
        chapterIds.push($(b).data("chapterid"))
    })
    chapterNum = 0
    console.log(chapterIds)
    download(chapterIds)
}

async function download(ids) {
    if (chapterNum <= ids.length) {
        chapterNum++
        $("#progress").text("Downloading chapter number "+chapterNum)
        mangadex.getChapter(ids[chapterNum - 1]).then((chapter) => {
            let groupname = chapter.group_name.replace(/[/\\?%*:|"<>]/g, '')
            let dlpath = `${path}\\${mangaTitle}\\Vol. ${(chapter.volume == "" || chapter.volume == undefined)?"??":chapter.volume} Ch. ${(chapter.chapter == "" || chapter.chapter == undefined)?"??":chapter.chapter} - ${groupname}`

            if (!fs.existsSync(dlpath)) {
                fs.mkdirSync(dlpath, {
                    recursive: true
                })
            }
            pagePos = 1
            console.log(chapter)
            await downloadChapter(chapter.page_array, dlpath)
        })
    }
    else{
        $("#progress").text("Download complete!")
    }
}

async function downloadChapter(pages, path) {
    if (pagePos < pages.length) {
        setTimeout(() => {
            await downloadImage(pages[pagePos], path)
        }, 2000)
    }
    else{
        return new Promise((resolve, reject) => {
            resolve()
        })
    }
}

async function downloadImage(url, path) {
    let writer = fs.createWriteStream(path)
    let response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })
    console.log("downloading from "+url)
    response.data.pipe(writer)
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}


function getFolder() {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(result => {
        if (result.canceled) {
            return;
        } else {
            path = result.filePaths[0]
            console.log(path)
        }
    }).catch(err => {
        console.log(err)
    })
}