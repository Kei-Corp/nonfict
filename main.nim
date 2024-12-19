## obsolete: plz transfer to js

import jester, ws, ws/jester_extra
import tables, asyncdispatch, asynchttpserver, random, strutils, segfaults, json, nre, times, httpclient, unicode, sequtils
import redis
#import diff

type messagetype = ref object
  username: string
  handlename: string
  content: string
  timestamp: string
  msgid: string
  loving: string
  dubbing: string
  posted: string
  ruc: int

#proc getmessagefromId(ids: string) : messagetype = 

#proc getmessagefromId(ids: seq[string]) : seq[messagetype] = 

proc outerreadM(p: seq[string]) : messagetype =
  var ttr = new messagetype
  var jjj = 0
  while jjj < len(p):
    if(p[jjj] == "user"): ttr.username = p[jjj+1]
    if(p[jjj] == "c"): ttr.content = p[jjj+1]
    if(p[jjj] == "t"): ttr.timestamp = p[jjj+1]
    if(p[jjj] == "luv"): ttr.loving = p[jjj+1]
    if(p[jjj] == "dub"): ttr.dubbing = p[jjj+1]
    jjj += 2
  return ttr

proc bigram(str: string) : seq[string] =
  var ujishtrs : seq[string] = @[]
  for j in str.replace("　", " ").split(" "):
    var bigrs : seq[string] = @[]
    var i : int = 0
    for c in j.utf8:
      i += 1
      if i>1: bigrs[i-2] &= toLower(c)
      if i==runeLen(j): break
      bigrs.add(toLower(c))
    ujishtrs = ujishtrs.concat(bigrs)
  return ujishtrs

randomize()

#var lovers {.threadvar.} : 
var htmls {.threadvar.} : Table[string, string]
var dats {.threadvar.} : OrderedTable[string, messagetype]
var diffDats {.threadvar.} : Table[string, messagetype]
var scrollpointDict {.threadvar.} : Table[string, int]
var screenPubSub {.threadvar.} : Table[string, seq[WebSocket]]
var loversDat {.threadvar.} : Table[string, seq[string]]
var counter {.threadvar.} : int
proc rndStr: string =
  for _ in .. 8:
    add(result, char(sample("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")))
proc rndColor: string =
  for _ in .. 5:
    add(result, char(rand(int('a') .. int('f'))))
dats = initOrderedTable[string, messagetype]()
diffDats = initTable[string, messagetype]()
scrollpointDict = initTable[string, int]()
counter = 0

var gredisClient : Redis = redis.open()

gredisClient.configSet("maxmemory", "750MB")
gredisClient.configSet("maxmemory-policy", "volatile-lru")

var connections {.threadvar.}: Table[string, WebSocket]
var numconnec {.threadvar.}: int
numconnec = 0

proc loadHTML(filename: string) : string =
  if htmls.hasKey(filename):
    return htmls[filename]
  var f : File = filename.open(FileMode.fmRead)
  var t : string = f.readAll().replace("\n", "")
  htmls[filename] = t
  f.close()
  return t

router trouter:
  post "/fetch/create-account/":
    var redisClient : Redis = redis.open()
    let query = parseJson(request.body)
    #if redisClient.exists(request.ip) == true:
    #  resp "複数アカウントの作成は禁止されています。"
    var username = query["username"].getStr.replace(" ", "")
    username = username.replace("<", "&lt;")
    username = username.replace(">", "&gt;")
    #echo username
    if username.match(re"^[a-zA-Z0-9_]+$").isNone == true or username.len >= 16 or username.len <= 3:
      resp "不正なユーザー名です。"
    if redisClient.exists(username & ":" & "password") == true:
      resp "同名のアカウントがすでに存在します。"
    if query["handlename"].getStr.len >= 24 or query["handlename"].getStr.len <= 2:
      resp "不正なリクエストです。"
    redisClient.setk(request.ip, username)
    discard redisClient.lPush("users", username)
    redisClient.setk(username & ":" & "password", query["password"].getStr)
    redisClient.setk(username & ":" & "handlename", query["handlename"].getStr.replace("<", "&lt;").replace(">", "&gt;"))
    redisClient.setk(username & ":" & "bio", "")
    let randkey = rndStr()
    redisClient.setk(randkey, username)
    downloadFile(newHttpClient(), "http://api.dicebear.com/9.x/pixel-art/jpg?seed=" & username & "&backgroundColor=" & rndColor(), "public/" & username & ".jpg")
    discard redisClient.expire(randkey, 3600*24*7)
    setCookie("secret_key", randkey, daysForward(1), path="/")
    setCookie("username", username, daysForward(1), path="/")
    redisClient.quit()
    resp "アカウントの作成に成功しました！"
  post "/fetch/login/":
    var redisClient : Redis = redis.open()
    let query = parseJson(request.body)
    var username = query["username"].getStr.replace(" ", "")
    username = username.replace("<", "&lt;")
    username = username.replace(">", "&gt;")
    let password = query["password"].getStr
    if redisClient.exists(username & ":" & "password") == false or redisClient.get(username & ":" & "password") != password:
      resp "ユーザー名またはパスワードが一致しません。"
    let randkey = rndStr()
    redisClient.setk(randkey, username)
    discard redisClient.expire(randkey, 3600*24*7)
    setCookie("secret_key", randkey, daysForward(1), path="/")
    setCookie("username", username, daysForward(1), path="/")
    redisClient.quit()
    resp "ログインに成功しました！"
  get "/":
    var redisClient : Redis = redis.open()
    if request.cookies.hasKey("secret_key") and request.cookies.hasKey("username") and redisClient.exists(request.cookies["secret_key"]) and redisClient.get(request.cookies["secret_key"]) == request.cookies["username"]:
      discard redisClient.expire(request.cookies["secret_key"], 3600*24*7)
      setCookie("secret_key", request.cookies["secret_key"], daysForward(1), path="/")
      let username : string = redisClient.get(request.cookies["secret_key"])
      let handlename : string = redisClient.get(username & ":" & "handlename")
      redisClient.quit()
      resp loadHTML("file/index-2.html").replace("[[selfusername]]", username).replace("[[selfhandlename]]", handlename)
    redisClient.quit()
    resp loadHTML("file/account.html")
  get "/ws/timeline/":
    var redisClient : Redis = redis.open()
    var ws = await newWebSocket(request)
    var rk = rndStr()
    connections[rk] = ws
    asyncCheck ws.send("{}")
    try:
      {.gcsafe.}:
        let pastdatl = redisClient.lRange("timeline", 0, 8)
        if pastdatl.len != 0:
          var pastdats : OrderedTable[string, messagetype]
          var j:int = 0
          for RRR in pastdatl:
            if redisClient.exists(RRR):
              var ttttt0huei = outerreadM(redisClient.hGetAll(pastdatl[j]))
              ttttt0huei.posted = "1"
              ttttt0huei.msgid = pastdatl[j]
              ttttt0huei.handlename = redisClient.get(ttttt0huei.username & ":" & "handlename")
              pastdats[RRR] = ttttt0huei
            else:
              discard redisClient.lRem("timeline", RRR)
            j += 1
          asyncCheck ws.send($(%* pastdats))
        asyncCheck ws.send($(%* dats))
        while true:
          var message : string = await ws.receiveStrPacket()
          await ws.send("{}")
    except WebSocketClosedError:
      #echo "socket closed:", getCurrentExceptionMsg()
      connections[rk].hangup()
      connections.del(rk)
      redisClient.quit()
    resp "socket closed"
  #[get "/ws/profile/@t_username/@key/@username":
    var redisClient : Redis = redis.open()
    var ws = await newWebSocket(request)
    var secretKey = @"key"
    var userName = @"username"
    var targetUserName = @"t_username"
    asyncCheck ws.send("{}")
    ]#
  get "/ws/typing/@key/@username":
    var redisClient : Redis = redis.open()
    var ws = await newWebSocket(request)
    var secretKey = @"key"
    var userName = @"username"
    var rk = @"username"
    if connections.hasKey(rk):
      connections[rk].hangup()
      connections.del(rk)
      echo "socket closed:"
    echo connections.len()
    asyncCheck ws.send("{}")
    connections[rk] = ws
    numconnec += 1
    try:
      if redisClient.exists(secretKey) != true or redisClient.get(secretKey) != userName:
        connections[rk].hangup()
        connections.del(rk)
        redisClient.quit()
        resp "socket closed go f urself"
      if redisClient.exists("timeline"):
        {.gcsafe.}:
          let pastdatl = redisClient.lRange("timeline", 0, 8)
        var pastdats : OrderedTable[string, messagetype]
        var j:int = 0
        for RRR in pastdatl:
          if redisClient.exists(RRR):
            {.gcsafe.}:
              var ttttt0huei = outerreadM(redisClient.hGetAll(RRR))
            ttttt0huei.posted = "1"
            ttttt0huei.msgid = RRR
            ttttt0huei.handlename = redisClient.get(ttttt0huei.username & ":" & "handlename")
            ttttt0huei.ruc = redisClient.sismember(RRR & ":luvers", userName)
            pastdats[RRR] = ttttt0huei
          else:
            discard redisClient.lRem("timeline", RRR)
          j += 1
        asyncCheck ws.send($(%* pastdats))
      asyncCheck ws.send($(%* dats))
      let handlename = redisClient.get(username & ":" & "handlename")
      while ws.readyState == Open:
        var message : string = await ws.receiveStrPacket()
        if(message.len > 280): message = message[0..280]
        message = message.replace("<", "&lt;")
        message = message.replace(">", "&gt;")
        if message.replace(" ", "").replace("　", "").replace("\n", "") == "":
          dats.del(username)
          loversDat.del(username)
          diffDats[username] = new messagetype
          diffDats[username].username = username
          diffDats[username].content = ""
        else:
          message = message.replace("\n", "<br>")
          if not dats.hasKey(username):
            dats[username] = new messagetype
            dats[username].username = username
            dats[username].handlename = handlename
            dats[username].content = message.replace(re"(<br>){2,}", "<br><br>").replace(re"^(<br>){1,2}", "").replace(re"(<br>){1,2}$", "").replace(re"((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))", "<a class='text-emerald-500' href='$1'>$1</a>")
            dats[username].timestamp = now().format("yyyy/MM/dd HH:mm:ss")
            dats[username].loving = "0"
            dats[username].dubbing = "0"
            dats[username].posted = "0"
            diffDats[username] = dats[username]
            loversDat[username] = @[]
          else:
            dats[username].content = message.replace(re"(<br>){2,}", "<br><br>").replace(re"^(<br>){1,2}", "").replace(re"(<br>){1,2}$", "").replace(re"((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))", "<a class='text-emerald-500' href='$1'>$1</a>")
            dats[username].content = dats[username].content[0..dats[username].content.len().min(500)-1]
            diffDats[username] = dats[username]
        counter += 1
        if counter >= (dats.len() / 4).int().max(1):
          counter = 0
          let json = $(%* diffDats)
          #writeFile("backup.log", $((%* dats).pretty()))
          for ptttt in connections.keys():
            var other = connections[ptttt]
            if other.readyState == Open:
              asyncCheck other.send(json)
            else:
              connections.del(ptttt)
          diffDats.clear()
    except WebSocketClosedError:
      echo "socket closed:", getCurrentExceptionMsg()
      connections[rk].hangup()
      connections.del(rk)
      numconnec -= 1
      dats.del(username)
      loversDat.del(username)
      diffDats[username] = new messagetype
      let json = $(%* diffDats)
      redisClient.quit()
      for ptttt in connections.keys():
        var other = connections[ptttt]
        if other.readyState == Open:
          asyncCheck other.send(json)
        else:
          connections[ptttt].hangup()
          connections.del(ptttt)
      diffDats.clear()
    resp "socket closed"
  post "/fetch/posting/":
    var redisClient : Redis = redis.open()
    if request.cookies.hasKey("secret_key") and request.cookies.hasKey("username") and redisClient.exists(request.cookies["secret_key"]) and redisClient.get(request.cookies["secret_key"]) == request.cookies["username"]:
      let postid : string = rndStr()
      let username : string = redisClient.get(request.cookies["secret_key"])
      if dats.hasKey(username):
        discard redisClient.lPush("timeline", postid)
        discard redisClient.lPush(username & ":msgs", postid)
        #for hugoriuwyfhjqiokeyh in bigram(dats[username].content):
        #  discard redisClient.sadd(hugoriuwyfhjqiokeyh, postid)
        #  discard redisClient.expire(hugoriuwyfhjqiokeyh, 3600*24*30*12)
        dats[username].timestamp = now().format("yyyy/MM/dd HH:mm:ss")
        dats[username].posted = "1"
        dats[username].msgid = postid
        discard redisClient.hSet(postid, "user", dats[username].username)
        discard redisClient.hSet(postid, "c", dats[username].content)
        discard redisClient.hSet(postid, "t", dats[username].timestamp)
        discard redisClient.hSet(postid, "msgid", dats[username].msgid)
        discard redisClient.hSet(postid, "luv", dats[username].loving)
        discard redisClient.hSet(postid, "dub", dats[username].dubbing)
        if loversDat[username].len() != 0:
          discard redisClient.sladd(postid & ":luvers", loversDat[username])
        discard redisClient.expire(postid, 3600*24*30*12)
        if redisClient.lLen(username & ":msgs") >= 350:
          discard redisClient.del(@[redisClient.rPop(username & ":msgs")])
        if redisClient.lLen("timeline") >= 700:
          discard redisClient.rPop("timeline")
        for ptttt in connections.keys():
          var other = connections[ptttt]
          if other.readyState == Open:
            if loversDat[username].contains(ptttt):
              dats[username].ruc = 1
            else:
              dats[username].ruc = 0
            asyncCheck other.send($(%* {username: {}, postid: dats[username]}))
          else:
            connections.del(ptttt)
        dats.del(username)
        loversDat.del(username)
        diffDats[username] = new messagetype
        redisClient.quit()
        resp "posted!"
    resp "go f urself"
  get "/fetch/profile/@username/@start/@end/":
    var redisClient : Redis = redis.open()
    if request.cookies.hasKey("secret_key") and request.cookies.hasKey("username") and redisClient.exists(request.cookies["secret_key"]) and redisClient.get(request.cookies["secret_key"]) == request.cookies["username"]:
      {.gcsafe.}:
        let pastdatl = redisClient.lRange("timeline", parseInt(@"start"), parseInt(@"end"))
      if pastdatl.len != 0:
        var pastdats : OrderedTable[string, messagetype]
        var j:int = 0
        for RRR in pastdatl:
          if redisClient.exists(RRR):
            {.gcsafe.}:
              var ttttt0huei = outerreadM(redisClient.hGetAll(RRR))
            ttttt0huei.posted = "1"
            ttttt0huei.msgid = RRR
            ttttt0huei.handlename = redisClient.get(ttttt0huei.username & ":" & "handlename")
            ttttt0huei.ruc = redisClient.sismember(RRR & ":luvers", request.cookies["username"])
            pastdats[RRR] = ttttt0huei
        redisClient.quit()
        resp $(%* pastdats)
      resp ""
  get "/fetch/tl/@start/@end/":
    var redisClient : Redis = redis.open()
    if request.cookies.hasKey("secret_key") and request.cookies.hasKey("username") and redisClient.exists(request.cookies["secret_key"]) and redisClient.get(request.cookies["secret_key"]) == request.cookies["username"]:
      {.gcsafe.}:
        let pastdatl = redisClient.lRange("timeline", parseInt(@"start"), parseInt(@"end"))
      if pastdatl.len != 0:
        var pastdats : OrderedTable[string, messagetype]
        var j:int = 0
        for RRR in pastdatl:
          if redisClient.exists(RRR):
            {.gcsafe.}:
              var ttttt0huei = outerreadM(redisClient.hGetAll(RRR))
            ttttt0huei.posted = "1"
            ttttt0huei.msgid = RRR
            ttttt0huei.handlename = redisClient.get(ttttt0huei.username & ":" & "handlename")
            ttttt0huei.ruc = redisClient.sismember(RRR & ":luvers", request.cookies["username"])
            pastdats[RRR] = ttttt0huei
        redisClient.quit()
        resp $(%* pastdats)
    resp ""
  get "/fetch/lovers/@id/":
    var redisClient : Redis = redis.open()
    if request.cookies.hasKey("secret_key") and request.cookies.hasKey("username") and redisClient.exists(request.cookies["secret_key"]) and redisClient.get(request.cookies["secret_key"]) == request.cookies["username"]:
      if redisClient.exists(@"id"):
        {.gcsafe.}:
          resp $redisClient.smembers(@"id" & ":luvers")
      else:
        resp $loversDat[@"id"]
  post "/fetch/delete/@id/":
    var redisClient : Redis = redis.open()
    if request.cookies.hasKey("secret_key") and request.cookies.hasKey("username") and redisClient.exists(request.cookies["secret_key"]) and redisClient.get(request.cookies["secret_key"]) == request.cookies["username"]:
      if redisClient.exists(@"id") and request.cookies["username"] == redisClient.hGet(@"id", "user"):
        let t : DateTime =  redisClient.hGet(@"id", "t").parse("yyyy/MM/dd HH:mm:ss")
        if now().toTime().toUnix() - t.toTime().toUnix() < 180:
          discard redisClient.del(@[@"id"])
          discard redisClient.del(@[@"id"] & ":luvers")
          discard redisClient.lRem("timeline", @"id")
          discard redisClient.lRem(request.cookies["username"], @"id")
          let jhuirghe = new messagetype
          jhuirghe.username = request.cookies["username"]
          jhuirghe.msgid = @"id"
          jhuirghe.content = ""
          for ptttt in connections.values():
            asyncCheck ptttt.send($(%*{@"id": jhuirghe}))
    resp ""
  post "/fetch/like/@id/":
    var redisClient : Redis = redis.open()
    var isliked = 0
    var l = "0"
    if request.cookies.hasKey("secret_key") and request.cookies.hasKey("username") and redisClient.exists(request.cookies["secret_key"]) and redisClient.get(request.cookies["secret_key"]) == request.cookies["username"]:
      if redisClient.exists(@"id"):
        let jtb = redisClient.sadd(@"id" & ":luvers", request.cookies["username"])
        if jtb == 0:
          discard redisClient.srem(@"id" & ":luvers", request.cookies["username"])
          let luvs = $redisClient.scard(@"id" & ":luvers")
          discard redisClient.hSet(@"id", "luv", luvs)
          counter += 1
          isliked = 0
        else:
          discard redisClient.hIncrBy(@"id", "luv", 1)
          counter += 1
          isliked = 1
        # if now().toTime().toUnix() - redisClient.hGet(@"id", "t").parse("yyyy/MM/dd HH:mm:ss").toTime().toUnix() < 900:
        #  counter += 1
        {.gcsafe.}:
          diffDats[@"id"] = outerreadM(redisClient.hGetAll(@"id"))
        diffDats[@"id"].msgid = @"id"
        l = $redisClient.scard(@"id" & ":luvers")
      else:
        if(loversDat[@"id"].contains(request.cookies["username"])):
          loversDat[@"id"].delete(loversDat[@"id"].find(request.cookies["username"]))
          dats[@"id"].loving = $(loversDat[@"id"].len())
          diffDats[@"id"] = dats[@"id"]
          counter += 1
          isliked = 0
        else:
          loversDat[@"id"].add(request.cookies["username"])
          dats[@"id"].loving = $(loversDat[@"id"].len())
          diffDats[@"id"] = dats[@"id"]
          counter += 1
          isliked = 1
        #echo loversDat[@"id"].len()
        l = dats[@"id"].loving
    if counter >= dats.len():
      counter = 0
      let json = $(%* diffDats)
      #writeFile("backup.log", $((%* dats).pretty()))
      for ptttt in connections.keys():
        var other = connections[ptttt]
        if other.readyState == Open:
          asyncCheck other.send(json)
        else:
          connections.del(ptttt)
      diffDats.clear()
    resp $isliked & "," & l
  get "/u/@username/":
    var redisClient : Redis = redis.open()
    if request.cookies.hasKey("secret_key") and request.cookies.hasKey("username") and redisClient.exists(request.cookies["secret_key"]) and redisClient.get(request.cookies["secret_key"]) == request.cookies["username"]:
      let handlename = redisClient.get(@"username" & ":" & "handlename")
      let bio : string = redisClient.get(@"username" & ":" & "bio")
      let yourusername : string = redisClient.get(request.cookies["secret_key"])
      let yourhandlename : string = redisClient.get(yourusername & ":" & "handlename")
      redisClient.quit()
      resp loadHTML("file/profile.html").replace("[[username]]", @"username").replace("[[handlename]]", handlename).replace("[[selfusername]]", yourusername).replace("[[selfhandlename]]", yourhandlename).replace("[[bio]]", bio)
    else:
      redirect "/"
  get "/ws/scrollpoint/":
    var ws = await newWebSocket(request)
    await ws.send("")
    var redisClient : Redis = redis.open()
    try:
      if request.cookies.hasKey("secret_key") and request.cookies.hasKey("username") and redisClient.exists(request.cookies["secret_key"]) and redisClient.get(request.cookies["secret_key"]) == request.cookies["username"]:
        scrollpointDict[request.cookies["username"]] = 0
        while true:
          scrollpointDict[request.cookies["username"]] = (await ws.receiveStrPacket()).parseInt()
      else:
        redisClient.quit()
        resp ""
    except:
      redisClient.quit()
      resp ""
    resp ""
  #get "/fetch/user/@username/":
#[  get "/fetch/search/@query/":
    {.gcsafe.}:
      var redisClient : Redis = redis.open()
      let pastdatl = redisClient.sinter(bigram(@"query"))
      if pastdatl.len != 0:
        var pastdats : OrderedTable[string, string]
        let pastdat = redisClient.mget(pastdatl)
        var j:int = 0
        for RRR in pastdatl:
          pastdats[RRR] = pastdat[j]
          j += 1
        resp $(%* pastdat)
      resp "[]"
  get "/search/@query/":
    {.gcsafe.}:
      var redisClient : Redis = redis.open()
      let pastdatl = redisClient.sinter(bigram(@"query"))
      if pastdatl.len != 0:
        var pastdats : OrderedTable[string, string]
        let pastdat = redisClient.mget(pastdatl)
        var j:int = 0
        for RRR in pastdatl:
          pastdats[RRR] = pastdat[j]
          j += 1
        resp $(%* pastdat)
      resp "[]"]#

proc main() =
  let port = 5000.Port
  let settings = newSettings(port=port)
  var jester = initJester(trouter, settings=settings)
  jester.serve()

when isMainModule:
  main()