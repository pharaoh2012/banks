const dd = require("./html/20241018.json")


function group(dd) {
    let lastBank = null;
    let banks = [];
    let ret = [];
    dd.forEach(d => {
        if (lastBank == d.short) {
            banks.push(d);
        }
        else {
            if (banks.length) {
                ret.push(banks);
            }
            banks = [];
            lastBank = d.short;
            banks.push(d);
        }
    });
    if (banks.length) ret.push(banks);
    console.info(ret);
    return ret;
}

function toHtml(d) {
    let contents = d.map(dd => `<h3>　💰${dd.title}</h3><p>　${dd.content.replace(/\n/g, "<br />")}</p>`);
    return `<details ${d[0].open ? "open" : ""}>
        <summary>🏦<b>${d[0].short}</b></summary>
        ${contents.join("\n")}
    </details>`
}

function toHtmlFull(dd) {
    const datas = group(dd.contents);
    const htmls = datas.map(d => toHtml(d));
    const fullHtml = `<h1>${dd.title}</h1>\n` + htmls.join('\n\n')
    const fs = require('fs')
    fs.writeFileSync(`./html/${dd.time}.html`, fullHtml)
    return;
}

toHtmlFull(dd);





