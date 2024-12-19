let timeshash = {}, rruris = {}, isreply = {}, hihj = []
let ws2
let mmmd = true, iiii = [];
let i = 0, loadCount = 6;
const megenTemplate = document.getElementById('megen_template');
const isRealtime = document.getElementById('is_realtime');
const message = document.getElementById("message");
const button = document.getElementById("button01");
const uploadbutton = document.getElementById("button02");
const uploader = document.getElementById("upload01");

message.addEventListener("dragenter", ()=>{
    
})

const getCookie = name => {
    const cookieName = `${name}=`;
    const allcookies = document.cookie;
    const position = allcookies.indexOf(cookieName);
    if (position !== -1) {
        const startIndex = position + cookieName.length;
        const endIndex = allcookies.indexOf(';', startIndex) === -1 ? allcookies.length : allcookies.indexOf(';', startIndex);
        return decodeURIComponent(allcookies.substring(startIndex, endIndex));
    }
    return null;
  };
uploadbutton.addEventListener("click", () => uploader.click())

uploader.addEventListener("change", (e) => {
	const fd = new FormData();
    const xhr = new XMLHttpRequest();

    if(message.value.trim()){
        fd.append('uploadfile', e.target.files[0]);
        xhr.onreadystatechange = function(e) {
            if(xhr.readyState == 4){
                console.log("uploaded!")
                setTimeout(()=>{
                    document.getElementById("temp").innerHTML += `<img src="${xhr.responseText}" class="h-10 border-emerald-500 border-2"/>`
                    document.getElementById("button02").classList.add("hidden")
                }, 300)
            }
        };
        xhr.open('POST', '/upload/')
        xhr.send(fd);
    }
})

message.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.items && e.dataTransfer.items[0].kind == "file" && message.value.trim()) {
        const fd = new FormData();
        const xhr = new XMLHttpRequest();
    
        fd.append('uploadfile', e.dataTransfer.items[0].getAsFile());
        xhr.onreadystatechange = function(e) {
            if(xhr.readyState == 4){
                console.log("uploaded!")
                setTimeout(()=>{
                    document.getElementById("temp").innerHTML += `<img src="${xhr.responseText}" class="h-10 border-emerald-500 border-2"/>`
                    document.getElementById("button02").classList.add("hidden")
                }, 300)
            }
        };
        xhr.open('POST', '/upload/')
        xhr.send(fd);
    }
})

!function(a,b){"function"==typeof define&&define.amd?define([],b):"undefined"!=typeof module&&module.exports?module.exports=b():a.ReconnectingWebSocket=b()}(this,function(){function a(b,c,d){function l(a,b){var c=document.createEvent("CustomEvent");return c.initCustomEvent(a,!1,!1,b),c}var e={debug:!1,automaticOpen:!0,reconnectInterval:1e3,maxReconnectInterval:3e4,reconnectDecay:1.5,timeoutInterval:2e3};d||(d={});for(var f in e)this[f]="undefined"!=typeof d[f]?d[f]:e[f];this.url=b,this.reconnectAttempts=0,this.readyState=WebSocket.CONNECTING,this.protocol=null;var h,g=this,i=!1,j=!1,k=document.createElement("div");k.addEventListener("open",function(a){g.onopen(a)}),k.addEventListener("close",function(a){g.onclose(a)}),k.addEventListener("connecting",function(a){g.onconnecting(a)}),k.addEventListener("message",function(a){g.onmessage(a)}),k.addEventListener("error",function(a){g.onerror(a)}),this.addEventListener=k.addEventListener.bind(k),this.removeEventListener=k.removeEventListener.bind(k),this.dispatchEvent=k.dispatchEvent.bind(k),this.open=function(b){h=new WebSocket(g.url,c||[]),b||k.dispatchEvent(l("connecting")),(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","attempt-connect",g.url);var d=h,e=setTimeout(function(){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","connection-timeout",g.url),j=!0,d.close(),j=!1},g.timeoutInterval);h.onopen=function(){clearTimeout(e),(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onopen",g.url),g.protocol=h.protocol,g.readyState=WebSocket.OPEN,g.reconnectAttempts=0;var d=l("open");d.isReconnect=b,b=!1,k.dispatchEvent(d)},h.onclose=function(c){if(clearTimeout(e),h=null,i)g.readyState=WebSocket.CLOSED,k.dispatchEvent(l("close"));else{g.readyState=WebSocket.CONNECTING;var d=l("connecting");d.code=c.code,d.reason=c.reason,d.wasClean=c.wasClean,k.dispatchEvent(d),b||j||((g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onclose",g.url),k.dispatchEvent(l("close")));var e=g.reconnectInterval*Math.pow(g.reconnectDecay,g.reconnectAttempts);setTimeout(function(){g.reconnectAttempts++,g.open(!0)},e>g.maxReconnectInterval?g.maxReconnectInterval:e)}},h.onmessage=function(b){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onmessage",g.url,b.data);var c=l("message");c.data=b.data,k.dispatchEvent(c)},h.onerror=function(b){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onerror",g.url,b),k.dispatchEvent(l("error"))}},1==this.automaticOpen&&this.open(!1),this.send=function(b){if(h)return(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","send",g.url,b),h.send(b);throw"INVALID_STATE_ERR : Pausing to reconnect websocket"},this.close=function(a,b){"undefined"==typeof a&&(a=1e3),i=!0,h&&h.close(a,b)},this.refresh=function(){h&&h.close()}}return a.prototype.onopen=function(){},a.prototype.onclose=function(){},a.prototype.onconnecting=function(){},a.prototype.onmessage=function(){},a.prototype.onerror=function(){},a.debugAll=!1,a.CONNECTING=WebSocket.CONNECTING,a.OPEN=WebSocket.OPEN,a.CLOSING=WebSocket.CLOSING,a.CLOSED=WebSocket.CLOSED,a});

const patch = (text, ops) => {
    let result = text;
    for (let {p, d, i} of ops) {
        result = result.slice(0, p) + i + result.slice(p + d);
    }
    return result;
}

const decodeZstd = d => JSON.parse(d.startsWith("[") || d.startsWith("{") ? d : new TextDecoder().decode(fzstd.decompress(new Uint8Array(decode(d)))))

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getHandleName = async (hn, itemname = "hn") => {
    if(sessionStorage.getItem(hn) != undefined)
        return sessionStorage.getItem(hn)
    sessionStorage[hn] = await (await fetch(`/fetch/${itemname}/${hn}/`, { method: 'POST' })).text();
    return sessionStorage[hn]
}

const fetchData = async () => {
    const pageBottom = document.getElementById("loading").getBoundingClientRect().top - document.body.clientHeight;
    if (i === 0 && pageBottom <= 100) {
        console.log(loadCount)
        i = 1;
        const limit = Math.min(loadCount, 48);
        const response = await fetch(`/fetch/tl${mmmd?"":"f"}/${loadCount - 6}/${loadCount + limit - 6 - 1}/`);
        loadCount += limit;
        const data = await response.text();
        console.log(decodeZstd(data))
        const decompressed = decodeZstd(data)
        if (data.length > 0) {
            render(decompressed, true);
            i = 0;
        }
        if(Object.keys(decompressed).length === 0){
            clearInterval(fetttch)
        }
    }
};

const updateTimes = () => {
    Object.keys(timeshash).forEach(ppp => {
        const element = document.getElementById(ppp);
        if (!element) {
            delete timeshash[ppp];
            return;
        }
        if (element.querySelector('.date').innerHTML.startsWith(" / リプレイ中")) return
        const diff = new Date(Date.now() - timeshash[ppp]);
        element.querySelector('.date').innerHTML = ` / ${formatTime(diff)}`;
        if (Math.floor(diff.getTime() / 1000) >= 5 && element.querySelector('.delete')) {
            element.querySelector('.delete').remove();
        }
    });
};

let fetttch = setInterval(fetchData, 100);
setInterval(updateTimes, 1000);

const formatTime = diff => {
    const units = [
        { unit: '年', value: diff.getUTCFullYear() - 1970 },
        { unit: 'ヶ月', value: diff.getUTCMonth() },
        { unit: '日', value: diff.getUTCDate() - 1 },
        { unit: '時間', value: diff.getUTCHours() },
        { unit: '分', value: diff.getUTCMinutes() },
        { unit: '秒', value: Math.floor(diff.getTime() / 1000) }
    ];
    for (const { unit, value } of units) {
        if (value) return value + unit;
    }
    return 'ついさっき';
};

const render = async (data, isBottom = false) => {
    if(data.length != undefined){
        if(data[0] == "l"){
            updateElementWithParam(data[2], data[1])
        }else if(data[0] == "_i"){
            if(!mmmd && !iiii.includes(data[1]) && data[1] != getCookie("username")) return
            document.getElementById(data[1]).querySelector("#picture").src = data[2][0]
            document.getElementById(data[1]).querySelector("#pictures").className = document.getElementById(data[1]).querySelector("#pictures").className.replace('hidden', '')
        }else if(data[0] == "i_"){
            Object.keys(data[1]).forEach(async key => {
                if(!mmmd && !iiii.includes(key) && key != getCookie("username")) return
                document.getElementById(key).querySelector("#picture").src = JSON.parse(data[1][key])[0]
                document.getElementById(key).querySelector("#pictures").className = document.getElementById(key).querySelector("#pictures").className.replace('hidden', '')
            })
        }else{
            if(!mmmd && !iiii.includes(data[0]) && data[0] != getCookie("username")) return
            const clone = document.getElementById(data[0]) || megenTemplate.content.cloneNode(true);
            updateClonePatch(clone, data[1], data[0], await getHandleName(data[0]))
            if (data[1][0]["d"] >= 1) {
                document.getElementById(data[0]).getElementsByClassName("timer")[0].innerHTML = (Math.min(parseFloat(document.getElementById(data[0]).getElementsByClassName("timer")[0].innerHTML) + 1.0, 50)).toFixed(1)
            }
            if (!document.getElementById(data[0])) {
                const container = document.getElementById('megens');
                isBottom ? container.appendChild(clone) : container.prepend(clone);
                document.getElementById(data[0]).querySelector('.luvving').addEventListener("click", async () => {
                    let key = data[0]
                    let luc = await (await fetch(`/fetch/like/${key}/`, { method: 'POST' })).text();
                    let ldom = document.getElementById(key).querySelector(".lnum")
                    toggleClass(document.getElementById(key), '.loved', luc=="1", "hidden");
                    toggleClass(document.getElementById(key), '.loving', luc!="1", "hidden");
                    toggleClass(document.getElementById(key), '.luvving', luc!="1", "text-rose-500");
                    ldom.innerHTML = (parseInt(ldom.innerHTML) ? parseInt(ldom.innerHTML) : 0) + parseInt(luc)
                    ldom.innerHTML = ldom.innerHTML==0 ? "" : ldom.innerHTML
                    rruris[key] = luc=="1" ? 1 : 0
                });
            }
            if (document.getElementById(data[0]).querySelector('.description').textContent == ""){
                const aclone = document.getElementById(data[0]) || megenTemplate.content.cloneNode(true);
                aclone.remove()
            }
        }
    }else if(typeof data[Object.keys(data)[0]] == "string"){
        Object.keys(data).forEach(async key => {
            if(!mmmd && !iiii.includes(data[key].user) && data[key].user != getCookie("username")) return
            const clone = document.getElementById(key) || megenTemplate.content.cloneNode(true);
            updateCloneText(clone, data[key], key, await getHandleName(key));
            if (data[key] == ""){
                const aclone = document.getElementById(data[0]) || megenTemplate.content.cloneNode(true);
                aclone.remove()
            }
            if (!document.getElementById(key)) {
                const container = document.getElementById('megens');
                isBottom ? container.appendChild(clone) : container.prepend(clone);
                document.getElementById(key).querySelector('.luvving').addEventListener("click", async () => {
                    let luc = await (await fetch(`/fetch/like/${key}/`, { method: 'POST' })).text();
                    let ldom = document.getElementById(key).querySelector(".lnum")
                    toggleClass(document.getElementById(key), '.loved', luc=="1", "hidden");
                    toggleClass(document.getElementById(key), '.loving', luc!="1", "hidden");
                    toggleClass(document.getElementById(key), '.luvving', luc!="1", "text-rose-500");
                    ldom.innerHTML = (parseInt(ldom.innerHTML) ? parseInt(ldom.innerHTML) : 0) + parseInt(luc)
                    ldom.innerHTML = ldom.innerHTML==0 ? "" : ldom.innerHTML
                    rruris[key] = luc=="1" ? 1 : 0
                });
            }
        });
    }else{
        let sortedKeys = Object.keys(data).sort((a, b) => new Date(data[a].t).getTime() - new Date(data[b].t).getTime());
        if (isBottom) sortedKeys.reverse();
        for(key of sortedKeys){
            if(!mmmd && !iiii.includes(data[key].user) && data[key].user != getCookie("username")) return
            await updateOrCreateElement(data[key], key, isBottom)
        }
    }
};

const updateElementWithParam = (data, key) => {
    const dom = document.getElementById(key);
    dom.querySelector('.lnum').innerHTML = data
}

const updateOrCreateElement = async  (data, key, isBottom) => {
    if (!data.c || data.c == "") {
        const existingElement = document.getElementById(key);
        if (existingElement) existingElement.remove();
        return;
    }
    const clone = document.getElementById(key) || megenTemplate.content.cloneNode(true);
    await updateClone(clone, data, key, await getHandleName(data.user));
    if (!document.getElementById(key)) {
        timeshash[key] = new Date(data.t);
        const container = document.getElementById('megens');
        isBottom ? container.appendChild(clone) : container.prepend(clone);
    }
};

const updateClonePatch = (clone, p, key, hn) => {
    if(!document.getElementById(key)) clone.children[0].setAttribute('id', key);
    clone.querySelectorAll('.proflink').forEach(a => a.href = `/u/${key}/`);
    // clone.querySelector('.date').innerHTML = ` / ${timeText}`;
    clone.querySelector('.usernickname').textContent = hn;
    clone.querySelector('.username').textContent = `@${key}`;
    clone.querySelector('.proflink img').src = `/${key}.webp`;
    clone.querySelector('.description').innerHTML = patch(clone.querySelector('.description').innerHTML, p);
}

const updateCloneText = (clone, p, key, hn) => {
    if(!document.getElementById(key)) clone.children[0].setAttribute('id', key);
    // clone.querySelector('.date').innerHTML = ` / ${timeText}`;
    clone.querySelector('.usernickname').textContent = hn;
    clone.querySelector('.username').textContent = `@${key}`;
    clone.querySelector('.proflink img').src = `/${key}.webp`;
    clone.querySelector('.description').innerHTML = p.replaceAll(/((?<!href="|href='|src="|src=')(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' class='text-emerald-500'>$1</a>");
}

const updateClone = async (clone, data, key, hn) => {
    const diff = new Date().getTime() - new Date(data.t).getTime();
    const timeText = formatTime(new Date(diff));
    const isLoved = data.ruc === 1;
    const isDubbed = data.dueb === 1;
    const isPosted = data.posted === 1;

    toggleClass(clone, '.loved', isLoved, "hidden");
    toggleClass(clone, '.loving', !isLoved, "hidden");
    toggleClass(clone, '.luvving', !isLoved, "text-rose-500");
    toggleClass(clone, '.boost', !isDubbed, "text-violet-500");
    toggleClass(clone, '.inputting', isPosted, "hidden");
    toggleClass(clone, '.heisposting', !isPosted, "hidden");
    toggleClass(clone, '.description', isPosted, "!text-slate-500");
    toggleClass(clone, '.delete', data.user == getCookie("username") && (Math.floor(diff / 1000) <= 5), "hidden");

    clone.querySelector('.description').innerHTML = data.c.replaceAll(/((?<!href="|href='|src="|src=')(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' class='text-emerald-500'>$1</a>")
    clone.querySelectorAll('.proflink').forEach(a => a.href = `/u/${data.user}/`);
    clone.querySelector('.usernickname').textContent = hn;
    clone.querySelector('.username').textContent = `@${data.user}`;
    clone.querySelector('.date').innerHTML = ` / ${timeText}`;
    clone.querySelector('.proflink img').src = `/${data.user}.webp`;
    if(data.whorted){
        clone.querySelector('.boosterlink').classList.remove('hidden')
        clone.querySelector('.boosterlink').href = `/u/${data.whorted}/`
        clone.querySelector('.ygrehj').innerHTML = await getHandleName(data.whorted)
    }
    if(data.toreply){
        clone.querySelector('.replyerlink').classList.remove('hidden')
        clone.querySelector('.replyerlink').href = `/p/${data.toreply}/`
        clone.querySelector('.ygrehj2').innerHTML = await getHandleName(data.toreplyw)
        clone.querySelector('.yreuhi').innerHTML = data.toreplyb
        clone.querySelector('.comment').classList.add('hidden')
    }
    if(data.img){
        clone.querySelector('#picture').src = data.img
        clone.querySelector('#pictures').className = clone.querySelector('#pictures').className.replace('hidden', '')
    }
    clone.children[0].setAttribute('id', data.msgid || data.user);
    clone.children[0].addEventListener('click', () => {
        document.getElementById(data.msgid).style = "view-transition-name: " + data.msgid;
        location.href = `/p/${data.msgid}`
    })
    timeshash[clone.id] = new Date(data.t);
    clone.querySelector('.lnum').innerHTML = data.luv == 0 ? "" : data.luv;
    clone.querySelector('.num').innerHTML = data.dub == 0 ? "" : data.dub;
    clone.querySelector('.cnum').innerHTML = (!data.replys || data.replys == 0) ? "" : data.replys;

    if (data.msgid && !hihj.includes(key)){
        hihj.push(key)
        setupEventListeners(clone, key);
    }
};

const toggleClass = (element, selector, condition, className) => {
    const el = element.querySelector(selector);
    if(el) el.classList.toggle(className, !condition);
};

const setupEventListeners = (clone, key) => {
    clone.querySelector('.delete').addEventListener("click", async () => {
        fetch(`/fetch/delete/${key}/`, { method: 'POST' });
        document.getElementById(key).remove();
    });
    clone.querySelector('.luvving').addEventListener("click", async (event) => {
        event.stopPropagation()
        let luc = await (await fetch(`/fetch/like/${key}/`, { method: 'POST' })).text();
        let ldom = document.getElementById(key).querySelector(".lnum")
        toggleClass(document.getElementById(key), '.loved', luc=="1", "hidden");
        toggleClass(document.getElementById(key), '.loving', luc!="1", "hidden");
        toggleClass(document.getElementById(key), '.luvving', luc!="1", "text-rose-500");
        ldom.innerHTML = (parseInt(ldom.innerHTML) ? parseInt(ldom.innerHTML) : 0) + parseInt(luc)
        ldom.innerHTML = ldom.innerHTML==0 ? "" : ldom.innerHTML
        rruris[key] = luc=="1" ? 1 : 0
    });
    clone.querySelector('.boost').addEventListener("click", async (event) => {
        event.stopPropagation()
        let luc = await (await fetch(`/fetch/boost/${key}/`, { method: 'POST' })).text();
        let ldom = document.getElementById(key).querySelector(".num")
        toggleClass(document.getElementById(key), '.boost', luc!="1", "text-violet-500");
        ldom.innerHTML = (parseInt(ldom.innerHTML) ? parseInt(ldom.innerHTML) : 0) + parseInt(luc)
        ldom.innerHTML = ldom.innerHTML==0 ? "" : ldom.innerHTML
        rruris[key] = luc=="1" ? 1 : 0
    });
    let old = clone.querySelector('.description').innerHTML;
    let ptt = async (event) => {
        event.stopPropagation()
        clearInterval(isreply[key])
        if(location.search == ''){
            ws2.send(JSON.stringify(["rp", key]))
        }
        toggleClass(document.getElementById(key), '.description', false, "!text-slate-500");
        toggleClass(document.getElementById(key), '.heisposting', true, "hidden");
        toggleClass(document.getElementById(key), '.heisposting', false, "grayscale");
        toggleClass(document.getElementById(key), '.usernickname', false, "grayscale");
        let otime = document.getElementById(key).querySelector('.date').innerHTML;
        document.getElementById(key).querySelector('.date').innerHTML = ` / リプレイ中`;
        document.getElementById(key).querySelector('.description').innerHTML = ""
        let hist = decodeZstd(await getHandleName(key, "history"));
        let i = 0, t = parseInt(hist[0][1]), tp = parseInt(hist.slice(-1)[0][1])
        isreply[key] = setInterval(()=>{
            while(parseInt(hist[i][1]) < t){
                if(hist.length-1 <= i){
                    toggleClass(document.getElementById(key), '.description', true, "!text-slate-500");
                    toggleClass(document.getElementById(key), '.heisposting', false, "hidden");
                    toggleClass(document.getElementById(key), '.heisposting', true, "grayscale");
                    toggleClass(document.getElementById(key), '.usernickname', true, "grayscale");
                    document.getElementById(key).querySelector('.description').innerHTML = old
                    document.getElementById(key).querySelector('.date').innerHTML = otime
                    clearInterval(isreply[key])
                    setTimeout(()=>{delete isreply[key]}, 500)
                    return
                }
                document.getElementById(key).querySelector('.description').innerHTML = patch(document.getElementById(key).querySelector('.description').innerHTML, hist[i][0])
                i += 1
            }
            t += 50
            document.getElementById(key).querySelector('.date').innerHTML = ` / リプレイ中 残り${((tp - t)/1000).toFixed(1)}秒`;
        }, 17)
    }
    clone.querySelector(".replay").addEventListener("click", ptt)
    //clone.querySelector(".description").addEventListener("mouseover", ptt)
    //clone.querySelector(".description").addEventListener("touchstart", ptt)
};
const ws = new ReconnectingWebSocket(`wss://${location.hostname}/ws/typing/${getCookie("username")}/${getCookie("secret_key")}/`);

document.getElementById("switch-following").addEventListener("click", async () => {
    mmmd = false
    i = 0
    loadCount = 6
    document.getElementById("megens").innerHTML = ""
    document.getElementById("switch-all").className = "cursor-pointer w-1/2 p-4 text-center text-slate-500 text-lg"
    document.getElementById("switch-following").className = "cursor-pointer w-1/2 p-4 text-center text-emerald-500 border-b-2 border-emerald-500 font-semibold text-lg"
    clearInterval(fetttch)
    fetttch = setInterval(fetchData, 100)
    iiii = await decodeZstd(await (await fetch("/fetch/followees/" + getCookie("username"))).text())
    iiii.push(getCookie("username"))
})

document.getElementById("switch-all").addEventListener("click", () => {
    mmmd = true
    i = 0
    loadCount = 6
    document.getElementById("megens").innerHTML = ""
    document.getElementById("switch-all").className = "cursor-pointer w-1/2 p-4 text-center text-emerald-500 border-b-2 border-emerald-500 font-semibold text-lg"
    document.getElementById("switch-following").className = "cursor-pointer w-1/2 p-4 text-center text-slate-500 text-lg"
    clearInterval(fetttch)
    fetttch = setInterval(fetchData, 100)
})

button.addEventListener("mousedown", async () => {
    fetch("/fetch/post/", { method: 'POST', body: message.value, credentials: 'include' });
    document.getElementById("temp").innerHTML = ""
    message.value = "";
    isRealtime.style.visibility = "hidden";
    typingTimeout = -1;
});

let typingTimeout = -1;
setInterval(async () => {
    if (typingTimeout > -1) typingTimeout -= 0.1;
    document.getElementById("timer").innerHTML = typingTimeout.toFixed(1);
    for (gggt of document.getElementsByClassName("timer")) gggt.innerHTML = (Math.max(parseFloat(gggt.innerHTML) - 0.1, 1.0)).toFixed(1);
    if (document.querySelector(`#${getCookie("username")} .timer`)) document.querySelector(`#${getCookie("username")} .timer`).innerHTML = typingTimeout.toFixed(1);
    if (typingTimeout <= 0 && typingTimeout > -1 && message.value.trim()) {
        fetch("/fetch/post/", { method: 'POST', body: message.value, credentials: 'include' });
        document.getElementById("temp").innerHTML = ""
        document.getElementById("button02").classList.add("hidden")
        message.value = "";
        isRealtime.style.visibility = "hidden";
        typingTimeout = -1;
    }
}, 100);

message.focus();
message.addEventListener("input", () => {
    const trimmedValue = message.value.trim();
    if(trimmedValue){
        isRealtime.style.visibility = "visible"
        if(typingTimeout <= 0) typingTimeout = 50;
        document.getElementById("timer").innerHTML = typingTimeout.toFixed(1);
        if(document.getElementById("temp").innerHTML.trim() == "")
            document.getElementById("button02").classList.remove("hidden")
    }else{
        isRealtime.style.visibility = "hidden";
        document.getElementById("temp").innerHTML = ""
        document.getElementById("button02").classList.add("hidden")
        typingTimeout = -1;
    }
    if (message.value.length > 1024) message.value = message.value.slice(0, 1024);
    //const userElement = document.getElementById(getCookie("username"));
    //if (userElement) userElement.querySelector('.description').innerHTML = message.value;
    ws.send(message.value.replace(/\n{3,}/g, "\n\n").replace(/([ 　])[ 　]+/g, "$1"));
});
message.addEventListener('keydown', ({key}) => {
    if (key === "Backspace" || key === "Delete") {
        typingTimeout += 1.0;
        typingTimeout = (typingTimeout >= 50) ? 50: typingTimeout
        document.getElementById("timer").innerHTML = typingTimeout.toFixed(1);
    }
});

ws.addEventListener("message", e => {
    console.log(decodeZstd(e.data))
    render(decodeZstd(e.data))
});

if(location.search == ''){
    ws2 = new ReconnectingWebSocket(`wss://${location.hostname}/ws/screenshare/${getCookie("username")}/${getCookie("secret_key")}/`)

    let aer = 0
    ws2.addEventListener("open", ()=>{ws2.send(location.pathname); ws2.send(JSON.stringify([window.innerWidth, window.innerHeight, scrollY]))})
    setInterval(()=>{ws2.send(location.pathname);}, 5000)
    window.addEventListener("focus", () => {ws2.send(location.pathname);})
    window.addEventListener("scroll", async ()=>{
        aer += 1
        if(aer > 16) aer = 0;ws2.send(JSON.stringify([window.innerWidth, window.innerHeight, scrollY]))
    });
    window.addEventListener("resize", async ()=>{
        aer += 1
        if(aer > 16) aer = 0;ws2.send(JSON.stringify([window.innerWidth, window.innerHeight, scrollY]))
    });
}

const checknotify = async ()=>{
    if(parseInt(await (await fetch("/fetch/how_notify/")).text()) > 0){
        document.getElementById("nnn").classList.remove("hidden")
    }else{
        document.getElementById("nnn").classList.add("hidden")
    }
}
checknotify()
setInterval(checknotify, 60000)