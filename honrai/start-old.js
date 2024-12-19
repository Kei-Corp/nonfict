
let hash = {}
let timeshash = {}
let typed = new Typed('#catchcopy', {
    strings: ['自白剤を飲んで、<br>人狼ゲームを<br>しませんか？'],
    typeSpeed: 55,
});
let megen_template = document.getElementById('megen_template');
!function(a,b){"function"==typeof define&&define.amd?define([],b):"undefined"!=typeof module&&module.exports?module.exports=b():a.ReconnectingWebSocket=b()}(this,function(){function a(b,c,d){function l(a,b){var c=document.createEvent("CustomEvent");return c.initCustomEvent(a,!1,!1,b),c}var e={debug:!1,automaticOpen:!0,reconnectInterval:1e3,maxReconnectInterval:3e4,reconnectDecay:1.5,timeoutInterval:2e3};d||(d={});for(var f in e)this[f]="undefined"!=typeof d[f]?d[f]:e[f];this.url=b,this.reconnectAttempts=0,this.readyState=WebSocket.CONNECTING,this.protocol=null;var h,g=this,i=!1,j=!1,k=document.createElement("div");k.addEventListener("open",function(a){g.onopen(a)}),k.addEventListener("close",function(a){g.onclose(a)}),k.addEventListener("connecting",function(a){g.onconnecting(a)}),k.addEventListener("message",function(a){g.onmessage(a)}),k.addEventListener("error",function(a){g.onerror(a)}),this.addEventListener=k.addEventListener.bind(k),this.removeEventListener=k.removeEventListener.bind(k),this.dispatchEvent=k.dispatchEvent.bind(k),this.open=function(b){h=new WebSocket(g.url,c||[]),b||k.dispatchEvent(l("connecting")),(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","attempt-connect",g.url);var d=h,e=setTimeout(function(){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","connection-timeout",g.url),j=!0,d.close(),j=!1},g.timeoutInterval);h.onopen=function(){clearTimeout(e),(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onopen",g.url),g.protocol=h.protocol,g.readyState=WebSocket.OPEN,g.reconnectAttempts=0;var d=l("open");d.isReconnect=b,b=!1,k.dispatchEvent(d)},h.onclose=function(c){if(clearTimeout(e),h=null,i)g.readyState=WebSocket.CLOSED,k.dispatchEvent(l("close"));else{g.readyState=WebSocket.CONNECTING;var d=l("connecting");d.code=c.code,d.reason=c.reason,d.wasClean=c.wasClean,k.dispatchEvent(d),b||j||((g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onclose",g.url),k.dispatchEvent(l("close")));var e=g.reconnectInterval*Math.pow(g.reconnectDecay,g.reconnectAttempts);setTimeout(function(){g.reconnectAttempts++,g.open(!0)},e>g.maxReconnectInterval?g.maxReconnectInterval:e)}},h.onmessage=function(b){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onmessage",g.url,b.data);var c=l("message");c.data=b.data,k.dispatchEvent(c)},h.onerror=function(b){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onerror",g.url,b),k.dispatchEvent(l("error"))}},1==this.automaticOpen&&this.open(!1),this.send=function(b){if(h)return(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","send",g.url,b),h.send(b);throw"INVALID_STATE_ERR : Pausing to reconnect websocket"},this.close=function(a,b){"undefined"==typeof a&&(a=1e3),i=!0,h&&h.close(a,b)},this.refresh=function(){h&&h.close()}}return a.prototype.onopen=function(){},a.prototype.onclose=function(){},a.prototype.onconnecting=function(){},a.prototype.onmessage=function(){},a.prototype.onerror=function(){},a.debugAll=!1,a.CONNECTING=WebSocket.CONNECTING,a.OPEN=WebSocket.OPEN,a.CLOSING=WebSocket.CLOSING,a.CLOSED=WebSocket.CLOSED,a});
let ws = new ReconnectingWebSocket("/ws/timeline/")
let cansignup = false

setInterval(()=>{
    for(ppp in timeshash){
        if(!document.getElementById(ppp)){delete timeshash[ppp]; continue}
        diff = new Date(new Date().getTime() - timeshash[ppp])
        document.getElementById(ppp).querySelector('.date').innerHTML = " / " + ntime(diff);
        if(diff.getUTCMinutes() >= 3){
            if(document.getElementById(ppp).querySelector('.delete'))document.getElementById(ppp).querySelector('.delete').remove()
        }
    }
}, 1000)

location.href=(location.href+"?#").replace(/(\?\#){2,}/, "?#")

function ntime(sss){
    //return Math.floor(sss.getTime()/1000)
    if (sss.getUTCFullYear() - 1970) {
        ppppppp = sss.getUTCFullYear() - 1970 + '年前';
    } else if (sss.getUTCMonth()) {
        ppppppp = sss.getUTCMonth() + 'ヶ月前';
    } else if (sss.getUTCDate() - 1) {
        ppppppp = sss.getUTCDate() - 1 + '日前';
    } else if (sss.getUTCHours()) {
        ppppppp = sss.getUTCHours() + '時間前';
    } else if (sss.getUTCMinutes()) {
        ppppppp = sss.getUTCMinutes() + '分前';
    } else if (Math.floor(sss.getTime()/1000) < 100) {
        ppppppp = Math.floor(sss.getTime()/1000) + '秒前';
    } else {
        ppppppp = 'ついさっき'
    }
    return ppppppp
}

function render(hy, isbottom=false){
    hs = Object.keys(hy).sort((a,b) => new Date(hy[a]["t"]) - new Date(hy[b]["t"]));
    if(isbottom){hs = hs.reverse()}
    hs.forEach(k => {
        dat = hy[k]
        if(dat["c"] == undefined || dat["c"] == ""){
            if(document.getElementById(k))document.getElementById(k).parentNode.remove()
        }
        if(document.getElementById(k)){
            let clone = document.getElementById(k)
            
            if(clone.parentNode.nextElementSibling != undefined){
                if(dat["c"] == undefined || dat["c"] == ""){
                    of = clone.parentNode.nextElementSibling.getBoundingClientRect().top
                    of2 = clone.parentNode.getBoundingClientRect().top
                    document.scrollingElement.scrollTop = parseInt(document.scrollingElement.scrollTop) - of + of2
                }
                of2 = clone.parentNode.nextElementSibling.getBoundingClientRect().top
                of = clone.parentNode.nextElementSibling.getBoundingClientRect().top
                if(parseInt(document.scrollingElement.scrollTop) >= 1000 && isbottom==false){
                    document.scrollingElement.scrollTop = parseInt(document.scrollingElement.scrollTop) + of - of2
                }
            }
            if(dat["c"] == undefined || dat["c"] == ""){
                delete timeshash[clone.id]
                clone.parentNode.remove()
            }
            if(dat["ruc"] == 1){
                clone.querySelector('.luvving .loved').className = clone.querySelector('.luvving .loved').className.replace("hidden", "")
                clone.querySelector('.luvving .loving').className += " hidden"
                clone.querySelector('.luvving').className += " text-rose-500"
            }else{
                clone.querySelector('.luvving .loving').className = clone.querySelector('.luvving .loving').className.replace("hidden", "")
                clone.querySelector('.luvving .loved').className += " hidden"
                clone.querySelector('.luvving').className = clone.querySelector('.luvving').className.replace("text-rose-500", "")
            }
            var diff = new Date().getTime() - new Date(dat["t"]).getTime();
            var ppppppp = ntime(new Date(diff))

            clone.querySelector('.description').innerHTML = dat["c"];
            clone.querySelectorAll('.proflink').forEach(a=>{a.href = "/u/" + dat["user"] + "/"})
            if(dat["handlename"])clone.querySelector('.usernickname').textContent = dat["handlename"];
            clone.querySelector('.username').textContent = "@" + dat["user"];
            clone.querySelector('.date').innerHTML = " / " + ppppppp;
            //clone.querySelector('img').src = "/" + dat["user"] + ".jpg";
            clone.querySelector('img').src = "https://pbs.twimg.com/profile_images/1779878242817896449/fopNP4Zt_400x400.jpg";
            clone.id = (dat["msgid"] == "") ? dat["user"] : dat["msgid"];
            timeshash[clone.id] = new Date(dat["t"])
            if(dat["msgid"] != "" && clone.querySelectorAll('.inputting').length != 0){
                clone.querySelector('.inputting')._tippy.disable()
                clone.querySelector('.inputting')._tippy.destroy()
                clone.querySelector('.inputting').className = clone.querySelector('.inputting').className.replace("inputting hidden", "")
                clone.querySelector('.heisposting').className += " hidden"
                let hrgijefn = dat["msgid"]
                clone.querySelector('.luvving .num').innerHTML = (dat["luv"] != 0) ? dat["luv"] : "";
                if(Math.floor(new Date(diff).getTime()/1000) >= 180){
                    if(clone.querySelector('.delete'))clone.querySelector('.delete').remove()
                }
            }
            clone.querySelector('.luvving .num').innerHTML = (dat["luv"] != 0) ? dat["luv"] : "";
        }else{
            let clone = megen_template.content.cloneNode(true);
            
            if(dat["c"] == undefined || dat["c"] == ""){
                return
            }
            if(dat["ruc"] == 1){
                clone.querySelector('.luvving .loved').className = clone.querySelector('.luvving .loved').className.replace(/hidden/g, "")
                clone.querySelector('.luvving .loving').className += " hidden"
                clone.querySelector('.luvving').className += " text-rose-500"
            }else{
                clone.querySelector('.luvving .loving').className = clone.querySelector('.luvving .loving').className.replace(/hidden/g, "")
                clone.querySelector('.luvving .loved').className += " hidden"
                clone.querySelector('.luvving').className = clone.querySelector('.luvving').className.replace("text-rose-500", "")
            }
            var diff = new Date().getTime() - new Date(dat["t"]).getTime();
            var ppppppp = ntime(new Date(diff))
            
            clone.querySelector('.luvving .num').innerHTML = (dat["luv"] != 0) ? dat["luv"] : "";
            clone.querySelectorAll('.proflink').forEach(a=>{a.href = "/u/" + dat["user"] + "/"})
            if(dat["handlename"])clone.querySelector('.usernickname').textContent = dat["handlename"];
            clone.querySelector('.username').textContent = "@" + dat["user"];
            clone.querySelector('.description').innerHTML = dat["c"];
            clone.querySelector('.date').innerHTML = " / " + ppppppp;
            //clone.querySelector('img').src = "/" + dat["user"] + ".jpg";
            clone.querySelector('img').src = "https://pbs.twimg.com/profile_images/1779878242817896449/fopNP4Zt_400x400.jpg";
            clone.querySelector('.pgyuji').id = (dat["msgid"] == "") ? dat["user"] : dat["msgid"];
            timeshash[clone.querySelector('.pgyuji').id] = new Date(dat["t"])
            if(dat["msgid"] != ""){
                clone.querySelector('.inputting').className = clone.querySelector('.inputting').className.replace("inputting hidden", "")
                clone.querySelector('.heisposting').className += " hidden"
            }

            if(isbottom){
                document.getElementById('megens').appendChild(clone);
            }else{
                document.getElementById('megens').prepend(clone);
            }

            if(parseInt(document.scrollingElement.scrollTop) >= 1000 && isbottom==false){
                of = document.getElementById(k).parentNode.nextElementSibling.getBoundingClientRect().top
                of2 = document.getElementById(k).parentNode.getBoundingClientRect().top
                document.scrollingElement.scrollTop = parseInt(document.scrollingElement.scrollTop) + of - of2
            }
            g = document.getElementById(k)
            let hrgijefn = dat["msgid"]
            g.querySelector('.luvving .num').innerHTML = (dat["luv"] != 0) ? dat["luv"] : "";
            if(Math.floor(new Date(diff).getTime()/1000) >= 180){
                if(g.querySelector('.delete'))g.querySelector('.delete').remove()
            }
            g.querySelector('.luvving .num').innerHTML = (dat["luv"] != 0) ? dat["luv"] : "";
            T = "<div class='text-slate-500'><img src='/arusyukuhai.jpg' class='inline w-4 h-4 mr-1'><span class='text-emerald-500 font-bold'>r-4981</span> @arusyukuhai</div>"
        }
        return
    })
}
ws.addEventListener("message", (e) => {
    p = JSON.parse(e.data)
    render(p)
})
setInterval(function(){
    ws.send("itwyi;p97yg")
}, 5000)
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