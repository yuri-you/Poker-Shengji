alert("成功加入房间")
setInterval("update_message()","200")
// update_message()
var game_data_mycard=[]
var game_data_trumpcard=[]
var game_data_nowtrump=0
var game_data_state
var di_card=[]
var is_up=Array(25).fill(false);
function update_message(){
    $.ajax({
        url:"/requestdata",
        type:"get",
        data:{
            action:"information",
            name:$("#user_name").text(),
            room:$("#room").text()
        },
        dataType:"JSON",
        success:function(res){
            var tmp_name=$("#user_name").text()
            var id=res.playerinformation[tmp_name][0]
            game_data_state=res.state
            $("#our_level").text(res.level[id%2]);
            $("#rival_level").text(res.level[(id+1)%2]);
            game_data_nowtrump=res.trump
            switch(res.trump){
                case 0:$("#trump").text("");break;
                case 1:
                    $("#trump").text("◇")
                    $("#trump").css("color","#FF00FF")
                    break;
                case 2:
                    $("#trump").text("♣")
                    $("#trump").css("color","#008B45")
                    break;
                case 3:
                    $("#trump").text("♥")
                    $("#trump").css("color","red")
                    break;
                case 4:
                    $("#trump").text("♠")
                    $("#trump").css("color","#00FFFF")
                    break;
                case 5:
                    $("#trump").text("◇◇")
                    $("#trump").css("color","#FF00FF")
                    break;
                case 6:
                    $("#trump").text("♣♣")
                    $("#trump").css("color","#008B45")
                    break;
                case 7:
                    $("#trump").text("♥♥")
                    $("#trump").css("color","red")
                    break;
                case 8:
                    $("#trump").text("♠♠")
                    $("#trump").css("color","#00FFFF")
                    break;
                case 9:case 10:
                    $("#trump").text("NT")
                    $("#trump").css("color","white")
                    break;
            }
            $("#trumpholder").text(res.trumpholder)
            $('#out_card').empty();
            $('#rival2_card').empty();
            $('#partner_card').empty();
            $('#rival1_card').empty();
            $('#di_card').empty();
            if(res.wait_time!=-1){
                $('#di_card').text(parseInt(res.wait_time))
                $('#di_card').css("color",'yellow')
                $('#di_card').css("font-size",'30px')
                $('#di_card').addClass("img490")
            }
            if(res.state==0){
                update_message_state0(res)
            }
            else{
                if(res.change||game_data_mycard.length!=res.card.length){
                    $("#my_card").empty();
                    game_data_mycard=res.card
                    game_data_trumpcard=[]
                    for(var k=0;k<res.card.length;++k){
                        if(res.card[k][0]==number_to_level(res.nowlevel)){
                            game_data_trumpcard.push(res.card[k])
                        }
                        if(res.card[k]=='joker'||res.card[k]=='bigjoker'){
                            game_data_trumpcard.push(res.card[k])
                        }
                        var t=document.createElement("img");
                        t.src="/static/img/poker/"+res.card[k]+".jpg";
                        var number=(49-parseInt(res.card.length*13/2)/10+k*1.3)
                        var str="img"+parseInt(number)+parseInt((number*10)%10)
                        $(t).attr("id",k)
                        // if(is_up[k]){
                        //     $(t).addClass("up");
                        // }
                        $(t).addClass(str);
                        t.onclick=function(){up_card(this)}
                        $("#my_card").append(t)
                    }
                }
                switch(res.state){
                    case 1:update_message_state1(res);break;
                    case 2:update_message_state2(res);break;
                    case 3:update_message_state3(res);break;
                }
            }
        }
    })
}
function update_message_state0(res){
    if(res.state==0){//准备阶段
        var tmp_name=$("#user_name").text()
        var id=res.playerinformation[tmp_name][0]
        if(res.playerinformation[tmp_name][1]){
            $("#self_ready").text("已准备")
        }
        else{
            $("#self_ready").text("未准备")
        }
        if((id+1)%4<res.player.length){
            $("#rival2_name").text(res.player[(id+1)%4])
            if(res.playerinformation[res.player[(id+1)%4]][1]){
                $("#rival2_ready").text("已准备")
            }
            else{
                $("#rival2_ready").text("未准备")
            }
        }
        if((id+2)%4<res.player.length){
            $("#partner_name1").text(res.player[(id+2)%4])
            $("#partner_name2").text(res.player[(id+2)%4])
            if(res.playerinformation[res.player[(id+2)%4]][1]){
                $("#partner_ready").text("已准备")
            }
            else{
                $("#partner_ready").text("未准备")
            }
        }
        if((id+3)%4<res.player.length){
            $("#rival1_name").text(res.player[(id+3)%4])
            if(res.playerinformation[res.player[(id+3)%4]][1]){
                $("#rival1_ready").text("已准备")
            }
            else{
                $("#rival1_ready").text("未准备")
            }
        }   
    }
    else{
        alert("error")
    }
}
function update_message_state1(res){
    $("#rival2_ready").text("")
    $("#rival1_ready").text("")
    $("#partner_ready").text("")
    if(res.state==1){
        $("#self_ready").text("叫主阶段")
        var tmp_name=$("#user_name").text()
        var id=res.playerinformation[tmp_name][0]
        if(res.trumpholder!=''){
            var trumpholderid=res.playerinformation[res.trumpholder][0]
            var difference=(trumpholderid-id+4)%4
            var trumpholder_relatedname=''
            switch(difference){
                case 0:trumpholder_relatedname='#out_card';break;
                case 1:trumpholder_relatedname='#rival2_card';break;
                case 2:trumpholder_relatedname='#partner_card';break;
                case 3:trumpholder_relatedname='#rival1_card';break;
            }
            if(res.trump==10){
                var f1=document.createElement("img");
                f1.src='/static/img/poker/bigjoker.jpg'
                var f2=document.createElement("img");
                f2.src='/static/img/poker/bigjoker.jpg'
                $(f1).addClass('card_figure')
                $(f2).addClass('card_figure')
                if(difference==0 || difference==2){
                    $(f1).addClass('img470')
                    $(f2).addClass('img480')
                }
                else if(difference==1){
                    $(f1).addClass('img800')
                    $(f2).addClass('img810')
                }
                else{
                    $(f1).addClass('img200')
                    $(f2).addClass('img210')
                }
                $(trumpholder_relatedname).append(f1)
                $(trumpholder_relatedname).append(f2)
            }
            else if(res.trump==9){
                var f1=document.createElement("img");
                f1.src='/static/img/poker/joker.jpg'
                var f2=document.createElement("img");
                f2.src='/static/img/poker/joker.jpg'
                $(f1).addClass('card_figure')
                $(f2).addClass('card_figure')
                if(difference==0 || difference==2){
                    $(f1).addClass('img470')
                    $(f2).addClass('img480')
                }
                else if(difference==1){
                    $(f1).addClass('img800')
                    $(f2).addClass('img810')
                }
                else{
                    $(f1).addClass('img200')
                    $(f2).addClass('img210')
                }
                $(trumpholder_relatedname).append(f1)
                $(trumpholder_relatedname).append(f2)
            }
            else if(res.trump>4){
                var trumpcolor=int_to_color(res.trump-4)
                var cardname=number_to_level(res.nowlevel)
                var f1=document.createElement("img");
                f1.src='/static/img/poker/'+cardname+trumpcolor+'.jpg'
                var f2=document.createElement("img");
                f2.src='/static/img/poker/'+cardname+trumpcolor+'.jpg'
                $(f1).addClass('card_figure')
                $(f2).addClass('card_figure')
                if(difference==0 || difference==2){
                    $(f1).addClass('img470')
                    $(f2).addClass('img480')
                }
                else if(difference==1){
                    $(f1).addClass('img800')
                    $(f2).addClass('img810')
                }
                else{
                    $(f1).addClass('img200')
                    $(f2).addClass('img210')
                }
                $(trumpholder_relatedname).append(f1)
                $(trumpholder_relatedname).append(f2)
            }
            else if(res.trump>0){
                var trumpcolor=int_to_color(res.trump)
                var cardname=number_to_level(res.nowlevel)
                var f1=document.createElement("img");
                f1.src='/static/img/poker/'+cardname+trumpcolor+'.jpg'
                $(f1).addClass('card_figure')
                if(difference==0 || difference==2){
                    $(f1).addClass('img475')
                }
                else if(difference==1){
                    $(f1).addClass('img805')
                }
                else{
                    $(f1).addClass('img205')
                }
                $(trumpholder_relatedname).append(f1)
            }
        }
        $("#trump_color").children().addClass("disabled")
        var trump_to_call=recoginze_trump(game_data_trumpcard)
        if(trump_to_call[5]==2){//大王一对
            if($("#user_name").text()!=$("#trumpholder").text()){
                    //大王成对并且自己没叫
                $("#NT").removeClass("disabled")
            }                
        }
        if(trump_to_call[4]==2){//小王
            if($("#user_name").text()!=$("#trumpholder").text()&&game_data_nowtrump!=10){
                $("#NT").removeClass("disabled")
            }
        }
        for(var t=0;t<4;++t){
            if(trump_to_call[t]==2){
                if(game_data_nowtrump<5){
                    if($("#user_name").text()!=$("#trumpholder").text()){
                        $("#"+int_to_color(t+1)+'_color').removeClass("disabled")
                    }
                    else if(t+1==game_data_nowtrump){
                        //加固该花色
                        $("#"+int_to_color(t+1)+'_color').removeClass("disabled")
                    }
                }
            }
            else{
                if(trump_to_call[t]==1&&game_data_nowtrump==0){
                    $("#"+int_to_color(t+1)+'_color').removeClass("disabled")
                }     
            }
        }
    }
    else{
        alert("state error")
    }
}
function update_message_state2(res){
    if(res.state==2){
        $("#self_ready").text("埋底阶段")
        var tmp_name=$("#user_name").text()
        var id=res.playerinformation[tmp_name][0]
        $("#trump_color").children().addClass("disabled")
        var trumpholderid=res.playerinformation[res.trumpholder][0]
        var difference=(trumpholderid-id+4)%4
        var trumpholder_relatedname=''
        switch(difference){
            case 1:trumpholder_relatedname='#rival2_ready';break;
            case 2:trumpholder_relatedname='#partner_ready';break;
            case 3:trumpholder_relatedname='#rival1_ready';break;
        }
        if(difference!=0){
            $(trumpholder_relatedname).text("埋底中")
        }
        else{
            var div1=document.createElement("div");
            div1.innerHTML='<font size="5" style="color:red" class="img460">埋底中</font>'
            $("#out_card").append(div1)
        }
        if(tmp_name==res.trumpholder){//是本人埋底
            $("#play_card").removeClass("hide")
            $("#play_card_button").text("埋牌")
        }
    }
    else{
        alert("state error")
    }
}
function update_message_state3(res){
    if(res.state==3){
        $("#self_ready").text("出牌阶段")
        $("#play_card").removeClass("hide")
        $("#play_card_button").text("出牌")
        $("#play_card_button").addClass("disabled")
    }
    else{
        alert("state error")
    }
}
function number_to_level(number){
    switch(number){
        case 14:return 'A';
        case 13:return 'K';
        case 12:return 'Q';
        case 11:return 'J';
        case 10:return 'T';
        default:return number
    }
}
function self_ready(){
    if($("#zhunbei").text()=="准备"){
        $.ajax({
            url:"/ready",
            type:"get",
            data:{
                action:"ready",
                name:$("#user_name").text(),
                room:$("#room").text()
            },
            dataType:"JSON"})
        $("#zhunbei").text("取消准备")
        $("#self_ready").text("已准备")
    }
    else{
        $.ajax({
            url:"/ready",
            type:"get",
            data:{
                action:"unready",
                name:$("#user_name").text(),
                room:$("#room").text()
            },
            dataType:"JSON"})
        $("#zhunbei").text("准备")
        $("#self_ready").text("未准备")
    }
}

function up_card(self){
    if(is_up[$(self).attr("id")]){
        is_up[Number($(self).attr("id"))]=false
        $(self).removeClass("up");
    }
    else{
        is_up[Number($(self).attr("id"))]=true
        $(self).addClass("up");
    }
    check_legal()
}
function check_legal(){
    if(game_data_state==2){
        console.log($(".up").length)
        if($(".up").length==8){
            $("#play_card_button").removeClass("disabled")
        }
        else{
            $("#play_card_button").addClass("disabled")
        }
    }
}
function recoginze_trump(card){
    var ans=[0,0,0,0,0,0]
    for(var i=0;i<card.length;++i){
        var t=card[i]
        switch(t[1]){
            case "i":ans[5]+=1;break;//bigjoker
            case 'o':ans[4]+=1;break;//joker
            case 'S':ans[3]+=1;break;
            case 'H':ans[2]+=1;break;
            case 'C':ans[1]+=1;break;
            case 'D':ans[0]+=1;break;
        }
    }
    return ans
}
function reallocate(){
    $.ajax({
        url:"/reallocate",
        type:"get",
        data:{
            name:$("#user_name").text(),
            room:$("#room").text(),
        },
        dataType:"JSON"})
}
function color_to_int(color){
    switch(color){
        case 'S':return 4
        case 'H':return 3
        case 'C':return 2
        case 'D':return 1
    }
}
function int_to_color(number){
    switch(number){
        case 4:return 'S'
        case 3:return 'H'
        case 2:return 'C'
        case 1:return 'D'
    }
}
function calltrump(self){
    if($(self).hasClass("disabled"))return;
    else{
        var color=$(self).attr("id")
        var trump=0
        var trump_to_call=recoginze_trump(game_data_trumpcard)
        if(color=="NT"){
            if(trump_to_call[5]==2)trump=10
            else trump=9
        }
        else{
            if(trump_to_call[color_to_int(color[0])-1]==2){
                trump=color_to_int(color[0])+4
            }
            else{
                trump=color_to_int(color[0])
            }
        }
        $.ajax({
            url:"/calltrump",
            type:"get",
            data:{
                name:$("#user_name").text(),
                room:$("#room").text(),
                trump:trump
            },
            dataType:"JSON"})
    }
}
function play_card(self){
    if($(self).hasClass("disabled"))return
    if(game_data_state==2){//埋牌
        $('.up').each(function (index, domEle) {
            // index就是索引值
            var str=domEle.src
            di_card.push(str.substr(str.lastIndexOf("/") + 1,str.lastIndexOf(".")-str.lastIndexOf("/")-1))
        });
        $.ajax({
            url:"/maidi",
            type:"get",
            data:{
                name:$("#user_name").text(),
                room:$("#room").text(),
                di_card:di_card.join(',')
            },
            dataType:"JSON"})
    }
}