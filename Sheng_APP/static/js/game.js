alert("成功加入房间")
setInterval("update_message()","2000")
function update_message(){
    $.ajax({
        url:"/requestdata",
        type:"get",
        data:{
            name:$("#user_name").text(),
            room:$("#room").text()
        },
        dataType:"JSON",
        success:function(res){
            $("#our_level").text(res.our_level);
            $("#rival_level").text(res.rival_level);
            var t=$("#partner")
            $("#partner").text(res.partner);
        }
    })
}