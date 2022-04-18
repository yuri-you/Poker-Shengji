from http.client import HTTPResponse
from django.shortcuts import render,HttpResponse
import os,random,json,pymysql

game_data=dict()

def requestpoke(request):
    global poker
    time=int(request.GET['n1'])
    print(time)
    if time==0:
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
        random.shuffle(poker)
    def sort_card(str1):
        if str1=="bigjoker":return 100
        elif str1=="joker":return 99
        color=str1[1]
        if str1[0]=='K':number=13
        elif str1[0]=='Q':number=12
        elif str1[0]=='J':number=11
        elif str1[0]=='T':number=10
        elif str1[0]=='A':number=14
        else:number=int(str1[0])
        x=["D","C","H","S"]
        for j in range(len(x)):
            if str1[1]==x[j]:
                return 16*j+number
    # def checklegal(li):
    #     a=dict()
    #     for i in li:
    #         if i in a:
    #             if a[i]>=2:
    #                 print(i)
    #             else: a[i]+=1
    #         else:
    #             a[i]=1
    # y=poker[0:time+1]
    # print(y)
    # x=sorted(y,key=sort_card)
    # # x=sorted(poker[0:time+1].sort(key=sort_card,reverse=True)
    # print(x)
    # checklegal(poker[0:time+1])
    # checklegal(sorted(poker[0:time+1],key=sort_card,reverse=True))
    t={"time":time,"name":sorted(poker[0:time+1],key=sort_card,reverse=True)}
    r=json.dumps(t)
    return HttpResponse(json.dumps(t))
def login(request):
    return render(request,"login.html")
def addroom(request):
    global game_data
    name=request.GET["name"]
    room=request.GET["room"]
    if room not in game_data:
        game_data[room]={'state':0,'player':[],'playerinformation':dict(),'level':[2,2]}#state 0未开始，1发牌，
    if name not in game_data[room]['player']:
        if len(game_data[room]['player'])==4:
            return render(request,"login.html",{'a':"房间满了,请换房间加入"})
        else:
            game_data[room]['playerinformation'][name]=[len(game_data[room]['player']),False]
            game_data[room]['player'].append(name)
    return render(request,'game.html',{'name':name,'room':room})
def requestdata(request):
    global game_data
    name=request.GET["name"]
    room=request.GET["room"]
    print(game_data[room]['playerinformation'])
    if request.GET["action"]=="information":
        res=dict()
        res['player']=game_data[room]['player']
        res['playerinformation']=game_data[room]['playerinformation']
        res['level']=game_data[room]['level']
        ans=json.dumps(res)
        return HttpResponse(ans)
    elif request.GET["action"]=='ready':
        game_data[room]['playerinformation'][name][1]=True
        return
    elif request.GET["action"]=='unready':
        game_data[room]['playerinformation'][name][1]=False
        return
def testgamehtml(request):
    return render(request,'game.html',{'name':"Yuri",'room':"1023"})
# Create your views here.
