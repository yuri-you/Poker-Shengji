alert("成功加入房间")
setInterval("update_message()","300")
// update_message()
var game_data_mycard=[]
var game_data_trumpcard=[]
var game_data_nowtrump=0
var game_data_state
var center_card_type//0是空，1是底牌，2是上一轮
var begin_player
var turn_player
var last_card_exist_time=5
var last_card_show_second
var legal_length
var last_card_show=false
var di_card=[]
var look_last_turn=false
var turn_times=-1//#现在是该局的第几轮
var last_cards,tmp_cards//上一轮的牌，这一轮的牌
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
            if(res.state!=2&&res.state!=3){
                $("#play_card_button").addClass('hide')
            }
            else{
                $("#play_card_button").removeClass('hide')
            }
            if(res.state!=3){
                $("#withdraw").addClass('hide')
            }
            else{
                $("#withdraw").removeClass('hide')
            }
            var tmp_name=$("#user_name").text()
            var id=res.playerinformation[tmp_name][0]
            if(id){
                $("#modify_data").addClass('hide')
            }
            game_data_state=res.state
            if(res.check_big_mannual&&id==0){
                $("#check_big_mannual").removeClass("hide")
                for(var i=0;i<res.player.length;++i){
                    $("#big"+i).text(res.player[i])
                }
            }
            else{
                $("#check_big_mannual").addClass("hide")
            }
            
            $('#out_card').empty();
            $('#rival2_card').empty();
            $('#partner_card').empty();
            $('#rival1_card').empty();
            di_card=res.di_card
            if(res.show_di){
                $("#di_card").empty()
                $("#di_card").removeClass("img490")
                for(var i=0;i<8;++i){
                    var f=document.createElement("img");
                    f.src='/static/img/poker/'+di_card[i]+'.jpg'
                    $(f).addClass('card_figure')
                    var classstring
                    if(i<6)classstring='img4'+(i+4)+'0'
                    else classstring='img5'+(i-6)+'0'
                    $(f).addClass(classstring)
                    $("#di_card").append(f)
                }
                center_card_type=2  
                for(var k=0;k<res.tmp_card[id].length;++k){
                    var t=document.createElement("img");
                    t.src="/static/img/poker/"+res.tmp_card[id][k]+".jpg";
                    var str="img"+(48-parseInt(res.tmp_card[id].length/2)+k)+'0'
                    $(t).addClass('card_figure')
                    $(t).addClass(str);
                    $("#out_card").append(t)
                }
                //下家出的牌
                for(var k=0;k<res.tmp_card[(id+1)%4].length;++k){
                    var t=document.createElement("img");
                    t.src="/static/img/poker/"+res.tmp_card[(id+1)%4][k]+".jpg";
                    var str="img"+(85-res.tmp_card[(id+1)%4].length+k)+'0'
                    $(t).addClass('card_figure')
                    $(t).addClass(str);
                    $("#rival2_card").append(t)
                }
                //对家出的牌
                for(var k=0;k<res.tmp_card[(id+2)%4].length;++k){
                    var t=document.createElement("img");
                    t.src="/static/img/poker/"+res.tmp_card[(id+2)%4][k]+".jpg";
                    var str="img"+(48-parseInt(res.tmp_card[(id+2)%4].length/2)+k)+'0'
                    $(t).addClass('card_figure')
                    $(t).addClass(str);
                    $("#partner_card").append(t)
                }
                //上家出的牌
                for(var k=0;k<res.tmp_card[(id+3)%4].length;++k){
                    var t=document.createElement("img");
                    t.src="/static/img/poker/"+res.tmp_card[(id+3)%4][k]+".jpg";
                    var str="img"+(16+k)+'0'
                    $(t).addClass('card_figure')
                    $(t).addClass(str);
                    $("#rival1_card").append(t)
                }
            }
            switch(res.nowlevel){
                case 14:$("#now_game_level").text('A');break;
                case 13:$("#now_game_level").text('K');break;
                case 12:$("#now_game_level").text('Q');break;
                case 11:$("#now_game_level").text('J');break;
                default:$("#now_game_level").text(res.nowlevel);
            }
            switch(res.level[id%2]){
                case 14:$("#our_level").text('A');break;
                case 13:$("#our_level").text('K');break;
                case 12:$("#our_level").text('Q');break;
                case 11:$("#our_level").text('J');break;
                default:$("#our_level").text(res.level[id%2]);
            }
            switch(res.level[(id+1)%2]){
                case 14:$("#rival_level").text('A');break;
                case 13:$("#rival_level").text('K');break;
                case 12:$("#rival_level").text('Q');break;
                case 11:$("#rival_level").text('J');break;
                default:$("#rival_level").text(res.level[(id+1)%2]);
            }
            if(res.banker!=-1)$("#banker").text(res.player[res.banker])
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
            if(res.state==0){
                $('#zhunbei').removeClass('hide')
                update_message_state0(res)
            }
            else{
                $('#zhunbei').addClass('hide')
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
        $("#my_card").empty()
        $("#score").text(res.score)
        var tmp_name=$("#user_name").text()
        var id=res.playerinformation[tmp_name][0]
        if(res.playerinformation[tmp_name][1]){
            $("#self_ready").text("已准备")
            $("#zhunbei").text("取消准备")
        }
        else{
            $("#self_ready").text("未准备")
            $("#zhunbei").text("准备")
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
    if(res.state==1){
        $('#di_card').empty();
        if(res.wait_time!=-1){
            $('#di_card').text(parseInt(res.wait_time))
            $('#di_card').css("color",'yellow')
            $('#di_card').css("font-size",'30px')
            $('#di_card').addClass("img490")
        }
        else{
            $('#di_card').removeClass("img490")
        }
        $("#rival2_ready").text("")
        $("#rival1_ready").text("")
        $("#partner_ready").text("")
        $("#score").text(res.score)
        $("#score_card").empty()
        $('#trump_color').removeClass('hide')
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
        $('#di_card').empty();
        $("#self_ready").text("埋底阶段")
        var tmp_name=$("#user_name").text()
        var id=res.playerinformation[tmp_name][0]
        $("#trump_color").children().addClass("disabled")
        var banker=res.banker
        var difference=(banker-id+4)%4
        var banker_relatedname=''
        switch(difference){
            case 1:banker_relatedname='#rival2_ready';break;
            case 2:banker_relatedname='#partner_ready';break;
            case 3:banker_relatedname='#rival1_ready';break;
        }
        if(difference!=0){
            $(banker_relatedname).text("埋底中")
        }
        else{
            var div1=document.createElement("div");
            div1.innerHTML='<font size="5" style="color:red" class="img460">埋底中</font>'
            $("#out_card").append(div1)
        }
        if(id==res.banker){//是本人埋底
            $("#play_card").removeClass("hide")
            $("#play_card_button").text("埋牌")
        }
        else{
            $("#play_card").addClass("hide")
        }
    }
    else{
        alert("state error")
    }
}
function update_message_state3(res){
    var tmp_name=$("#user_name").text()
    var id=res.playerinformation[tmp_name][0]
    if(res.state==3){
        $('#di_card').removeClass("img490")
        $("#trump_color").addClass("hide")
        $("#self_ready").text("出牌阶段")
        $("#play_card").removeClass("hide")
        $("#play_card_button").text("出牌")
        $("#score").text(res.score)
        $('#rival2_ready').text("")
        $('#rival1_ready').text("")
        $('#partner_ready').text("")
        last_cards=res.last_card
        tmp_cards=res.tmp_card
        legal_length=res.legal_length
        if(res.withdraw&&(id+1)%res.player.length==res.playerinformation[res.turn][0]){
            $("#withdraw").removeClass("disabled")
        }
        else{
            $("#withdraw").addClass("disabled")
        }
        begin_player=res.player[res.begin]
        turn_player=res.turn
        var tmp_player_relatedname=''
        var difference=(res.playerinformation[turn_player][0]+res.player.length-id)%res.player.length
        switch(difference){
            case 1:tmp_player_relatedname='#rival2_ready';break;
            case 2:tmp_player_relatedname='#partner_ready';break;
            case 3:tmp_player_relatedname='#rival1_ready';break;
        }
        if(tmp_player_relatedname!=''){
            $(tmp_player_relatedname).text("出牌中")
        }
        for(var k=0;k<res.score_card.length;++k){//分牌
            var t=document.createElement("img");
            t.src="/static/img/poker/"+res.score_card[k]+".jpg";
            $(t).addClass("mycard")
            $(t).addClass("img"+(k+1)+'0')
            $("#score_card").append(t)
        }
        if(turn_times!=res.turn_times){
            look_last_turn=false
            turn_times=res.turn_times
        }
        if(look_last_turn){
            for(var k=0;k<res.last_card[id].length;++k){
                var t=document.createElement("img");
                t.src="/static/img/poker/"+res.last_card[id][k]+".jpg";
                var str="img"+(48-parseInt(res.last_card[id].length/2)+k)+'0'
                $(t).addClass('card_figure')
                $(t).addClass(str);
                $("#out_card").append(t)
            }
            //下家出的牌
            for(var k=0;k<res.last_card[(id+1)%4].length;++k){
                var t=document.createElement("img");
                t.src="/static/img/poker/"+res.last_card[(id+1)%4][k]+".jpg";
                var str="img"+(85-res.last_card[(id+1)%4].length+k)+'0'
                $(t).addClass('card_figure')
                $(t).addClass(str);
                $("#rival2_card").append(t)
            }
            //对家出的牌
            for(var k=0;k<res.last_card[(id+2)%4].length;++k){
                var t=document.createElement("img");
                t.src="/static/img/poker/"+res.last_card[(id+2)%4][k]+".jpg";
                var str="img"+(48-parseInt(res.last_card[(id+2)%4].length/2)+k)+'0'
                $(t).addClass('card_figure')
                $(t).addClass(str);
                $("#partner_card").append(t)
            }
            //上家出的牌
            for(var k=0;k<res.last_card[(id+3)%4].length;++k){
                var t=document.createElement("img");
                t.src="/static/img/poker/"+res.last_card[(id+3)%4][k]+".jpg";
                var str="img"+(16+k)+'0'
                $(t).addClass('card_figure')
                $(t).addClass(str);
                $("#rival1_card").append(t)
            }
        }
        else{
            //看这一轮的牌
            //自己出的牌
            for(var k=0;k<res.tmp_card[id].length;++k){
                var t=document.createElement("img");
                t.src="/static/img/poker/"+res.tmp_card[id][k]+".jpg";
                var str="img"+(48-parseInt(res.tmp_card[id].length/2)+k)+'0'
                $(t).addClass('card_figure')
                $(t).addClass(str);
                $("#out_card").append(t)
            }
            //下家出的牌
            for(var k=0;k<res.tmp_card[(id+1)%4].length;++k){
                var t=document.createElement("img");
                t.src="/static/img/poker/"+res.tmp_card[(id+1)%4][k]+".jpg";
                var str="img"+(85-res.tmp_card[(id+1)%4].length+k)+'0'
                $(t).addClass('card_figure')
                $(t).addClass(str);
                $("#rival2_card").append(t)
            }
            //对家出的牌
            for(var k=0;k<res.tmp_card[(id+2)%4].length;++k){
                var t=document.createElement("img");
                t.src="/static/img/poker/"+res.tmp_card[(id+2)%4][k]+".jpg";
                var str="img"+(48-parseInt(res.tmp_card[(id+2)%4].length/2)+k)+'0'
                $(t).addClass('card_figure')
                $(t).addClass(str);
                $("#partner_card").append(t)
            }
            //上家出的牌
            for(var k=0;k<res.tmp_card[(id+3)%4].length;++k){
                var t=document.createElement("img");
                t.src="/static/img/poker/"+res.tmp_card[(id+3)%4][k]+".jpg";
                var str="img"+(16+k)+'0'
                $(t).addClass('card_figure')
                $(t).addClass(str);
                $("#rival1_card").append(t)
            }
        }
        check_legal()
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
        // console.log($(".up").length)
        if($(".up").length==8){
            $("#play_card_button").removeClass("disabled")
        }
        else{
            $("#play_card_button").addClass("disabled")
        }
    }
    else if(game_data_state==3){
        if(turn_player!=$("#user_name").text()){//不是自己出牌
            $("#play_card_button").addClass("disabled")
            return
        }
        var show_card=Array()
        $('.up').each(function (index, domEle) {
            // index就是索引值
            var str=domEle.src
            show_card.push(str.substr(str.lastIndexOf("/") + 1,str.lastIndexOf(".")-str.lastIndexOf("/")-1))
        });
        if(begin_player==$("#user_name").text()){
            //第一手出牌，只要判断是不是出的同一类花色的牌，甩牌失败后端判断
            if(show_card.length==0){
                $("#play_card_button").addClass("disabled")
                // return
            }
            else{
                var color=Get_color_id(show_card[0])
                var same=true
                for(var i=1;i<show_card.length;++i){
                    if(color!=Get_color_id(show_card[i])){
                        same=false
                        break
                    }
                }
                if(same){
                    $("#play_card_button").removeClass("disabled")
                }
                else{
                    $("#play_card_button").addClass("disabled")
                }
            }
        }
        else{
            //跟牌，目前只判断数量是否符合
            if(show_card.length!=legal_length){
                $("#play_card_button").addClass("disabled")
                // return
            }
            else $("#play_card_button").removeClass("disabled")
        }
    }
}
function Get_color_id(card){
    if(card[0]=='j'||card[0]=='b'||card[0]==$("#now_game_level").text()){//主牌
        if(game_data_nowtrump>=9){
            return 5
        }
        else{
            return (game_data_nowtrump-1)%4+1 //值为4,8时候(即黑桃）得到4，而不是0
        }
    }
    else{
        return color_to_int(card[1])
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
        var tmp_di_card=Array()
        $('.up').each(function (index, domEle) {
            // index就是索引值
            var str=domEle.src
            tmp_di_card.push(str.substr(str.lastIndexOf("/") + 1,str.lastIndexOf(".")-str.lastIndexOf("/")-1))
        });
        $.ajax({
            url:"/maidi",
            type:"get",
            data:{
                name:$("#user_name").text(),
                room:$("#room").text(),
                di_card:tmp_di_card.join(',')
            },
            dataType:"JSON"})
        $("#play_card_button").addClass("disabled")
    }
    else if(game_data_state==3){//出牌
        var show_card=Array()
        $('.up').each(function (index, domEle) {
            // index就是索引值
            var str=domEle.src
            show_card.push(str.substr(str.lastIndexOf("/") + 1,str.lastIndexOf(".")-str.lastIndexOf("/")-1))
        });
        $.ajax({
            url:"/show_card",
            type:"get",
            data:{
                name:$("#user_name").text(),
                room:$("#room").text(),
                show_card:show_card.join(',')
            },
            dataType:"JSON",
            success:function(res){
                if(!res.legal){
                    $.ajax({
                        url:"/show_card",
                        type:"get",
                        data:{
                            name:$("#user_name").text(),
                            room:$("#room").text(),
                            show_card:res.force_card.join(',')
                        },
                        dataType:"JSON"
                    })
                }
            }
        })
        $(self).addClass("disabled")
    }
}
function mannual_judge_big(self){
    var t=confirm("确认是"+$(self).children().text()+"大吗？")
    if(!t)return
    $.ajax({
        url:"/check_big_mannual",
        type:"get",
        data:{
            room:$("#room").text(),
            big_name:$(self).children().text()
        },
        dataType:"JSON"
    })
    $("#check_big_mannual").addClass(hide)
}
function di_pai(){
    if(game_data_state<=2)return;
    if($('#banker').text()!=$("#user_name").text())return;
    // console.log($('#di_card').text()!='')
    if(center_card_type==2){
        $('#di_card').empty()
        center_card_type=0
    }
    else{
        $("#di_card").empty()
        for(var i=0;i<8;++i){
            var f=document.createElement("img");
            f.src='/static/img/poker/'+di_card[i]+'.jpg'
            $(f).addClass('card_figure')
            var classstring
            if(i<6)classstring='img4'+(i+4)+'0'
            else classstring='img5'+(i-6)+'0'
            console.log(classstring)
            $(f).addClass(classstring)
            $("#di_card").append(f)
        }
        center_card_type=2
    }
}
function withdraw(self){
    if($(self).hasClass("disabled"))return
    $.ajax({
        url:"/withdraw",
        type:"get",
        data:{
            name:$("#user_name").text(),
            room:$("#room").text(),
        },
        dataType:"JSON"
    })
}
function modify(){
    if(game_data_state!=0){
        alert("请在准备阶段再修改信息")
        return
    }
    else{
        var tempwindow=open('_blank');
        tempwindow.location='/requestmodify?room='+$("#room").text();
    }
}
function show_last_cards(){
    if(game_data_state==3){
    look_last_turn=!look_last_turn
    }
}