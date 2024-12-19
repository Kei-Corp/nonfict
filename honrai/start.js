const timeshash = {}, isreply = {};
let i = 0, loadCount = 8;
const megenTemplate = document.getElementById('megen_template');
const isRealtime = document.getElementById('is_realtime');
const message = document.getElementById("message");
const button = document.getElementById("button01");
let cansignup

let typed = new Typed('#catchcopy', {
    strings: ['自白剤を飲んで、<br>人狼ゲームを<br>しませんか？'],
    typeSpeed: 65,
});

!function(a,b){"function"==typeof define&&define.amd?define([],b):"undefined"!=typeof module&&module.exports?module.exports=b():a.ReconnectingWebSocket=b()}(this,function(){function a(b,c,d){function l(a,b){var c=document.createEvent("CustomEvent");return c.initCustomEvent(a,!1,!1,b),c}var e={debug:!1,automaticOpen:!0,reconnectInterval:1e3,maxReconnectInterval:3e4,reconnectDecay:1.5,timeoutInterval:2e3};d||(d={});for(var f in e)this[f]="undefined"!=typeof d[f]?d[f]:e[f];this.url=b,this.reconnectAttempts=0,this.readyState=WebSocket.CONNECTING,this.protocol=null;var h,g=this,i=!1,j=!1,k=document.createElement("div");k.addEventListener("open",function(a){g.onopen(a)}),k.addEventListener("close",function(a){g.onclose(a)}),k.addEventListener("connecting",function(a){g.onconnecting(a)}),k.addEventListener("message",function(a){g.onmessage(a)}),k.addEventListener("error",function(a){g.onerror(a)}),this.addEventListener=k.addEventListener.bind(k),this.removeEventListener=k.removeEventListener.bind(k),this.dispatchEvent=k.dispatchEvent.bind(k),this.open=function(b){h=new WebSocket(g.url,c||[]),b||k.dispatchEvent(l("connecting")),(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","attempt-connect",g.url);var d=h,e=setTimeout(function(){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","connection-timeout",g.url),j=!0,d.close(),j=!1},g.timeoutInterval);h.onopen=function(){clearTimeout(e),(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onopen",g.url),g.protocol=h.protocol,g.readyState=WebSocket.OPEN,g.reconnectAttempts=0;var d=l("open");d.isReconnect=b,b=!1,k.dispatchEvent(d)},h.onclose=function(c){if(clearTimeout(e),h=null,i)g.readyState=WebSocket.CLOSED,k.dispatchEvent(l("close"));else{g.readyState=WebSocket.CONNECTING;var d=l("connecting");d.code=c.code,d.reason=c.reason,d.wasClean=c.wasClean,k.dispatchEvent(d),b||j||((g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onclose",g.url),k.dispatchEvent(l("close")));var e=g.reconnectInterval*Math.pow(g.reconnectDecay,g.reconnectAttempts);setTimeout(function(){g.reconnectAttempts++,g.open(!0)},e>g.maxReconnectInterval?g.maxReconnectInterval:e)}},h.onmessage=function(b){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onmessage",g.url,b.data);var c=l("message");c.data=b.data,k.dispatchEvent(c)},h.onerror=function(b){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onerror",g.url,b),k.dispatchEvent(l("error"))}},1==this.automaticOpen&&this.open(!1),this.send=function(b){if(h)return(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","send",g.url,b),h.send(b);throw"INVALID_STATE_ERR : Pausing to reconnect websocket"},this.close=function(a,b){"undefined"==typeof a&&(a=1e3),i=!0,h&&h.close(a,b)},this.refresh=function(){h&&h.close()}}return a.prototype.onopen=function(){},a.prototype.onclose=function(){},a.prototype.onconnecting=function(){},a.prototype.onmessage=function(){},a.prototype.onerror=function(){},a.debugAll=!1,a.CONNECTING=WebSocket.CONNECTING,a.OPEN=WebSocket.OPEN,a.CLOSING=WebSocket.CLOSING,a.CLOSED=WebSocket.CLOSED,a});

const diff = (oldText, newText) => {
    let i = 0, j = 0;
    const ops = [];
    let currentOp = null;
    while (i < oldText.length || j < newText.length) {
        if (oldText[i] !== newText[j]) {
            if (!currentOp) {
                currentOp = { p: i, d: 0, i: '' };
                ops.push(currentOp);
            }
            if (i < oldText.length) {
                currentOp.del++;
                i++;
            }
            if (j < newText.length) {
                currentOp.ins += newText[j];
                j++;
            }
        } else {
            currentOp = null;
            i++; j++;
        }
    }
    return ops;
}

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

/*const fetchData = async () => {
    const pageBottom = document.getElementById("loading").getBoundingClientRect().top - document.body.clientHeight;
    if (i === 0 && pageBottom <= 25) {
        i = 1;
        const limit = Math.min(loadCount, 128);
        const response = await fetch(`/fetch/tl/${loadCount}/${loadCount + limit}/`);
        loadCount += limit;
        const data = await response.text();
        console.log(decodeZstd(data))
        const decompressed = decodeZstd(data)
        if (data.length > 0) {
            render(decompressed, true);
            i = 0;
        }
    }
};*/

const updateTimes = () => {
    Object.keys(timeshash).forEach(ppp => {
        const element = document.getElementById(ppp);
        if (!element) {
            delete timeshash[ppp];
            return;
        }
        const diff = new Date(Date.now() - timeshash[ppp]);
        element.querySelector('.date').innerHTML = ` / ${formatTime(diff)}`;
        if (Math.floor(diff.getTime() / 1000) >= 5 && element.querySelector('.delete')) {
            element.querySelector('.delete').remove();
        }
    });
};

setInterval(async () => {
    for (gggt of document.getElementsByClassName("timer")) gggt.innerHTML = (Math.max(parseFloat(gggt.innerHTML) - 0.1, 1.0)).toFixed(1);
}, 100);

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
            document.getElementById(data[1]).querySelector("#picture").src = data[2][0]
            document.getElementById(data[1]).querySelector("#pictures").className = document.getElementById(data[1]).querySelector("#pictures").className.replace('hidden', '')
        }else if(data[0] == "i_"){
            Object.keys(data[1]).forEach(async key => {
                document.getElementById(key).querySelector("#picture").src = JSON.parse(data[1][key])[0]
                document.getElementById(key).querySelector("#pictures").className = document.getElementById(key).querySelector("#pictures").className.replace('hidden', '')
            })
        }else{
            const clone = document.getElementById(data[0]) || megenTemplate.content.cloneNode(true);
            updateClonePatch(clone, data[1], data[0], await getHandleName(data[0]))
            if (data[1][0]["d"] >= 1) {
                document.getElementById(data[0]).getElementsByClassName("timer")[0].innerHTML = (Math.min(parseFloat(document.getElementById(data[0]).getElementsByClassName("timer")[0].innerHTML) + 1.0, 50)).toFixed(1)
            }
            if (!document.getElementById(data[0])) {
                const container = document.getElementById('megens');
                isBottom ? container.appendChild(clone) : container.prepend(clone);
            }
            if (document.getElementById(data[0]).querySelector('.description').textContent == ""){
                const aclone = document.getElementById(data[0]) || megenTemplate.content.cloneNode(true);
                aclone.remove()
            }
        }
    }else if(typeof data[Object.keys(data)[0]] == "string"){
        Object.keys(data).forEach(async key => {
            const clone = document.getElementById(key) || megenTemplate.content.cloneNode(true);
            updateCloneText(clone, data[key], key, await getHandleName(key));
            if (data[key] == ""){
                const aclone = document.getElementById(data[0]) || megenTemplate.content.cloneNode(true);
                aclone.remove()
            }
            if (!document.getElementById(key)) {
                const container = document.getElementById('megens');
                isBottom ? container.appendChild(clone) : container.prepend(clone);
            }
        });
    }else{
        const sortedKeys = Object.keys(data).sort((a, b) => new Date(data[a].t) - new Date(data[b].t));
        if (isBottom) sortedKeys.reverse();
        sortedKeys.forEach(key => updateOrCreateElement(data[key], key, isBottom));
    }
};

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

const updateElementWithParam = (data, key) => {
    const dom = document.getElementById(key);
    dom.querySelector('.lnum').innerHTML = data
}

const updateClonePatch = (clone, p, key, hn) => {
    if(!document.getElementById(key)) clone.children[0].setAttribute('id', key);
    clone.querySelectorAll('.proflink').forEach(a => a.href = `/u/${key}/`);
    // clone.querySelector('.date').innerHTML = ` / ${timeText}`;
    clone.querySelector('.usernickname').textContent = hn;
    clone.querySelector('.username').textContent = `@${key}`;
    clone.querySelector('img').src = `/${key}.webp`;
    clone.querySelector('.description').innerHTML = patch(clone.querySelector('.description').innerHTML, p);
}

const updateCloneText = (clone, p, key, hn) => {
    if(!document.getElementById(key)) clone.children[0].setAttribute('id', key);
    // clone.querySelector('.date').innerHTML = ` / ${timeText}`;
    clone.querySelector('.usernickname').textContent = hn;
    clone.querySelector('.username').textContent = `@${key}`;
    clone.querySelector('img').src = `/${key}.webp`;
    clone.querySelector('.description').innerHTML = p;
}

const updateClone = async (clone, data, key, hn) => {
    const diff = new Date().getTime() - new Date(data.t).getTime();
    const timeText = formatTime(new Date(diff));
    const isLoved = data.ruc === 1;
    const isPosted = data.posted === 1;

    toggleClass(clone, '.loved', isLoved, "hidden");
    toggleClass(clone, '.loving', !isLoved, "hidden");
    toggleClass(clone, '.luvving', !isLoved, "text-rose-500");
    toggleClass(clone, '.inputting', isPosted, "hidden");
    toggleClass(clone, '.heisposting', !isPosted, "hidden");
    toggleClass(clone, '.description', isPosted, "!text-slate-500");

    clone.querySelector('.description').innerHTML = data.c.replaceAll(/((?<!href="|href='|src="|src=')(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' class='text-emerald-500'>$1</a>");
    clone.querySelectorAll('.proflink').forEach(a => a.href = `/u/${data.user}/`);
    clone.querySelector('.usernickname').textContent = hn;
    clone.querySelector('.username').textContent = `@${data.user}`;
    clone.querySelector('.date').innerHTML = ` / ${timeText}`;
    clone.querySelector('img').src = `/${data.user}.webp`;
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
    clone.children[0].setAttribute('id', data.msgid || data.user);
    timeshash[clone.id] = new Date(data.t);
    clone.querySelector('.lnum').innerHTML = data.luv == 0 ? "" : data.luv;
    clone.querySelector('.num').innerHTML = data.dub == 0 ? "" : data.dub;
    clone.querySelector('.cnum').innerHTML = (!data.replys || data.replys == 0) ? "" : data.replys;

    let old = clone.querySelector('.description').innerHTML;
    let ptt = async (event) => {
        event.stopPropagation()
        clearInterval(isreply[key])
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
        }, Math.floor(2500 / Math.sqrt(tp - t)))
    }
    clone.querySelector(".replay").addEventListener("click", ptt)
};

const toggleClass = (element, selector, condition, className) => {
    const el = element.querySelector(selector);
    el.classList.toggle(className, !condition);
};

const ws = new ReconnectingWebSocket(`wss://${location.hostname}/ws/timeline/`);

ws.addEventListener("message", e => {
    render(decodeZstd(e.data))
});

setInterval(updateTimes, 1000);

async function sha1(message, mode="SHA-1") {
    const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
    const hashBuffer = await window.crypto.subtle.digest(mode, msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    return hashHex;
}
async function hibpCheck(pwd){
    const hash = await sha1(pwd);
    const _resp = await fetch('https://api.pwnedpasswords.com/range/'+hash.substr(0, 5).toUpperCase())
    const resp = await _resp.text()
    const matched = resp.match(new RegExp(hash.slice(5).substr(0, 35).toUpperCase()+":([0-9]*)"))
    if(matched==null){return 0}else{return parseInt(matched[1])}
}
usernameok = document.getElementById("usernameok")
username1 = document.getElementById("username1")
username1.addEventListener("input", function(){
    cansignup = false
    if(username1.value == ""){
        usernameok.innerText = "⚠ 入力してください"
        usernameok.className = usernameok.className.replace("hidden", "block")
        usernameok.className = usernameok.className.replace("emerald", "red")
    }else if(username1.value.length <= 3){
        usernameok.innerText = "⚠ 短すぎます"
        usernameok.className = usernameok.className.replace("hidden", "block")
        usernameok.className = usernameok.className.replace("emerald", "red")
    }else if(username1.value.length >= 16){
        usernameok.innerText = "⚠ 長すぎます"
        usernameok.className = usernameok.className.replace("hidden", "block")
        usernameok.className = usernameok.className.replace("emerald", "red")
    }else if(!username1.value.match(/^[a-zA-Z0-9_]+$/)){
        usernameok.innerText = "⚠ 英数字とアンダーバー(_)のみで入力してください"
        usernameok.className = usernameok.className.replace("hidden", "block")
        usernameok.className = usernameok.className.replace("emerald", "red")
    }else{
        cansignup = true
        usernameok.innerText = "✓ ユーザーIDは原則変更不可です。慎重にご決定ください"
        usernameok.className = usernameok.className.replace("red", "emerald")
    }
})
document.getElementById("password1").addEventListener("input", async function(){
    cansignup = false
    if(document.getElementById("password1").value == ""){
        document.getElementById("ryusyutu").innerText = "⚠ 入力してください"
        document.getElementById("ryusyutu").className = document.getElementById("ryusyutu").className.replace("emerald", "red")
    }else if(document.getElementById("password1").value.length <= 3){
        document.getElementById("ryusyutu").innerText = "⚠ 短すぎます"
        document.getElementById("ryusyutu").className = document.getElementById("ryusyutu").className.replace("emerald", "red")
    }else{
        let out = await hibpCheck(document.getElementById("password1").value)
        if(out==0){
            cansignup = true
            document.getElementById("ryusyutu").innerText = "✓ 安全なパスワードです。使い回さないでくださいね"
            document.getElementById("ryusyutu").className = document.getElementById("ryusyutu").className.replace("red", "emerald")
        }else{
            document.getElementById("ryusyutu").innerText = "⚠ 他サービスで" + out + "件の流出が確認されました"
            document.getElementById("ryusyutu").className = document.getElementById("ryusyutu").className.replace("emerald", "red")
        }
    }
})
async function signup(){
    if(cansignup){
        const _resp = await fetch("/fetch/create-account/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "username": username1.value,
                "password": await sha1(document.getElementById("password1").value, "SHA-256"),
                "handlename": document.getElementById("handlename").value,
            }) ,
            credentials: 'same-origin',
        })
        p = await _resp.text()
        document.getElementById("returnmodal").innerHTML=p
        location.hash = "returnkekka"
        if(p == "アカウントの作成に成功しました！"){
            setTimeout(()=>{location.reload()}, 1000)
        }
    }
}
async function login(){
    const _resp = await fetch("/fetch/login/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": document.getElementById("username0").value,
            "password": await sha1(document.getElementById("password0").value, "SHA-256"),
        }) ,
        credentials: 'same-origin',
    })
    p = await _resp.text()
    document.getElementById("returnmodal").innerHTML=p
    location.hash = "returnkekka"
    if(p == "ログインに成功しました！"){
        setTimeout(()=>{location.hash=""; location.reload()}, 1000)
    }
}

setTimeout(()=>{
    location.hash = "sign-up"
}, 50000)