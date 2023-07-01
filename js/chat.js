
/*
//定时器*/
const contextarray = [];
const messageBody = document.querySelector('#article-wrapper');
$(document).ready(function () {
    $("#key").val($.cookie('key'));
    $("#key").on("input",function(e){
        $.cookie('key',e.delegateTarget.value);
    });
    $("#kw-target").on('keydown', function (event) {
        if (event.keyCode == 13) {
            send_post();
            return false;
        }
    });
    $("#ai-btn").click(function () {
        send_post();
        return false;
    });
    $("#clean").click(function () {
        $("#article-wrapper").html("");
        layer.msg("清理完毕!");
        return false;
    });
    function articlewrapper(answer,str){
        $("#article-wrapper").append('<li class="article-content" id="'+answer+'"><pre></pre></li>');
        if(str == null || str == ""){
            str="当前描述可以存在不适或者服务器超时,未生成成功,请更换词语尝试!";
        }
        let str_ = ''
        let i = 0
        let timer = setInterval(()=>{
            if(str_.length<str.length){
                str_ += str[i++]
                $("#"+answer).children('pre').text(str_+'_')//打印时加光标
                messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
            }else{
                clearInterval(timer)
                $("#"+answer).children('pre').text(str_)//打印时加光标
                messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
            }
        },5)
    }
    function articlemapping(str){
        if(str == null || str == ""){
            $("#article-wrapper").append('<li class="article-title">Me：'+prompt+'</li>');
            articlewrapper(randomString(16),'当前描述可以存在不适或者服务器超时,未生成成功,请更换词语尝试!');
        }else{
            $("#article-wrapper").append('<li class="article-content"><pre><img src="'+str+'"/></pre></li>');
            messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
        }
    }

    $("#balance").click(function () {//查询余额
        var prompt = $("#key").val();
        if (prompt == "") {
            layer.msg("请先输入key才能查询!", { icon: 5 });
            return;
        }
        var loading = layer.msg('正在查询中,请稍后...', {
            icon: 16,
            shade: 0.4,
            time:false //取消自动关闭
        });
        $.ajax({
            cache: true,
            type: "POST",
            url: "message.php?balance=1",
            data: {
                key: prompt,
            },
            dataType: "json",
            success: function (results) {
                layer.close(loading);
                $("#kw-target").val("");
                layer.msg("查询成功!");
                $("#article-wrapper").append('<li class="article-title">Me：查询Key：'+prompt+'</li>');
                //$("#article-wrapper").append('<li class="article-title">Me：查询APIKEY('+prompt+')余额!</li>');
                if(results.status==1){
                    articlewrapper(randomString(16),'当前余额：'+results.total_available+'美金，已使用:'+results.total_used);
                } else{
                    articlewrapper(randomString(16),results.text);
                }
            }
        });
        return false;
    });
    function send_post() {

        var prompt = $("#kw-target").val();
        if (prompt == "") {
            layer.msg("您的输入为空!", { icon: 5 });
            return;
        }

        var loading = layer.msg('ChatGPT 最近很拥堵，请稍后...', {
            icon: 16,
            shade: 0.4,
            time:false //取消自动关闭
        });
        var message=[]
        if($("#id").val()==2){
            message =[{'role':'user','content':prompt}];
        }else{
        if($("#keep").prop("checked")){
         if(contextarray.length!=0){
             message= contextarray;
             message.push({'role':'user','content':prompt});
         }else{
           message= [{'role':'user','content':prompt}];
         }

        }else{
            message =[{'role':'user','content':prompt}];
        }
        }
        $.ajax({
            cache: true,
            type: "POST",
            url: "message.php",
            data: {
                context:JSON.stringify(message),
                key:$("#key").val(),
                id:$("#id").val(),
            },
            dataType: "json",
            success: function (results) {
                layer.close(loading);
                $("#kw-target").val("");
                layer.msg("ChatGPT 已回复...");
                if($("#id").val()==2){
                    if(results.raw_message==1){
                        $("#article-wrapper").append('<li class="article-title">Me：'+prompt+'</li>');
                        articlemapping(results.message);
                    }else{
                        $("#article-wrapper").append('<li class="article-title">Me：'+prompt+'</li>');
                        articlewrapper(randomString(16),results.message);
                    }
                } else{
                    if($("#keep").prop("checked")) {
                        contextarray.push({'role': 'user', 'content': prompt}, {
                            'role': 'assistant',
                            'content': results.raw_message
                        });
                    }
                    $("#article-wrapper").append('<li class="article-title">Me：'+prompt+'</li>');
                    articlewrapper(randomString(16),results.raw_message);
                }
            }
        });
    }

    function randomString(len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
});