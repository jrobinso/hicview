import HicFile from "../node_modules/hic-straw/src/hicFile.js";
import BrowserLocalFile from "../node_modules/hic-straw/src/io/browserLocalFile.js"

function init() {
    const fileWidget = document.getElementById("fileWidget");
    fileWidget.onchange = function() {
        const files = fileWidget.files;
        if(files && files.length > 0) {
            loadFile({
                file: files[0]
            })
        }
    }

    const urlWidget = document.getElementById("urlWidget");
    urlWidget.onchange = function () {
        const v = urlWidget.value;
        loadFile({url: v});
    }

    const loadButton = document.getElementById("urlLoadButton");
    loadButton.onclick = function () {
        const v = urlWidget.value;
        loadFile({url: v});
    }


}

async function loadFile(config) {

    const strawConfig = Object.assign({}, config);
    strawConfig.loadFragData = true;
    if(config.file) {
        strawConfig.file = new BrowserLocalFile(config.file);
    }
    const hicfile = new HicFile(strawConfig);
    const name = getName(config);
    await hicfile.init();

    const meta = await hicfile.getMetaData();

    const treeData = {
        'core': {
            'data': [
                {
                    "text": name, "state": {"opened": true}, "children": [
                        {
                            "text": "Header", "state": {"opened": true}, "children": [
                                {"text": `version:  ${meta.version}`},
                                {"text": `genome:  ${meta.genome}`},
                                {"id": "attributes", "text": "attributes"},
                                {"id": "chr", "text": "chromosomes"},
                                {"id": "bpr", "text": "bpResolutions"},
                                {"id": "fpr", "text": "fragResolutions"},
                                {"id": "sites", "text": "sites"}
                            ]
                        },
                        {
                            "text": "Body", "children": [
                            ]
                        },
                        {
                            "text": "Footer", "children": [
                                {"id": "ev", "text": "expectedValues"},
                                {"id": "nev", "text": "normalizedExpectedValues"},
                                {"id": "nv", "text": "normalizationVectors"},

                            ]
                        }
                    ]
                }
            ]
        }
    }

    $('#tree').jstree(treeData);

    $('#tree').on("changed.jstree", function (e, data) {
        const selectedElement = data.instance.get_selected(true)[0]
        const id = selectedElement.id;
        const text = selectedElement.text;
        switch (id) {
            case "attributes":
                attributes(hicfile);
                break;
            case "chr":
                chromosomes(hicfile);
                break;
            case "bpr":
                bpResolutions(hicfile);
                break;
            case "fpr":
                fragResolutions(hicfile);
                break;
            case "sites":
                sites(hicfile)
                break;
            default:
                document.getElementById("content").innerHTML = `${text} view not implemented.`;
        }
    });
}

function attributes(hicfile) {
    const content = document.getElementById("content");
    let string = "";
    for (let key of Object.keys(hicfile.attributes)) {
        string += `${key}: ${hicfile.attributes[key]}\n`;
    }
    content.innerHTML = string;
}

function chromosomes(hicfile) {
    const content = document.getElementById("content");
    let string = "";
    for (let chr of hicfile.chromosomes) {
        string += `${chr.index}  ${chr.name}  ${chr.size}\n`;
    }
    content.innerHTML = string;
}

function bpResolutions(hicfile) {
    const content = document.getElementById("content");
    let string = "";
    if (hicfile.bpResolutions) {
        let index = 0;
        for (let r of hicfile.bpResolutions) {
            string += `${index} ${r}\n`;
            index++;
        }
    }
    content.innerHTML = string;
}

function fragResolutions(hicfile) {
    const content = document.getElementById("content");
    let string = "";
    if (hicfile.fragResolutions) {
        let index = 0;
        for (let r of hicfile.fragResolutions) {
            string += `${index}  ${r}\n`;
            index++;
        }
    }
    content.innerHTML = string;
}

function sites(hicfile) {
    content.innerHTML = "Sites view not implemented";
}


function getName(config) {

    if(config.file) {
        return config.file.name;
    }
    const url = config.url;
    const idx = url.lastIndexOf("/");
    return idx > 0 ? url.substring(idx + 1) : url;

}

export {init, loadFile}