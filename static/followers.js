!function(a,b){"function"==typeof define&&define.amd?define([],b):"undefined"!=typeof module&&module.exports?module.exports=b():a.ReconnectingWebSocket=b()}(this,function(){function a(b,c,d){function l(a,b){var c=document.createEvent("CustomEvent");return c.initCustomEvent(a,!1,!1,b),c}var e={debug:!1,automaticOpen:!0,reconnectInterval:1e3,maxReconnectInterval:3e4,reconnectDecay:1.5,timeoutInterval:2e3};d||(d={});for(var f in e)this[f]="undefined"!=typeof d[f]?d[f]:e[f];this.url=b,this.reconnectAttempts=0,this.readyState=WebSocket.CONNECTING,this.protocol=null;var h,g=this,i=!1,j=!1,k=document.createElement("div");k.addEventListener("open",function(a){g.onopen(a)}),k.addEventListener("close",function(a){g.onclose(a)}),k.addEventListener("connecting",function(a){g.onconnecting(a)}),k.addEventListener("message",function(a){g.onmessage(a)}),k.addEventListener("error",function(a){g.onerror(a)}),this.addEventListener=k.addEventListener.bind(k),this.removeEventListener=k.removeEventListener.bind(k),this.dispatchEvent=k.dispatchEvent.bind(k),this.open=function(b){h=new WebSocket(g.url,c||[]),b||k.dispatchEvent(l("connecting")),(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","attempt-connect",g.url);var d=h,e=setTimeout(function(){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","connection-timeout",g.url),j=!0,d.close(),j=!1},g.timeoutInterval);h.onopen=function(){clearTimeout(e),(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onopen",g.url),g.protocol=h.protocol,g.readyState=WebSocket.OPEN,g.reconnectAttempts=0;var d=l("open");d.isReconnect=b,b=!1,k.dispatchEvent(d)},h.onclose=function(c){if(clearTimeout(e),h=null,i)g.readyState=WebSocket.CLOSED,k.dispatchEvent(l("close"));else{g.readyState=WebSocket.CONNECTING;var d=l("connecting");d.code=c.code,d.reason=c.reason,d.wasClean=c.wasClean,k.dispatchEvent(d),b||j||((g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onclose",g.url),k.dispatchEvent(l("close")));var e=g.reconnectInterval*Math.pow(g.reconnectDecay,g.reconnectAttempts);setTimeout(function(){g.reconnectAttempts++,g.open(!0)},e>g.maxReconnectInterval?g.maxReconnectInterval:e)}},h.onmessage=function(b){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onmessage",g.url,b.data);var c=l("message");c.data=b.data,k.dispatchEvent(c)},h.onerror=function(b){(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","onerror",g.url,b),k.dispatchEvent(l("error"))}},1==this.automaticOpen&&this.open(!1),this.send=function(b){if(h)return(g.debug||a.debugAll)&&console.debug("ReconnectingWebSocket","send",g.url,b),h.send(b);throw"INVALID_STATE_ERR : Pausing to reconnect websocket"},this.close=function(a,b){"undefined"==typeof a&&(a=1e3),i=!0,h&&h.close(a,b)},this.refresh=function(){h&&h.close()}}return a.prototype.onopen=function(){},a.prototype.onclose=function(){},a.prototype.onconnecting=function(){},a.prototype.onmessage=function(){},a.prototype.onerror=function(){},a.debugAll=!1,a.CONNECTING=WebSocket.CONNECTING,a.OPEN=WebSocket.OPEN,a.CLOSING=WebSocket.CLOSING,a.CLOSED=WebSocket.CLOSED,a});

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

for(ptttt of document.querySelectorAll("#megens div button")){
    let yyyyy = ptttt;
    yyyyy.addEventListener("click", async (event)=>{
        event.stopPropagation()
        F = await fetch("/fetch/follow/" + yyyyy.getAttribute("name"), {method: "POST"})
        F = await F.text()
        if(F == "1"){
            yyyyy.className = "absolute right-6 top-4 hover:border-emerald-600 box-border block text-lg py-0.5 px-4 font-semibold border-emerald-500 border-2 text-emerald-500 text-center"
            yyyyy.innerText = "リムーブ"
        }else{
            yyyyy.className = "absolute right-6 top-4 hover:bg-emerald-600 box-border block text-lg py-0.5 px-4 font-semibold bg-emerald-500 text-white text-center"
            yyyyy.innerText = "フォロー"
        }
    })
}

if(location.search == ''){
    const ws2 = new ReconnectingWebSocket(`wss://${location.hostname}/ws/screenshare/${getCookie("username")}/${getCookie("secret_key")}/`)

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