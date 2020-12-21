const util = require('../util/util.js')
const api = require('../config/api.js')

function checkSession() {
    return new Promise(function (resolve, reject) {
        swan.checkSession({
            success: function() {
                resolve(true);
            },
            fail: function() {
                reject(false);
            }
        })
    });
}

function login() {
    return new Promise(function (resolve, reject) {
        swan.login({
            success: function (res) {
                if (res.code) {
                    resolve(res);
                } else {
                    reject(res);
                }
            },
            fail: function (err) {
                reject(err);
            }
        })
    })
}

function baiduLogin(userInfo) {
    return new Promise(function (resolve, reject) {
        return login().then((res) => {
            util.request(api.AuthLoginBaidu, {code : res.code, bdUserInfo : userInfo}, 'POST', false).then(res => {
                if (res.success === true) {
                    // 存储用户信息
                    swan.setStorageSync('userInfo', userInfo);
                    swan.setStorageSync('token', res.data.token);
                    swan.setStorageSync('userId', res.data.userId)
                    resolve(res);
                } else {
                    reject(res);
                }
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        })
    });
}

function checkLogin() {
    return new Promise(function (resolve, reject) {
        if (swan.getStorageSync('userInfo') && swan.getStorageSync('token')) {
            checkSession().then(() => {
                resolve(true);
            }).catch(() => {
                reject(false);
            })
        } else {
            reject(false);
        }
    });
}

module.exports = {
    baiduLogin,
    checkLogin,
};