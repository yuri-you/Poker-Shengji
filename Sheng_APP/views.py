from http.client import HTTPResponse
from django.shortcuts import render,HttpResponse
import os,random,json,pymysql,time,datetime,threading,copy
mysqlpasswords=["lPVVX9pMskl6Vzoj","MxH4cfJT6fft4iA5"]
mysqlpassword=mysqlpasswords[1]
locker=threading.Lock()
test_number=4
allocate_time=5
wait_time=5
activate_mysql=False
set_trump=2
keep_time=3
keep_begin_time=0
_is_keep=-1#-1代表没有延迟需求，其余代表设置的begin_id
random_card=True
cardtime="2022-05-02 06:47:08"
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
def color_to_int(_color:str):
    if _color=='S':return 4
    elif _color=='H':return 3
    elif _color=='C':return 2
    elif _color=="D":return 1
    # elif _color=='i' or _color=='o':return 5
    else:
        raise "Input color error"
def number_to_int(_number:str):
    if _number=='A':return 14
    elif _number=='K':return 13
    elif _number=='Q':return 12
    elif _number=='J':return 11
    elif _number=='T':return 10
    else:
        return int(_number)
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
        game_data[room]['banker']=-1
        game_data[room]["firstgame"]=True
        game_data[room]['check_big_mannual']=False
        game_data[room]['withdraw']=False
        game_data[room]['show_di']=False
        game_data[room]['dicard']=[]
        game_data[room]['nowlevel']=set_trump
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
        # if str1[0]=='K':number=13
        # elif str1[0]=='Q':number=12
        # elif str1[0]=='J':number=11
        # elif str1[0]=='T':number=10
        # elif str1[0]=='A':number=14
        # else:number=int(str1[0])
        number=number_to_int(str1[0])
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
        global _is_keep
        if _is_keep!=-1 and keep_begin_time+keep_time<time.time():#更新到下一轮中
            if (_is_keep+game_data[room]['banker'])%2:#和庄家id不是同奇偶，闲家捡分
                turn_cards=[]
                for i in game_data[room]['tmp_card']:
                    turn_cards+=i
                mark,mark_card=count_mark(turn_cards)
                game_data[room]['score']+=mark
                game_data[room]['score_card']+=mark_card
            game_data[room]['last_card']=game_data[room]['tmp_card']
            # s=keep_begin_time+keep_time-time.time()
            game_data[room]['tmp_card']=[[],[],[],[]]
            game_data[room]['turn']=game_data[room]['player'][_is_keep]
            game_data[room]['begin']=_is_keep
            _is_keep=-1
        res['player']=game_data[room]['player']
        res['playerinformation']=game_data[room]['playerinformation']
        res['level']=game_data[room]['level']
        res['state']=game_data[room]['state']
        res['nowlevel']=game_data[room]['nowlevel']
        res['trump']=game_data[room]['trump']#0没人，1方块，2梅花，3红桃，4黑桃，5双方块，。。。9小王，10大王
        res['trumpholder']=game_data[room]['trumpholder']            
        res['wait_time']=-1#不是发牌结束时候叫主等待时间
        res['banker']=game_data[room]['banker']
        res['check_big_mannual']=game_data[room]['check_big_mannual']#需不需要人工判断大小
        res['withdraw']=game_data[room]['withdraw']
        res['show_di']=game_data[room]['show_di']
        res['di_card']=game_data[room]['dicard']
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
                        b=(game_data[room]['playerinformation'][name][0])*25
                        game_data[room]['playercard'][name]=poker[b:b+25]
                    else:
                        game_data[room]['state']=2
                        if game_data[room]['trump']==0:#无人叫庄
                            game_data[room]['trump']=9#自动无主
                        if game_data[room]['firstgame']:#第一局游戏，抢庄
                            game_data[room]['banker']=game_data[room]['playerinformation'][game_data[room]['trumpholder']][0]#存庄家id
                            game_data[room]['firstgame']=False
                        for i in game_data[room]['player']:
                            begin=game_data[room]['playerinformation'][i][0]*25
                            game_data[room]['playercard'][i]=poker[begin:begin+25]
                            game_data[room]['playerinformation'][i][2]=True#将所有人牌补齐，并且都改变了牌
                        #庄家取底    
                        banker_name=game_data[room]['player'][game_data[room]['banker']]
                        game_data[room]['playercard'][banker_name]=poker[100:108]+game_data[room]['playercard'][banker_name]
                        game_data[room]['playerinformation'][banker_name][2]=True#庄家摸底了，肯定牌改了
            elif game_data[room]['state']==2:
                pass
            elif game_data[room]['state']==3:
                res['score']=game_data[room]['score']
                res['score_card']=game_data[room]['score_card']
                res['begin']=game_data[room]['begin']
                res['turn']=game_data[room]['turn']
                # if game_data[room]['check_big_mannual']:#需要人工判断
                #     res['turn']=""
                res['tmp_card']=game_data[room]['tmp_card']
                res['last_card']=game_data[room]['last_card']
                res['legal_length']=game_data[room]['cardtype'][2]#牌数量
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
            conn = pymysql.connect(user='debian-sys-maint',charset='utf8',password=mysqlpassword,database="shengji")
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
        game_data[room]['show_di']=False
        game_data[room]['dicard']=[]
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
            conn = pymysql.connect(user='debian-sys-maint',charset='utf8',password=mysqlpassword,database="shengji")
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
    game_data[room]['score']=0
    game_data[room]['score_card']=[]
    game_data[room]['turn']=name
    game_data[room]['begin']=game_data[room]['playerinformation'][name][0]
    game_data[room]['last_card']=[[],[],[],[]]
    game_data[room]['tmp_card']=[[],[],[],[]]
    game_data[room]['cardtype']=[[],0,0]
    game_data[room]['state']=3#开始打牌
    for card_name in di_card:
        if card_name in game_data[room]['playercard'][name]:
            game_data[room]['playercard'][name].remove(card_name)
        else:
            print('error')
    game_data[room]['playerinformation'][name][2]=True
    locker.release()
    return HttpResponse("")
def judge_card_color(choosen_card,trump,now_level):
    if trump==5:#无主
        if choosen_card[0]=='b' or choosen_card[0]=='j' or number_to_int(choosen_card[0])==now_level:
            return 5#硬主是5
        else:
            return color_to_int(choosen_card[1])#副牌
    else:
        if choosen_card[0]=='b' or choosen_card[0]=='j' or number_to_int(choosen_card[0])==now_level:
            return trump#硬主是当前主牌的花色
        else:
            return color_to_int(choosen_card[1])#副牌
def check_big(room):#判断谁家的牌最大,并且把分加上去
    global game_data
    global poker
    now_level=game_data[room]['nowlevel']
    trump=game_data[room]['trump']
    card_type=game_data[room]['cardtype']#(类型,花色,总数)
    tmp_cards=game_data[room]['tmp_card']
    big_player_ids=list(range(4))
    def card_value(card:str):
        if trump==5:#无主
            if card[0]=='b':
                return 2#大王
            elif card[0]=='j':
                return 1#小王
            elif number_to_int(card[0])==now_level:#硬主
                return 0#全是副主
            else:
                tmp_type=color_to_int(card[1])#非硬主
                card_value=number_to_int(card[0])
                if card_value>now_level:card_value-=1#从2到13 （会越过打的那一集）
                return card_value
        else:#非无主
            if card[0]=='b':
                return 17#大王
            elif card[0]=='j':
                return 16#小王
            elif number_to_int(card[0])==now_level:#硬主
                if trump==color_to_int(card[1]):
                    return 15#正主
                else:
                    return 14#副主
            else:
                tmp_type=color_to_int(card[1])#非硬主
                card_value=number_to_int(card[0])
                if card_value>now_level:card_value-=1#从2到13 （会越过打的那一集）
                return card_value
    if len(card_type[0])==1:#只有一类牌，后台直接判断
        new_big_player_ids=[]
        #第一轮筛，把所有牌不是同花色的给删了,以及非主非同颜色副牌删了，这必不可能是最大
        for i in big_player_ids:
            is_player_legal=True
            player_card_type=-1
            for card in tmp_cards[i]:
                tmp_player_card_type=judge_card_color(card,trump,now_level)
                if tmp_player_card_type!=trump and tmp_player_card_type!=card_type[1]:#既不是主，也不是选择的花色
                    is_player_legal=False
                    break
                elif player_card_type!=-1 and player_card_type!=tmp_player_card_type:#和上一张不一样
                    is_player_legal=False
                    break
                if player_card_type==-1:
                    player_card_type=tmp_player_card_type
            if is_player_legal:#不满足情况的就删了，满足的才加进去
                new_big_player_ids.append(i)
        #第一轮删结束，更新big_id集合
        if len(new_big_player_ids)==1:#只剩一个了
            return True,new_big_player_ids[0]
        else:
            big_player_ids=new_big_player_ids
            new_big_player_ids=[]
        #第二轮筛，把不满足牌类型的删了
        if card_type[0][0][0]==0:#如果全是单牌
            for i in big_player_ids:
                if tmp_cards[i][0][1]=='i' or tmp_cards[i][0][1]=='o' or number_to_int(tmp_cards[i][0][0])==now_level or color_to_int(tmp_cards[i][0][1])==trump:
                    is_card_trump=1#是主牌
                else:
                    is_card_trump=0#不是主牌
                new_big_player_ids.append([i,is_card_trump,card_value(tmp_cards[i][0])])#该人id,是不是主牌,值
        else:
            for i in big_player_ids:
                is_player_legal=True
                for j in range(card_type[0][0][1]):#有几个一样的
                    for k in range(card_type[0][0][0]):#该类长度，比如拖拉长度为2
                        if tmp_cards[i][j*card_type[0][0][0]*2+2*k]!=tmp_cards[i][j*card_type[0][0][0]*2+2*k+1]:
                            is_player_legal=False
                            break
                        if k!=0:#从第二个开始比较是否是连续的，即形成拖拉
                            if card_value(tmp_cards[i][j*card_type[0][0][0]*2+2*k-2])-card_value(tmp_cards[i][j*card_type[0][0][0]*2+2*k])!=1:
                                is_player_legal=False
                                break
                    if not is_player_legal:break
                if is_player_legal:#不满足情况的就删了，满足的才加进去
                    if tmp_cards[i][0][1]=='i' or tmp_cards[i][0][1]=='o'or number_to_int(tmp_cards[i][0][0])==now_level or color_to_int(tmp_cards[i][0][1])==trump:
                        is_card_trump=1#是主牌
                    else:
                        is_card_trump=0#不是主牌
                    new_big_player_ids.append([i,is_card_trump,card_value(tmp_cards[i][0])])
        #第三轮筛选
        ans_id=-1
        ans_value=0
        for i in new_big_player_ids:
            tmp_value=100*i[1]+i[2]
            if tmp_value>ans_value:
                ans_id=i[0]
                ans_value=tmp_value
            elif tmp_value==ans_value:
                begin_id=game_data[room]['begin']
                if (i[0]+test_number-begin_id)%+test_number<(ans_id++test_number-begin_id)%+test_number:#先出
                    ans_id=i[0]
                    ans_value=tmp_value
        return True,ans_id
    else:
        # game_data[room]['check_big_mannual']=True
        return False,0#人工选

        
                
def receive_check_big_mannual(request):
    global game_data
    global poker
    global locker
    locker.acquire()
    room=request.GET["room"]
    big_name=request.GET["big_name"]
    big_id=game_data[room]["playerinformation"][big_name][0]
    if len(game_data[room]['playercard'][game_data[room]['player'][0]])==0:#牌打完了
        finish_game(big_id,game_data[room]['cardtype'],room)
    else:
        if (big_id+game_data[room]['banker'])%2:#和庄家id不是同奇偶，闲家捡分
            turn_cards=[]
            for i in game_data[room]['tmp_card']:
                turn_cards+=i
            mark,mark_card=count_mark(turn_cards)
            game_data[room]['score']+=mark
            game_data[room]['score_card']+=mark_card
        game_data[room]['last_card']=game_data[room]['tmp_card']
        game_data[room]['tmp_card']=[[],[],[],[]]
        game_data[room]['turn']=big_name
        game_data[room]['begin']=big_id
        game_data[room]['check_big_mannual']=False
    locker.release()
    return HttpResponse("")
def count_mark(cards:list):
    ans=0
    mark_cards=[]
    for card in cards:
        if card[0]=='5':
            ans+=5
            mark_cards.append(card)
        elif card[0]=="T":
            ans+=10
            mark_cards.append(card)
        elif card[0]=='K':
            ans+=10
            mark_cards.append(card)
    return ans,mark_cards
def withdraw(request):
    global game_data
    global poker
    global locker
    locker.acquire()
    name=request.GET["name"]
    room=request.GET["room"]
    tmp_id=game_data[room]['playerinformation'][name][0]
    turn_id=game_data[room]['playerinformation'][game_data[room]['turn']][0]
    if (tmp_id+1)%test_number==turn_id:
        game_data[room]['turn']=name
        for card in game_data[room]['tmp_card'][tmp_id]:
            game_data[room]['playercard'][name].append(card)
        game_data[room]['playerinformation'][name][2]=True #修改过牌
        game_data[room]['tmp_card'][tmp_id]=[]
    locker.release()
    return HttpResponse("")
def finish_game(di_owner,last_card_type,room):#结束一局，di_owner是最后一轮谁大
    global game_data
    if (di_owner+game_data[room]['banker'])%2:#和庄家id不是同奇偶，闲家捡分
        times=2**(last_card_type[0][0][0])
        mark,mark_card=count_mark(game_data[room]['dicard'])
        game_data[room]['score']+=times*mark
    if game_data[room]['score']<80:#过牌
        game_data[room]['banker']=(game_data[room]['banker']+2)%test_number
        if game_data[room]['score']==0:#大光
            game_data[room]['level'][(game_data[room]['banker'])%2]=(game_data[room]['level'][(game_data[room]['banker'])%2]+3-2)%13+2#超过14就取模
        elif game_data[room]['score']<40:#小光
            game_data[room]['level'][(game_data[room]['banker'])%2]=(game_data[room]['level'][(game_data[room]['banker'])%2]+2-2)%13+2#超过14就取模
        else:#过牌
            game_data[room]['level'][(game_data[room]['banker'])%2]=(game_data[room]['level'][(game_data[room]['banker'])%2]+1-2)%13+2#超过14就取模
    else:
        game_data[room]['banker']=(game_data[room]['banker']+1)%test_number
        add_level=(game_data[room]['score']-80)//40
        game_data[room]['level'][(game_data[room]['banker'])%2]=(game_data[room]['level'][(game_data[room]['banker'])%2]+add_level-2)%13+2#超过14就取模
    game_data[room]['state']=0
    game_data[room]['show_di']=True  
    for name in game_data[room]['player']:
        game_data[room]['playerinformation'][name][1]=False
    game_data[room]['nowlevel']=game_data[room]['level'][game_data[room]['banker']%2]
    return
def show_card(request):
    global game_data
    global poker
    global locker
    locker.acquire()
    name=request.GET["name"]
    room=request.GET["room"]
    if game_data[room]['turn']!=name:#不是自己出牌。比如和withdraw撞上了
        locker.release()
        return HttpResponse("")
    show_card=request.GET['show_card'].split(',')
    tmp_id=game_data[room]['playerinformation'][name][0]
    res=dict()
    if game_data[room]['player'][game_data[room]['begin']]==name:#第一个人出牌
        # res["legal"],res['force_card']=check_first_show_card_legal(show_card)
        # if not res["legal"]:
        #     ans=json.dumps(res)
        #     return HttpResponse(ans)
        
        #目前做法是添加withdraw 功能
        game_data[room]['withdraw']=True
        game_data[room]['cardtype']=card_type_judgement(show_card,room) #返回的是一个tuple
    game_data[room]['tmp_card'][tmp_id]=copy.copy(show_card)
    for card in show_card:
        game_data[room]['playercard'][name].remove(card)
    game_data[room]['playerinformation'][name][2]=True #修改过牌
    if game_data[room]['begin']==(tmp_id+1)%test_number:#最后一个人出牌
        game_data[room]['withdraw']=False#一轮打完了，ban掉撤回牌
        is_now_check,big_id=check_big(room)
        if is_now_check:#后台可以判断
            if len(game_data[room]['playercard'][name])==0:#牌打完了
                finish_game(big_id,game_data[room]['cardtype'],room)
            else:
                global keep_begin_time
                global _is_keep
                keep_begin_time=time.time()
                _is_keep=big_id
        else:   
            game_data[room]['check_big_mannual']=True
    else:
        game_data[room]['turn']=game_data[room]['player'][(tmp_id+1)%test_number]
    locker.release()
    return HttpResponse("")
def check_first_show_card_legal(show_card:list):#->bool,list (甩牌是否合法，强制要求出)
    #unfinished
    return True,[]
def card_type_judgement(show_cards:list,room):
    #unfinished
    global game_data
    pair_cards=[]
    single_cards=[]
    now_level=game_data[room]['nowlevel']
    trump=game_data[room]['trump']
    if trump>=9:
        trump=5
    else:
        trump=(trump-1)%4+1
    #1方块，2草花，3红桃，4黑桃，5无主
    def card_value(card:str):
        if trump==5:#无主
            if card[0]=='b':
                return 2#大王
            elif card[0]=='j':
                return 1#小王
            elif number_to_int(card[0])==now_level:#硬主
                return 0#全是副主
            else:
                tmp_type=color_to_int(card[1])#非硬主
                card_value=number_to_int(card[0])
                if card_value>now_level:card_value-=1#从2到13 （会越过打的那一集）
                return card_value
        else:#非无主
            if card[0]=='b':
                return 17#大王
            elif card[0]=='j':
                return 16#小王
            elif number_to_int(card[0])==now_level:#硬主
                if trump==color_to_int(card[1]):
                    return 15#正主
                else:
                    return 14#副主
            else:
                tmp_type=color_to_int(card[1])#非硬主
                card_value=number_to_int(card[0])
                if card_value>now_level:card_value-=1#从2到13 （会越过打的那一集）
                return card_value
    def longest_card(pair_cards):
        l=len(pair_cards)
        longest=0
        for i in range(l):
            continuous=0
            for j in range(l-1-i):
                if pair_cards[i+j]-pair_cards[i+j+1]!=1:
                    break
                else:
                    continuous+=1
            if continuous+1>longest:
                longest=continuous+1
                longest_start=pair_cards[i]
            if l-1-i<=longest:
                break
        for i in range(longest):
            pair_cards.remove(longest_start-i)
        return longest
    for i in show_cards:
        if len(single_cards)==0 or single_cards[-1]!=i:
            single_cards.append(i)
        else:
            single_cards.pop(-1)
            pair_cards.append(card_value(i))
    card_category=[]
    while pair_cards!=[]:
        longest_type=longest_card(pair_cards)
        if card_category==[] or card_category[-1][0]!=longest_type:
            card_category.append([longest_type,1])
        else:
            card_category[-1][1]+=1
    if len(single_cards)!=0:
        card_category.append([0,len(single_cards)])
    #card_category是牌型
    card_color=judge_card_color(show_cards[0],trump,now_level)
    return (card_category,card_color,len(show_cards))#先是牌型，后是花色,最后是总数
def record_poker(poker):
    if activate_mysql:
        conn = pymysql.connect(user='debian-sys-maint',charset='utf8',password=mysqlpassword,database="shengji")
        cursor=conn.cursor(cursor=pymysql.cursors.DictCursor)
        cursor.execute("use shengji;")
        nowtime=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        f=open("log.txt",'a')
        card_information=json.dumps(poker)
        f.write(nowtime+'\n')
        instruction="insert shengji(time,card_information) values(%(n1)s,%(n2)s);"
        cursor.execute(instruction,{"n1":nowtime,"n2":card_information})
        conn.commit()
def requestmodify(request):
    room=request.GET['room']
    return render(request,'modify.html',{'room':room})
def level_legal(level):
    if level=='A' or level=='K' or level=='Q' or level=='J' or level=='T':return True
    elif number_to_int(level)>1 and number_to_int(level)<=10:#10写成T或者不写成都行
        return True
    else:return False
def modifydata(request):
    global game_data
    global locker
    locker.acquire()
    room=request.GET['room']
    is_modify=False
    if request.GET['myscore']!='' and level_legal(request.GET['myscore']):
        game_data[room]['level'][0]=number_to_int(request.GET['myscore'])
        is_modify=True
    if request.GET['rivalscore']!='' and level_legal(request.GET['rivalscore']):
        game_data[room]['level'][1]=number_to_int(request.GET['rivalscore'])
        is_modify=True
    if request.GET['banker']!='' and request.GET['banker'] in game_data[room]['player']:
        game_data[room]['banker']=game_data[room]['playerinformation'][request.GET['banker']][0]
        is_modify=True
    if is_modify:
        game_data[room]['nowlevel']=game_data[room]['level'][game_data[room]['banker']%2]
    locker.release()
    return render(request,'close.html')
# Create your views here.
