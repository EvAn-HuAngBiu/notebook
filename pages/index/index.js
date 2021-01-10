/**
 * @file index.js
 * @author swan
 */
const app = getApp()
const user = require("../../util/user.js");
const util = require("../../util/util.js");

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        msg: "1"
    },

    onLoad() {
        // 监听页面加载的生命周期函数
    },

    onShow: function () {
        user.checkLogin().then(() => {
            let savedUserInfo = swan.getStorageSync('userInfo');
            this.setData({
                hasUserInfo: true,
                userInfo: savedUserInfo
            });
        }, () => {
            app.globalData.hasLogin = false;
            swan.removeStorage({
                key: 'userId',
            });
            swan.removeStorage({
                key: 'token',
            });
        });
    },

    getUserInfo: function (e) {
        // 缺少用户信息，登录失败
        if (e.detail.userInfo == undefined) {
            app.globalData.hasLogin = false;
            util.showErrorToast('登录失败');
            return;
        }

        user.checkLogin().catch(() => {
            user.baiduLogin(e.detail.userInfo).then(() => {
                app.globalData.hasLogin = true;
                swan.showToast({
                    title: '登录成功',
                    icon: 'success'
                });
                this.setData({
                    hasUserInfo: true,
                    userInfo: e.detail.userInfo
                })
            }, () => {
                app.globalData.hasLogin = false;
                util.showErrorToast('登录失败');
            })
        });
    },

    testShare: function() {
        swan.navigateTo({
            url: '/paths/social/social?idx=16'
        });
    }
})