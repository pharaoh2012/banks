
// const fs = require('fs')
async function getRss() {
    const url = "https://rssreader.65515107.xyz/api/reader/rss?all=1&star=0&search=%E5%90%84%E5%A4%A7%E9%93%B6%E8%A1%8C%E6%B4%BB%E5%8A%A8%E5%88%86%E4%BA%AB%EF%BC%8C%E5%A5%BD%E7%94%A8%E5%85%B3%E6%B3%A8%E6%8E%A8%E8%8D%90&inserttime=0&t=1730079799604";
    const data = await fetch(url).then(response => response.json())
    let contents = data.map(d => {
        let time = new Date(d.inserttime + 8 * 3600 * 1000)
        console.log(time.toISOString().split('T')[0], d.title)
        let content = d.description.replace(/<.+?>/g, '')
        // console.log(content)
        return {
            title: d.title,
            content: content,
            time: time.toISOString().split('T')[0].replace(/-/g, '')
        }
    })

    await parseData(contents);
    // fs.writeFileSync('./data.json', JSON.stringify(contents))

}

getRss()

const BANKS = [
    '广发', '交行', '浦发',
    '光大', '平安', '中信',
    '云闪付', '浙商', '中行',
    '民生', '农行', '建行',
    '邮储', '云缴费', '京东',
    '和包', '微信', '招行',
    '淘宝', '运通', '上海银行',
    '上银', '北京银行', '工行',
    '兴业', '杭银', '苏银',
    '白金卡', '北银', '华为钱包',
    '华夏'
]

const CLOSE_INDEX = 19;

const reg = /^(.+)?（.+?）$/
async function parseData(data) {
    //let banks = [];
    for (let i = 0; i < data.length; i++) {
        const dd = data[i];
        // console.log(dd)
        let c = dd.content.split('\n\n').filter(d => d);
        // console.info(c.join("\n---------------\n"));
        let ct = c.map(d => {
            let ll = d.split("\n").find(l => reg.test(l))
            // console.info({ ll })
            if (ll) {
                const m = reg.exec(ll);
                // console.info(m[1]);
                // banks.push(m[1]);
                return {
                    // time: dd.time,
                    //short: findBanks(m[1]),
                    bank: m[1],
                    title: ll,
                    content: d.split(ll).join("").trim().replace("\n\n", "\n"),
                    ...findBanks(m[1])
                }
            }
        }).filter(d => d);
        ct.sort((a, b) => a.index - b.index);
        ct.forEach(c => {
            c.open = c.index <= CLOSE_INDEX;
        });
        ct = {
            title: dd.title,
            time: dd.time,
            contents: ct
        }
        // console.info(ct);
        const fs = require('fs')
        fs.writeFileSync(`./html/${dd.time}.json`, JSON.stringify(ct, null, 2));
        // fs.writeFileSync('./html/banks.json', JSON.stringify(banks));
        toHtmlFull(ct);
        await uploadJson(ct, dd.time);

    }

}

async function uploadJson(json, time) {
    for (let i = 0; i < json.length; i++) {
        try {
            let res = await fetch(`https://r2object.65515107.xyz/banks/${time}.json`, {
                "body": JSON.stringify(json),
                "method": "POST",
            })
            console.info(await res.text())
            return;
        } catch (error) {
            console.log(error)
            await sleep(2000);
        }
    }

}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function findBanks(name) {
    for (let i = 0; i < BANKS.length; i++) {
        if (name.includes(BANKS[i])) return {
            short: BANKS[i],
            index: i
        }
    }
    return {
        short: name,
        index: 1000
    }
    //let short = BANKS.find(b => name.includes(b)) ?? name;
}


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
    // console.info(ret);
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

