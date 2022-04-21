alert("成功加入房间")
setInterval("update_message()","400")
// update_message()
var game_date={'mycard':[],'trumpcard':[],'nowtrump':0}
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
            game_date['state']=res.state
            $("#our_level").text(res.level[id%2]);
            $("#rival_level").text(res.level[(id+1)%2]);
            game_date['nowtrump']=res.trump
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
            if(res.state==0){//准备阶段
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
                $("#my_card").html('');
                game_date['mycard']=res.card
                game_date['trumpcard']=[]
                for(var k=0;k<res.card.length;++k){
                    if(res.card[k][0]==res.nowlevel)game_date['trumpcard'].append(res.card[k])
                    if(res.card[k]=='joker'||res.card[k]=='bigjoker')game_date['trumpcard'].append(res.card[k])
                    var t=document.createElement("img");
                    t.src="/static/img/poker/"+res.card[k]+".jpg";
                    var number=(49-parseInt(res.card.length*13/2)/10+k*1.3)
                    var str="img"+parseInt(number)+parseInt((number*10)%10)
                    $(t).attr("id",k)
                    if(is_up[k]){
                        $(t).addClass("up");
                    }
                    $(t).addClass(str);
                    t.onclick=function(){up_card(this)}
                    $("#my_card").append(t)
                }
                if(res.state==1){
                    $("#trump_color").children().addClass("disabled")
                    var trump_to_call=recoginze_trump(game_data['trumpcard'])
                    for(var available_trump in trump_to_call.keys()){
                        if(available_trump=='bigjoker'){//大王
                            if(trump_to_call[available_trump]==2&&$("#user_name").text()!=$("#trumpholder").text()){
                                //大王成对并且自己没叫
                                $("#NT").removeClass("disabled")
                            }                
                        }
                        else if(available_trump=='joker'){//小王
                            if(trump_to_call[available_trump]==2&&$("#user_name").text()!=$("#trumpholder").text()&&game_date['nowtrump']!=10){
                                $("#NT").removeClass("disabled")
                            }
                        }
                        else{
                            if(trump_to_call[available_trump]==2){
                                if(game_date['nowtrump']<5){
                                    if($("#user_name").text()!=$("#trumpholder").text()){
                                        $("#"+available_trump[1]+'_color').removeClass("disabled")
                                    }
                                    else if(color_to_int(available_trump[1])==game_date['nowtrump']){
                                        //加固该花色
                                        $("#"+available_trump[1]+'_color').removeClass("disabled")
                                    }
                                }
                                else{
                                    if(game_date['nowtrump']==0){
                                        $("#"+available_trump[1]+'_color').removeClass("disabled")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
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
}
function recoginze_trump(card){
    var ans=dict()
    for(var t in card){
        if(t in ans.keys())ans[t]+=1
        else ans[t]=1
    }
    return ans
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
        var trump_to_call=recoginze_trump(game_data['trumpcard'])
        if(color=="NT"){
            if(trump_to_call['bigjoker']==2)trump=10
            else trump=9
        }
        else{
            for(var t in trump_to_call.keys()){
                if(t[1]==color[0]){
                    if(trump_to_call[t]==2){
                        trump=color_to_int(t[1])+4
                    }
                    else{
                        trump=color_to_int(t[1])
                    }
                    break;
                }

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