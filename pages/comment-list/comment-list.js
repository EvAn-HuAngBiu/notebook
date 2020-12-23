const api = require("../../config/api.js");
const util = require("../../util/util.js");
const app = getApp();

Page({
    data: {
        shareIdx: -1,
        share: {},
        redCnt: 0,
        blackCnt: 0,
        blueCnt: 0,
        showDetail: false,
        detailBackgrounColor: ["#F55E68", "#707070", "#49CAC1"],
        currentSort: 0,
        comments: {},
        hasLogin: false,
        scrollHeight: 0
    },
    onLoad: function (options) {
        // 监听页面加载的生命周期函数
        var previous = getCurrentPages();
        var previousData = previous[previous.length - 2].data;
        var that = this;
        that.setData({
            shareIdx: options.shareIdx,
            share: previousData.shareList[options.shareIdx],
            redCnt: previousData.redCnts[options.shareIdx],
            blackCnt: previousData.blackCnts[options.shareIdx],
            blueCnt: previousData.blueCnts[options.shareIdx],
            hasLogin: previousData.hasLogin
        });
    },
    onReady: function() {
        // 监听页面初次渲染完成的生命周期函数
        var that = this;
        swan.getSystemInfo({
            success: res => {
                setTimeout(() => {
                    var query = swan.createSelectorQuery();
                query.select('#empty-total-block').boundingClientRect()
                .exec(eres => {
                    let topHeight = eres[0].height;
                    let windowHeight = res.windowHeight;
                    let windowWidth = res.windowWidth;
                    let bottomHeight = 166 / 750 * windowWidth;
                    that.setData({
                        scrollHeight: windowHeight - topHeight - bottomHeight
                    });
                })
                }, 300);
            },
            fail: err => {
                console.log(err);
            }
        });
    },
    onShow: function() {
        // 监听页面显示的生命周期函数
        var that = this;
        util.request(api.ListComments, {shareId: that.data.share.shareDo.shareId, sortType: that.data.currentSort}, "GET", false).then((res) => {
            let comments = res.data.comments;
            comments.forEach(c => {
                c.comment.commentDo.addTime = util.getDateDiff(c.comment.commentDo.addTime);
            })
            that.setData({
                comments: comments
            })
        }).catch((err) => {
            console.error(err);
        })
    },
    onHide: function() {
        // 监听页面隐藏的生命周期函数
    },
    onUnload: function() {
        // 监听页面卸载的生命周期函数
    },
    onPullDownRefresh: function() {
        // 监听用户下拉动作
    },
    onReachBottom: function() {
        // 页面上拉触底事件的处理函数
    },
    onShareAppMessage: function () {
        // 用户点击右上角转发
    },

    showShareDetail: function (e) {
        var that = this;
        var type = e.currentTarget.dataset.openType;
        var red = [],
            black = [],
            blue = [];
        that.data.share.recordDo.forEach(record => {
            if (record.recordType === 0) {
                red.push(record);
            } else if (record.recordType === 1) {
                black.push(record);
            } else {
                blue.push(record);
            }
        })
        that.setData({
            showDetail: true,
            detailShareList: [red, black, blue],
            detailCurrentType: type,
        });
    },

    hideDetail: function () {
        var that = this;
        if (that.data.showDetail === true) {
            that.setData({
                showDetail: false,
            });
        }
    },

    previewImg: function (e) {
        var that = this;
        var shareIdx = e.target.dataset.typeIdx;
        var recordIdx = e.target.dataset.recordIdx;
        var urls = that.data.detailShareList[shareIdx][recordIdx].picUrl;
        swan.previewImage({
            urls: urls
        })
    },

    // failLike: function (e) {
    //     // 这里不使用百度的like功能，故跳转到bind:fail方法执行逻辑
    //     if (app.globalData.hasLogin === false) {
    //         util.showErrorToast('请先登录', 1500);
    //         return;
    //     }
    //     var that = this;
    //     var idx = e.currentTarget.dataset.idx;
    //     var shareList = that.data.shareList;
    //     shareList[idx].like = !shareList[idx].like;
    //     shareList[idx].shareDo.likeCnt += (shareList[idx].like ? 1 : -1);
    //     util.request(shareList[idx].like ? api.LikeRecord : api.DislikeRecord, parseInt(shareList[idx].shareDo.shareId), "POST").then((res) => {
    //         if (res.success === true) {
    //             that.setData({
    //                 shareList: shareList
    //             });
    //         } else {
    //             util.showErrorToast('操作失败');
    //             console.error(res);
    //         }
    //     }).catch((err) => {
    //         util.showErrorToast('操作失败');
    //         console.error(err);
    //     })

    // },

    // failCollect: function (e) {
    //     // 这里不使用百度的like功能，故跳转到bind:fail方法执行逻辑
    //     if (app.globalData.hasLogin === false) {
    //         util.showErrorToast('请先登录', 1500);
    //         return;
    //     }
    //     var that = this;
    //     var idx = e.currentTarget.dataset.idx;
    //     var shareList = that.data.shareList;
    //     shareList[idx].collect = !shareList[idx].collect;
    //     shareList[idx].shareDo.collectCnt += (shareList[idx].collect ? 1 : -1);
    //     util.request(shareList[idx].collect ? api.CollectShare : api.CancelCollect, parseInt(shareList[idx].shareDo.shareId), "POST").then((res) => {
    //         if (res.success === true) {
    //             that.setData({
    //                 shareList: shareList
    //             });
    //         } else {
    //             util.showErrorToast('操作失败');
    //             console.error(res);
    //         }
    //     }).catch((err) => {
    //         util.showErrorToast('操作失败');
    //         console.error(err);
    //     })
    // },

    sortRecord: function() {
        var that = this;
        // let items = [];
        // that.data.sortLabel.forEach(s => {
        //     items.push(s.name);
        // });
        // swan.showActionSheet({
        //     itemList: items,
        //     itemColor: '#000000',
        //     success: function (res) {
        //         if (that.data.currentSort != that.data.sortLabel[res.tapIndex].id) {
        //             that.setData({
        //                 currentSort: that.data.sortLabel[res.tapIndex].id
        //             });
        //             that.onShow();
        //         }
        //     }
        // });

        that.setData({
            currentSort: that.data.currentSort == 0 ? 1 : 0
        });
        that.onShow();
    }
});