from http.client import HTTPResponse
from django.shortcuts import render,HttpResponse
import os,random,json,pymysql,time,datetime,threading
locker=threading.Lock()
test_number=1
allocate_time=3
wait_time=5
activate_mysql=False
set_trump=13
random_card=True
cardtime="2022-04-23 02:49:00"
game_data=dict()
poker=[]
number=str()
for i in range(13):
    for j in ["C","D","H","S"]:
        if i==0:
            number='K'
        elif i==1:
            number='A'
        elif i==10:
            number='T'
        elif i==11:
            number="J"
        elif i==12:
            number='Q'
        else:
            number=str(i)
        poker.append(number+j) 
        poker.append(number+j)  
poker.append("joker") 
poker.append("bigjoker")
poker.append("joker") 
poker.append("bigjoker")
# def requestpoke(request):
#     global poker
#     time=int(request.GET['n1'])
#     if time==0:
#         random.shuffle(poker)
#     def sort_card(str1):
#         if str1=="bigjoker":return 100
#         elif str1=="joker":return 99
#         color=str1[1]
#         if str1[0]=='K':number=13
#         elif str1[0]=='Q':number=12
#         elif str1[0]=='J':number=11
#         elif str1[0]=='T':number=10
#         elif str1[0]=='A':number=14
#         else:number=int(str1[0])
#         x=["D","C","H","S"]
#         for j in range(len(x)):
#             if str1[1]==x[j]:
#                 return 16*j+number
#     # def checklegal(li):
#     #     a=dict()
#     #     for i in li:
#     #         if i in a:
#     #             if a[i]>=2:
#     #             else: a[i]+=1
#     #         else:
#     #             a[i]=1
#     # y=poker[0:time+1]
#     # x=sorted(y,key=sort_card)
#     # # x=sorted(poker[0:time+1].sort(key=sort_card,reverse=True)
#     # checklegal(poker[0:time+1])
#     # checklegal(sorted(poker[0:time+1],key=sort_card,reverse=True))
#     t={"time":time,"name":sorted(poker[0:time+1],key=sort_card,reverse=True)}
#     r=json.dumps(t)
#     return HttpResponse(json.dumps(t))
def login(request):
    return render(request,"login.html")
def addroom(request):
    global game_data
    name=request.GET["name"]
    room=request.GET["room"]
    if room not in game_data:
        game_data[room]={'player':[],'playerinformation':dict(),'level':[2,2],'playercard':dict(),'begin_time':0,'nowlevel':2,'trump':0,'trumpholder':''}
        game_data[room]['state']=0#state 0未开始，1发牌，
        game_data[room]["banker"]=-1
        game_data[room]["firstgame"]=True
    if name not in game_data[room]['player']:
        if len(game_data[room]['player'])==4:
            return render(request,"login.html",{'a':"房间满了,请换房间加入"})
        else:
            game_data[room]['playerinformation'][name]=[len(game_data[room]['player']),False,False]#顺位，是否准备，牌是否更改
            game_data[room]['playercard'][name]=[]
            game_data[room]['player'].append(name)
    return render(request,'game.html',{'name':name,'room':room})
def requestdata(request):
    global game_data
    global poker
    global locker
    name=request.GET["name"]
    room=request.GET["room"]
    def sort_card(str1):
        global game_data
        global poker
        if str1=="bigjoker":return 54
        elif str1=="joker":return 53
        color=str1[1]
        if str1[1]=='D':color=1
        elif str1[1]=='C':color=2
        elif str1[1]=='H':color=3
        else: color=0
        if game_data[room]['trump']>=9:trumpcolor=0#无主
        else: trumpcolor=game_data[room]['trump']%4
        if str1[0]=='K':number=13
        elif str1[0]=='Q':number=12
        elif str1[0]=='J':number=11
        elif str1[0]=='T':number=10
        elif str1[0]=='A':number=14
        else:number=int(str1[0])
        if number==game_data[room]['nowlevel']:#打的主，如打2的时候的2
            color_level=3-(trumpcolor+4-color)%4
            return 49+color_level
        else:
            color_level=3-(trumpcolor+4-color)%4
            if number>game_data[room]['nowlevel']:card_number=number-2
            else: card_number=number-1
            return color_level*12+card_number
    if request.GET["action"]=="information":
        locker.acquire()
        res=dict()
        res['player']=game_data[room]['player']
        res['playerinformation']=game_data[room]['playerinformation']
        res['level']=game_data[room]['level']
        res['state']=game_data[room]['state']
        res['nowlevel']=game_data[room]['nowlevel']
        res['trump']=game_data[room]['trump']#0没人，1方块，2梅花，3红桃，4黑桃，5双方块，。。。9小王，10大王
        res['trumpholder']=game_data[room]['trumpholder']            
        res['wait_time']=-1#不是发牌结束时候叫主等待时间
        if game_data[room]['state']!=0:#非等待准备
            after_time=time.time()-game_data[room]['begin_time']
            if game_data[room]['state']==1:
                game_data[room]['playerinformation'][name][2]=True#牌是否更改了#摸牌时候肯定牌改变了
                if after_time<allocate_time:
                    b=(game_data[room]['playerinformation'][name][0])*25
                    c=int(after_time/allocate_time*25)
                    game_data[room]['playercard'][name]=poker[b:b+c]
                else:#第一次发完
                    if after_time<allocate_time+wait_time:
                        res['wait_time']=allocate_time+wait_time-after_time
                    else:
                        game_data[room]['state']=2
                        if game_data[room]['trump']==0:#无人叫庄
                            game_data[room]['trump']=9#自动无主
                        if game_data[room]['firstgame']:#第一局游戏，抢庄
                            game_data[room]['banker']=game_data[room]['trumpholder']
                        for i in game_data[room]['player']:
                            begin=game_data[room]['playerinformation'][i][0]*25
                            game_data[room]['playercard'][i]=poker[begin:begin+25]
                            game_data[room]['playerinformation'][i][2]=True#将所有人牌补齐，并且都改变了牌
                        #庄家取底    
                        game_data[room]['playercard'][game_data[room]['banker']]=poker[100:108]+game_data[room]['playercard'][game_data[room]['banker']]
                        game_data[room]['playerinformation'][game_data[room]['banker']][2]=True#庄家摸底了，肯定牌改了
            # elif game_data[room]['state']==2:
            #     a=1
            else:
                # if len(game_data[room]['playercard'][name])!=25:
                pass
                # else:
                #     game_data[room]['playercard'][i]=sorted(game_data[room]['playercard'][],key=sort_card,reverse=True)
            
        if game_data[room]['playerinformation'][name][2]:#牌更改了
            res['change']=True
            game_data[room]['playerinformation'][name][2]=False#读完后就没改了
            game_data[room]['playercard'][name]=sorted(game_data[room]['playercard'][name],key=sort_card,reverse=True)#理一下牌
        else:
            res['change']=False
        res['card']=game_data[room]['playercard'][name]
        locker.release()
        ans=json.dumps(res)
        return HttpResponse(ans)
def ready(request):
    global game_data
    global poker
    global locker
    name=request.GET["name"]
    room=request.GET["room"]
    def test_begin_game():
        global game_data
        global poker
        if len(game_data[room]['playerinformation'].keys())<test_number:return
        for i in game_data[room]['playerinformation'].values():
            if not i[1]:return
        if random_card:
            random.shuffle(poker)
            record_poker(poker)
        else:
            conn = pymysql.connect(user='debian-sys-maint',charset='utf8',password="lPVVX9pMskl6Vzoj",database="shengji")
            cursor=conn.cursor(cursor=pymysql.cursors.DictCursor)
            cursor.execute("use shengji;")
            instruction="select card_information from shengji where time=%(n1)s;"
            cursor.execute(instruction,{"n1":cardtime})
            fetch_card=cursor.fetchall()
            poker=json.loads(fetch_card[0]['card_information'])
        # for i in game_data[room]['player']:
        #     game_data[room]['player']
        game_data[room]['begin_time']=time.time()
        game_data[room]['state']=1
        game_data[room]['nowlevel']=set_trump
        game_data[room]['trump']=0
        game_data[room]['trumpholder']=''
    locker.acquire()
    if request.GET["action"]=='ready':
        game_data[room]['playerinformation'][name][1]=True
        if game_data[room]['state']==0:
            test_begin_game()
    elif request.GET["action"]=='unready':
        game_data[room]['playerinformation'][name][1]=False
    locker.release()
    return HttpResponse("")
def calltrump(request):
    global game_data
    global poker
    global locker
    name=request.GET["name"]
    room=request.GET["room"]
    locker.acquire()
    trump=int(request.GET["trump"])
    now_trump=game_data[room]['trump']
    if  trump<9 and now_trump!=0 and int((trump-1)/4)<=int((now_trump-1)/4):#被别人先叫了
        pass
    else:
        game_data[room]['trump']=trump
        game_data[room]['trumpholder']=name
        for user_name in game_data[room]['player']:
            game_data[room]['playerinformation'][user_name][2]=True
    locker.release()
    return HttpResponse("")
def reallocate(request):
    global game_data
    global poker
    name=request.GET["name"]
    room=request.GET["room"]
    def test_begin_game():
        global game_data
        global poker
        if len(game_data[room]['playerinformation'].keys())<test_number:return
        for i in game_data[room]['playerinformation'].values():
            if not i[1]:return
        if random_card:
            random.shuffle(poker)
            record_poker(poker)
        else:
            conn = pymysql.connect(user='debian-sys-maint',charset='utf8',password="lPVVX9pMskl6Vzoj",database="shengji")
            cursor=conn.cursor(cursor=pymysql.cursors.DictCursor)
            cursor.execute("use shengji;")
            instruction="select card_information from shengji where time=%(n1)s;"
            cursor.execute(instruction,{"n1":cardtime})
            fetch_card=cursor.fetchall()
            poker=json.loads(fetch_card[0]['card_information'])
        # for i in game_data[room]['player']:
        #     game_data[room]['player']
        game_data[room]['begin_time']=time.time()
        game_data[room]['state']=1
        game_data[room]['nowlevel']=set_trump
        game_data[room]['trump']=0
        game_data[room]['trumpholder']=''
    test_begin_game()
    return HttpResponse("")
def testgamehtml(request):
    return render(request,'game.html',{'name':"Yuri",'room':"1023"})
def maidi(request):
    global game_data
    global poker
    global locker
    locker.acquire()
    name=request.GET["name"]
    room=request.GET["room"]
    di_card=request.GET["di_card"].split(',')
    game_data[room]['dicard']=di_card
    game_data[room]['state']=3#开始打牌
    for card_name in di_card:
        if card_name in game_data[room]['playercard'][name]:
            game_data[room]['playercard'][name].remove(card_name)
        else:
            print('error')
    game_data[room]['playerinformation'][name][2]=True
    locker.release()
    return HttpResponse("")
def record_poker(poker):
    if activate_mysql:
        conn = pymysql.connect(user='debian-sys-maint',charset='utf8',password="lPVVX9pMskl6Vzoj",database="shengji")
        cursor=conn.cursor(cursor=pymysql.cursors.DictCursor)
        cursor.execute("use shengji;")
        nowtime=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        f=open("log.txt",'a')
        card_information=json.dumps(poker)
        f.write(nowtime+'\n')
        instruction="insert shengji(time,card_information) values(%(n1)s,%(n2)s);"
        cursor.execute(instruction,{"n1":nowtime,"n2":card_information})
        conn.commit()
# Create your views here.
