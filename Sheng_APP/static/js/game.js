alert("成功加入房间")
setInterval("update_message()","400")
// update_message()
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
            $("#our_level").text(res.level[id%2]);
            $("#rival_level").text(res.level[(id+1)%2]);
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
            if(res.state!=0){
                $("#my_card").html('');
                for(var k=0;k<res.card.length;++k){
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
            }
        }
    })
}
function self_ready(){
    if($("#zhunbei").text()=="准备"){
        $.ajax({
            url:"/requestdata",
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
            url:"/requestdata",
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
    // console.log($(self))
    //     if($(self).hasClass("up")){
    //         $(self).removeClass("up");
    //     }
    //     else{
    //         $(self).addClass("up");
    //     }
    if(is_up[$(self).attr("id")]){
        is_up[Number($(self).attr("id"))]=false
        $(self).removeClass("up");
    }
    else{
        is_up[Number($(self).attr("id"))]=true
        $(self).addClass("up");
    }
}