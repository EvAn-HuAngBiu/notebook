function isJson(str) {
    if (typeof str == 'string') {
        try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
}

function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

/**
 * 封装网络请求框架
 *
 * @param {*} url 请求地址
 * @param {*} data JSON格式数据
 * @param {*} method 请求方法
 * @param {*} pack 是否展平参数，一般用于GET请求需要参数时
 */
function request(url, data = {}, method = "GET", pack = true) {
    let req_data = {};
    if (pack === true) {
        req_data = {data : data};
    } else {
        req_data = data;
    }
    return new Promise(function (resolve, reject) {
        swan.request({
            url: url,
            data: req_data,
            method: method,
            header: {
                'Content-Type': 'application/json',
                'X-NoteBook-Token': swan.getStorageSync('token'),
                'X-UserId-Token': swan.getStorageSync('userId'),
            },
            success: function (res) {
                if (res.statusCode == 200) {
                    if (res.data.code.code == 200) {
                        resolve(res.data);
                    } else if (res.data.code.code == 4011 || res.data.code.code == 401) {
                        swan.removeStorageSync('token');
                        swan.removeStorageSync('userInfo');
                        swan.removeStorageSync('userId');
                        reject("用户未登录")
                    } else {
                        if (typeof res.data.data != "undefined") {
                            reject(res.data.data.errMsg);
                        } else {
                            reject(res.data.code.message);
                        }
                    }
                } else {
                    if (res.data.data != undefined) {
                        reject(res.data.data.errMsg);
                    } else {
                        reject(res.data);
                    }
                }
            },
            fail: function (err) {
                reject(err);
            }
        });
    });
}

function showErrorToast(msg, duration=2000) {
    swan.showToast({
        title: msg,
        image: '/images/icon_error.png',
        duration: duration
    });
}

function checkUrl(url) {
    let Expression = /http(s)?/;
    let objExp = new RegExp(Expression);
    if (objExp.test(url) === true) {
        return true;
    } else {
        return false;
    }
}

function chooseImagesSync(count) {
    return new Promise(function (resolve, reject) {
        swan.chooseImage({
            count: count,
            success: res => {
                resolve(res.tempFilePaths);
            },
            fail: err => {
                reject(err.errMsg);
            }
        });
    })
}

function uploadFileSync(uploadUrl, path) {
    return new Promise(function (resolve, reject) {
        swan.uploadFile({
            url: uploadUrl,
            filePath: path,
            name: 'file',
            header: {
                'content-type': 'multipart/form-data'
            },
            success: res => {
                resolve(res.data.data.key);
            },
            fail: err => {
                reject(err);
            }
        })
    })
}

function getDateDiff(timeStr){
    let dateTimeStamp = new Date(Date.parse(timeStr.replace(/-/g, "/"))).getTime();
    let result;
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var month = day * 30;
	var now = new Date().getTime();
	var diffValue = now - dateTimeStamp;
	if(diffValue < 0){return;}
	var monthC =diffValue/month;
	var weekC =diffValue/(7*day);
	var dayC =diffValue/day;
	var hourC =diffValue/hour;
	var minC =diffValue/minute;
	if(monthC>=1){
		result="" + parseInt(monthC) + "月前";
	}
	else if(weekC>=1){
		result="" + parseInt(weekC) + "周前";
	}
	else if(dayC>=1){
		result=""+ parseInt(dayC) +"天前";
	}
	else if(hourC>=1){
		result=""+ parseInt(hourC) +"小时前";
	}
	else if(minC>=1){
		result=""+ parseInt(minC) +"分钟前";
	}else
	result="刚刚";
	return result;
}

function strIsEmpty(obj){
    if(typeof obj == "undefined" || obj == null || obj == ""){
        return true;
    }else{
        return false;
    }
}

function randomString(len) {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = chars.length;
    var pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function uploadImg2OSS(uploadUrl, path, filename, params) {
    return new Promise((resolve, reject) => {
        swan.uploadFile({
            url: uploadUrl,
            filePath: path,
            name: 'file',
            formData: {
                name: path,
                key: filename,
                policy: params.policy,
                OSSAccessKeyId: params.accessid,
                success_action_status: '200',
                signature: params.signature,
            },
            success: function() {
                resolve(filename);
            },
            fail: function(err) {
                reject(err);
            }
        })
    });
}

function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),
        "m+": (date.getMonth() + 1).toString(),
        "d+": date.getDate().toString(),
        "H+": date.getHours().toString(),
        "M+": date.getMinutes().toString(),
        "S+": date.getSeconds().toString()
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

function isYestday(theDate){
    var date = (new Date());    //当前时间
    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(); //今天凌晨
    var yestday = new Date(today - 24*3600*1000).getTime();
    return theDate.getTime() < today && yestday <= theDate.getTime();

}

function getBriefDate(timeStr) {
    let dateTimeStamp = new Date(Date.parse(timeStr.replace(/-/g, "/")));
    let curTimeStamp = new Date();
    let cy = curTimeStamp.getFullYear().toString(), dy = dateTimeStamp.getFullYear().toString();
    let cm = curTimeStamp.getMonth().toString(), cd = curTimeStamp.getDate().toString();
    let dm = dateTimeStamp.getMonth().toString(), dd = dateTimeStamp.getDate().toString();
    if (cy == dy && cm == dm && cd == dd) {
        return dateFormat("HH:MM", dateTimeStamp);
    } else if (isYestday(dateTimeStamp)) {
        return "昨天 " + dateFormat("HH:MM", dateTimeStamp);
    } else if (cy == dy) {
        return dateFormat("mm-dd HH:MM", dateTimeStamp);
    } else {
        return dateFormat("YYYY-mm-dd HH:MM", dateTimeStamp);
    }
}

module.exports = {
    isJson,
    formatTime,
    request,
    showErrorToast,
    checkUrl,
    chooseImagesSync,
    uploadFileSync,
    getDateDiff,
    strIsEmpty,
    randomString,
    uploadImg2OSS,
    getBriefDate
};