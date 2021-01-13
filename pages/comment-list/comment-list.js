const api = require("../../config/api.js");
const util = require("../../util/util.js");
const app = getApp();
let hasLogin = false;
Page({
    data: {
        share: {},
        redCnt: 0,
        blackCnt: 0,
        blueCnt: 0,
        showDetail: false,
        detailBackgrounColor: ["#F55E68", "#707070", "#49CAC1"],
        currentSort: 0,
        comments: {},
        scrollHeight: 0,
        showExpandComments: [],
        replyType: 0,
        replyPlacehold: '写评论',
        focusSendInput: false,
        currentParentId: 0,
        commentInput: '',
        commentInputValue: '',
        comingType: 0
    },

    onLoad: function (options) {
        var that = this;
        // 监听页面加载的生命周期函数
        if (options.type == 0) {
            var previous = getCurrentPages();
            var previousData = previous[previous.length - 2].data;
            hasLogin = previousData.hasLogin,
            that.setData({
                share: previousData.shareList[options.shareIdx],
                redCnt: previousData.redCnts[options.shareIdx],
                blackCnt: previousData.blackCnts[options.shareIdx],
                blueCnt: previousData.blueCnts[options.shareIdx],
            });
            this.listComments();
        } else {
            let shareId = options.shareId;
            util.request(api.ShareSpecify, {shareId: shareId}, "GET", false).then((res) => {
                if (res.success) {
                    let redCnt = 0, blackCnt = 0, blueCnt = 0;
                    res.data.share.recordDo.forEach(r => {
                        if (r.recordType == 0) {
                            ++redCnt;
                        } else if (r.recordType == 1) {
                            ++blackCnt;
                        } else {
                            ++blueCnt;
                        }
                    })
                    res.data.share.shareDo.modifyTime = util.getDateDiff(res.data.share.shareDo.modifyTime);
                    hasLogin = app.globalData.hasLogin,
                    that.setData({
                        share: res.data.share,
                        redCnt: redCnt,
                        blackCnt: blackCnt,
                        blueCnt: blueCnt,
                    });
                    this.listComments();
                }
            })
        }
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

    failLike: function () {
        // 这里不使用百度的like功能，故跳转到bind:fail方法执行逻辑
        if (app.globalData.hasLogin === false) {
            util.showErrorToast('请先登录', 1500);
            return;
        }
        var that = this;
        let share = that.data.share;
        share.like = !share.like;
        share.shareDo.likeCnt += (share.like ? 1 : -1);
        util.request(share.like ? api.LikeRecord : api.DislikeRecord, parseInt(share.shareDo.shareId), "POST").then((res) => {
            if (res.success === true) {
                that.setData({
                    share: share
                });
            } else {
                util.showErrorToast('操作失败');
                console.error(res);
            }
        }).catch((err) => {
            util.showErrorToast('操作失败');
            console.error(err);
        })
    },

    failCollect: function () {
        // 这里不使用百度的like功能，故跳转到bind:fail方法执行逻辑
        if (app.globalData.hasLogin === false) {
            util.showErrorToast('请先登录', 1500);
            return;
        }
        var that = this;
        var share = that.data.share;
        share.collect = !share.collect;
        share.shareDo.collectCnt += (share.collect ? 1 : -1);
        util.request(share.collect ? api.CollectShare : api.CancelCollect, parseInt(share.shareDo.shareId), "POST").then((res) => {
            if (res.success === true) {
                that.setData({
                    share: share
                });
            } else {
                util.showErrorToast('操作失败');
                console.error(res);
            }
        }).catch((err) => {
            util.showErrorToast('操作失败');
            console.error(err);
        })
    },

    sortRecord: function() {
        var that = this;
        that.setData({
            currentSort: that.data.currentSort == 0 ? 1 : 0
        });
        that.listComments();
    },

    showAllComments: function(e) {
        var that = this;
        let idx = e.currentTarget.dataset.showIdx;
        let arr = that.data.showExpandComments;
        arr[idx] = false;
        that.setData({
            showExpandComments: arr
        });
    },

    replyMessage: function(e) {
        var that = this;
        let idx = e.currentTarget.dataset.idx;
        that.setData({
            focusSendInput: true,
            replyPlacehold: '回复 ' + that.data.comments[idx].comment.userDo.nickname,
            replyType: 1,
            currentParentId: that.data.comments[idx].comment.commentDo.commentId
        });
    },

    replySubMessage: function(e) {
        var that = this;
        let idx = e.currentTarget.dataset.idx;
        let sidx = e.currentTarget.dataset.subidx;
        that.setData({
            focusSendInput: true,
            replyPlacehold: '回复 ' + that.data.comments[idx].subCommentList[sidx].userDo.nickname,
            replyType: 1,
            currentParentId: that.data.comments[idx].subCommentList[sidx].commentDo.commentId
        });
    },

    blurCommentInput: function() {
        var that = this;
        that.setData({
            focusSendInput: false,
            replyPlacehold: '写评论',
            commentInputValue: '',
        })
    },

    finishInputComment: function(e) {
        var that = this;
        that.setData({
            commentInput: e.detail.value
        })
    },

    submitReply: function() {
        var that = this;
        let shareId = that.data.share.shareDo.shareId;
        let parentId = that.data.currentParentId;
        let content = that.data.commentInput;
        let commentType = that.data.replyType;
        if (util.strIsEmpty(content)) {
            util.showErrorToast("评论内容为空");
            return;
        }
        util.request(api.ReplyComments, {commentType: commentType, commentContent: content, shareId: shareId, parentCommentId: parentId}, "POST").then(() => {
            swan.showToast({
                title: '评论成功',
                icon: 'none',
                success: () => {
                    that.setData({
                        replyType: 0
                    })
                    this.onShow();
                }
            })
        }).catch((err) => {
            console.error(err);
        })
    },

    listComments: function() {
        var that = this;
        util.request(api.ListComments, {shareId: that.data.share.shareDo.shareId, sortType: that.data.currentSort}, "GET", false).then((res) => {
            let comments = res.data.comments;
            let showExpandComments = new Array(comments.length);
            comments.forEach(c => {
                c.comment.commentDo.addTime = util.getDateDiff(c.comment.commentDo.addTime);
            })
            for (let i = 0; i < comments.length; i++) {
                showExpandComments[i] = true;
            }
            that.setData({
                comments: comments,
                showExpandComments: showExpandComments
            })
        }).catch((err) => {
            console.error(err);
        })
    }
});