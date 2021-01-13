const api = require("../../config/api.js");
const util = require("../../util/util.js");

let page = 1;
let size = 10;
Page({
    data: {
        notifies: {},
    },
    onInit: function () {
        util.request(api.ListNotifies).then((res) => {
            if (res.success) {
                res.data.notifies.forEach(n => {
                    n.addTime = util.getBriefDate(n.addTime);
                })
                this.setData({
                    notifies: res.data.notifies
                });
            } else {
                console.log(res);
            }
        }).catch((err) => {
            console.log(err);
        })
    },
    onLoad: function () {
        // 监听页面加载的生命周期函数
    },
    onReady: function () {
        // 监听页面初次渲染完成的生命周期函数
    },
    onShow: function () {
        // 监听页面显示的生命周期函数
        page = 1;
        size = 10;
    },
    onHide: function () {
        // 监听页面隐藏的生命周期函数
    },
    onUnload: function () {
        // 监听页面卸载的生命周期函数
    },
    onPullDownRefresh: function () {
        // 监听用户下拉动作
    },
    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
    },
    onShareAppMessage: function () {
        // 用户点击右上角转发
    },

    showCommentDetail: function (e) {
        var that = this;
        let idx = e.currentTarget.dataset.idx;
        let notifyId = that.data.notifies[idx].notifyId;
        let shareId = that.data.notifies[idx].shareId;
        if (that.data.notifies[idx].readType == false) {
            util.request(api.UncheckNewNotify, notifyId, "POST").then((res) => {
                if (res.success) {
                    that.setData({
                        ['notifies[' + idx + '].readType']: true
                    });
                } else {
                    console.log(res.code);
                }
            }).catch(err => {
                console.log(err);
            });
        }
        swan.navigateTo({
            url: '../comment-list/comment-list?type=1&shareId=' + shareId
        });
    }
});