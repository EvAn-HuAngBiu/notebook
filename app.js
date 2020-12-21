const user = require("./util/user.js");
const util = require("./util/util.js");
const api = require("./config/api.js");
/**
 * @file app.js
 * @author swan
 */

/* globals swan */

App({
    onLaunch(options) {
        var that = this;
        if (swan.canIUse('getUpdateManager')) {
            const updateManager = swan.getUpdateManager()
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    updateManager.onUpdateReady(function () {
                        swan.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启应用？',
                            success: function (res) {
                                if (res.confirm) {
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    })
                    updateManager.onUpdateFailed(function () {
                        swan.showModal({
                            title: '已经有新版本了哟~',
                            content: '新版本已经上线啦，请您删除当前小程序，重新搜索打开哟'
                        })
                    })
                }
            })
        }
        user.checkLogin().then(() => {
            this.globalData.hasLogin = true;
            // 配置回调接口
            if (this.loginInfoCallback) {
                this.loginInfoCallback(true)
            }
        }).catch(() => {
            that.globalData.hasLogin = false;
            swan.removeStorage({
                key: 'userId',
            });
            swan.removeStorage({
                key: 'token',
            });
            if (this.loginInfoCallback) {
                this.loginInfoCallback(false)
            }
        });
        // 读取缓存在本地的tags
        let storedTags = swan.getStorageSync("tags");
        if (storedTags) {
            that.globalData.tags = storedTags;
        } else {
            util.request(api.ListAllTags).then((res) => {
                that.globalData.tags = res.data.tags;
                swan.setStorage({
                    key: 'tags',
                    data: res.data.tags
                });
                // 触发回调加载
                if (this.tagListCallback) {
                    this.tagListCallback(this.globalData.tags)
                }
            }).catch((err) => {
                console.error(err);
                if (this.tagListCallback) {
                    this.tagListCallback([])
                }
            })
        }
    },
    onShow(options) {
        // do something when show
        var that = this;
        if (that.globalData.hasLogin === true) {
            util.request(api.TotalRecord).then((res) => {
                if (res.success === true) {
                    that.globalData.newLikeCount = res.data.new > 99 ? 99 : res.data.new
                    if (res.data.new > 0) {
                        swan.setTabBarBadge({
                            index: 2,
                            text: res.data.new
                        });
                    }
                }
            });
        }
    },
    onHide() {
        // do something when hide
    },
    globalData: {
        hasLogin: false,
        newLikeCount: 0,
        tags: []
    }
});