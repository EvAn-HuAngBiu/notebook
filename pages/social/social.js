const api = require("../../config/api.js");
const util = require("../../util/util.js");
const app = getApp();

var startPoint;
let curPage = 1;
let curSize = 10;
let windowHeight = '';
let windowWidth = '';
let firstShowFlag = false;
Page({
    data: {
        tabs: [{
            label: '最新',
            name: 0
        }, {
            label: '最热',
            name: 1
        }],
        currentTab: 0,
        // curPage: 1,
        // curSize: 10,
        shareList: [],
        // likeList: [],
        // collectList: [],
        tags: [],
        currentTag: 0,
        showDetail: false,
        detailShareList: [],
        currentDetailType: 0,
        currentDetailShare: {},
        redCnts: [],
        blackCnts: [],
        blueCnts: [],
        tagExpand: false,
        arrowColor: "#F55E68",
        tagBarBackground: "#F9F9F9",
        currentDetailIdx: -1,
        scrollIntoView: "view-0",
        detailBackgrounColor: ["#F55E68", "#707070", "#49CAC1"],
        bottomDis: 28,
        rightDis: 28,
        // windowHeight: '',
        // windowWidth: '',
        totalCommentCount: 26,
        currentUser: '',
        hasLogin: false,
        showBriefCommentPublish: false,
        currentBriefCommentShareId: 0,
        currentBriefCommentShareIdx: -1,
        commentInput: '',
    },
    onInit: function() {
        var that = this;
        var url = that.data.currentTab === 0 ? api.ShareListNew : api.ShareListHot;
        firstShowFlag = true;
        util.request(url, {
            tagId: that.data.currentTag,
            page: 1,
            size: curSize
        }, "GET", false).then((res) => {
            let shareIds = [];
            let redCnts = [],
                blackCnts = [],
                blueCnts = [];
            res.data.shareList.forEach(s => {
                let red = 0,
                    black = 0,
                    blue = 0;
                s.shareDo.modifyTime = util.getDateDiff(util.strIsEmpty(s.shareDo.modifyTime) ? s.shareDo.modifyTime : s.shareDo.addTime);
                s.recordDo.forEach(r => {
                    if (r.recordType == 0) {
                        ++red;
                    } else if (r.recordType == 1) {
                        ++black;
                    } else {
                        ++blue;
                    }
                })
                shareIds.push(s.shareDo.shareId);
                redCnts.push(red);
                blackCnts.push(black);
                blueCnts.push(blue);
            });
            this.setData({
                shareList: res.data.shareList,
                redCnts: redCnts,
                blackCnts: blackCnts,
                blueCnts: blueCnts,
            });
        }).catch((err) => {
            console.log(err);
        });

    },
    onLoad: function () {
        var that = this;
        let tags = [].concat(app.globalData.tags);
        tags.unshift({
            tagId: 0,
            tagName: "所有"
        });
        that.setData({
            tags: tags,
        });
        swan.getStorage({
            key: 'userInfo',
            success: res => {
                that.setData({
                    currentUser: res.data,
                })
            }
        });
        swan.getSystemInfo({
            success: res => {
                windowHeight = res.windowHeight;
                windowWidth = res.windowWidth;
            },
            fail: err => {
                console.log(err);
            }
        });
    },
    onReady: function () {
        // 监听页面初次渲染完成的生命周期函数
    },
    onShow: function () {
        var that = this;
        let currentUser = that.data.currentUser;
        if (that.data.currentUser == '') {
            currentUser = swan.getStorageSync('userInfo').data;
        }
        curPage = 1;
        that.setData({
            hasLogin: app.globalData.hasLogin,
            currentUser: currentUser
        });
    },
    onHide: function () {
        // 监听页面隐藏的生命周期函数
    },
    onUnload: function () {
        // 监听页面卸载的生命周期函数
    },
    onPullDownRefresh: function () {
        // 监听用户下拉动作
        swan.showNavigationBarLoading();
        let promise = new Promise((resolve) => {
            this.onInit();
            resolve(true);
        });
        promise.then(() => {
            swan.pageScrollTo({
                scrollTop: 0,
                success: () => {
                    swan.stopPullDownRefresh();
                    swan.hideNavigationBarLoading();
                }
            });
        })
    },
    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
        var that = this;
        if (that.data.showDetail === false) {
            var url = that.data.currentTab === 0 ? api.ShareListNew : api.ShareListHot;
            let page = curPage + 1;
            util.request(url, {
                tagId: that.data.currentTag,
                page: page,
                size: curSize
            }, "GET", false).then((res) => {
                if (res.data.shareList.length == 0) {
                    swan.showToast({
                        'title': '没有新内容了',
                        'icon': 'none'
                    });
                    return;
                }
                let shareIds = [];
                let redCnts = [],
                    blackCnts = [],
                    blueCnts = [];
                res.data.shareList.forEach(s => {
                    let red = 0,
                        black = 0,
                        blue = 0;
                    s.shareDo.modifyTime = util.getDateDiff(util.strIsEmpty(s.shareDo.modifyTime) ? s.shareDo.modifyTime : s.shareDo.addTime);
                    s.recordDo.forEach(r => {
                        // for (let i = 0; i < r.picUrl.length; i++) {
                        //     r.picUrl[i] = api.FetchStorage + "/" + r.picUrl[i];
                        // }
                        if (r.recordType == 0) {
                            ++red;
                        } else if (r.recordType == 1) {
                            ++black;
                        } else {
                            ++blue;
                        }
                    })
                    shareIds.push(s.shareDo.shareId);
                    redCnts.push(red);
                    blackCnts.push(black);
                    blueCnts.push(blue);
                });
                curPage = page;
                this.setData({
                    shareList: that.data.shareList.concat(res.data.shareList),
                    redCnts: that.data.redCnts.concat(redCnts),
                    blackCnts: that.data.blackCnts.concat(blackCnts),
                    blueCnts: that.data.blueCnts.concat(blueCnts),
                });
                // util.request(api.CheckLike, shareIds, "POST").then((innerRes) => {
                //     this.setData({
                //         likeList: that.data.likeList.concat(innerRes.data.checked),
                //     });
                // }).catch((err) => {
                //     console.log(err);
                // });
                // util.request(api.CheckCollect, shareIds, "POST").then((innerRes) => {
                //     this.setData({
                //         collectList: that.data.collectList.concat(innerRes.data.checked)
                //     })
                // }).catch((err) => {
                //     console.log(err);
                // });
            }).catch((err) => {
                console.log(err);
            });
        }
    },
    onShareAppMessage: function () {
        // 用户点击右上角转发
    },

    swiperNav: function (e) {
        if (e.type === "tap") {
            curPage = 1;
            this.setData({
                currentTab: e.target.dataset.current,
            });
            this.onInit();
        } else {
            this.setData({
                currentTab: e.detail.current
            });
        }
    },

    switchTag: function (e) {
        var that = this;
        var tagId = e.target.dataset.current;
        if (that.data.currentTag === tagId) {
            return false;
        }
        that.setData({
            currentTag: tagId,
            scrollIntoView: "view-" + tagId,
        });
        if (that.data.tagExpand === true) {
            that.setData({
                tagExpand: false
            });
        }
        this.onInit();
    },

    failLike: function (e) {
        // 这里不使用百度的like功能，故跳转到bind:fail方法执行逻辑
        if (app.globalData.hasLogin === false) {
            util.showErrorToast('请先登录', 1500);
            return;
        }
        var that = this;
        var idx = e.currentTarget.dataset.idx;
        var shareList = that.data.shareList;
        shareList[idx].like = !shareList[idx].like;
        shareList[idx].shareDo.likeCnt += (shareList[idx].like ? 1 : -1);
        util.request(shareList[idx].like ? api.LikeRecord : api.DislikeRecord, parseInt(shareList[idx].shareDo.shareId), "POST").then((res) => {
            if (res.success === true) {
                that.setData({
                    shareList: shareList
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

    failCollect: function (e) {
        // 这里不使用百度的like功能，故跳转到bind:fail方法执行逻辑
        if (app.globalData.hasLogin === false) {
            util.showErrorToast('请先登录', 1500);
            return;
        }
        var that = this;
        var idx = e.currentTarget.dataset.idx;
        var shareList = that.data.shareList;
        shareList[idx].collect = !shareList[idx].collect;
        shareList[idx].shareDo.collectCnt += (shareList[idx].collect ? 1 : -1);
        util.request(shareList[idx].collect ? api.CollectShare : api.CancelCollect, parseInt(shareList[idx].shareDo.shareId), "POST").then((res) => {
            if (res.success === true) {
                that.setData({
                    shareList: shareList
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

    showShareDetail: function (e) {
        var that = this;
        var idx = e.currentTarget.dataset.shareIdx;
        var type = e.currentTarget.dataset.openType;
        var red = [],
            black = [],
            blue = [];
        that.data.shareList[idx].recordDo.forEach(record => {
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
            currentDetailShare: that.data.shareList[idx],
            detailShareList: [red, black, blue],
            currentDetailIdx: idx,
            detailCurrentType: type,
        });
        swan.hideTabBar();
    },

    hideDetail: function () {
        var that = this;
        if (that.data.showDetail === true) {
            that.setData({
                showDetail: false,
            });
            swan.showTabBar();
        }
    },

    insideEvnetHandler: function () {
        // 在详细信息框内点击事件一律不处理，在此处接受事件并中断冒泡
        return;
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

    nologin: function () {
        util.showErrorToast('请先登录', 1500);
    },

    shareRecord: function (e) {
        if (app.globalData.hasLogin === false) {
            util.showErrorToast("请先登录", 1500);
            return;
        }
        var that = this;
        let user = swan.getStorageSync('userInfo');
        let idx = e.currentTarget.dataset.idx;
        console.log(that.data.shareList[idx].shareDo.shareId);
        swan.openShare({
            title: '红黑记录本|体验、记录、分享生活',
            content: user.nickName + '正在分享ta的记录榜单，快来围观吧',
            path: '/pages/social/social?idx=' + that.data.shareList[idx].shareDo.shareId,
            success: () => {
                swan.showToast({
                    title: '分享成功',
                    icon: 'none'
                });
            },
        })
    },

    showExpand: function () {
        var that = this;
        that.setData({
            tagExpand: !that.data.tagExpand
        });
    },

    preventCloseExpand: function () {

    },

    addShare: function () {
        if (app.globalData.hasLogin === false) {
            swan.switchTab({
                url: '/pages/mine/mine',
                success: () => {
                    util.showErrorToast("请登录后添加");
                }
            });
            return;
        }
        var that = this;
        swan.navigateTo({
            url: '../share/share?tag=' + that.data.currentTag
        });
    },

    buttonStart: function (e) {
        startPoint = e.touches[0];
    },

    buttonMove: function (e) {
        var endPoint = e.touches[e.touches.length - 1]
        var translateX = endPoint.clientX - startPoint.clientX
        var translateY = endPoint.clientY - startPoint.clientY
        startPoint = endPoint
        var bottomDis = this.data.bottomDis - translateY
        var rightDis = this.data.rightDis - translateX
        //判断是移动否超出屏幕
        if (rightDis + 50 >= windowWidth) {
            rightDis = windowWidth - 50;
        }
        if (rightDis <= 0) {
            rightDis = 0;
        }
        if (bottomDis <= 0) {
            bottomDis = 0
        }
        if (bottomDis + 50 >= windowHeight - 80) {
            bottomDis = windowHeight - 80 - 50;
        }
        this.setData({
            bottomDis: bottomDis,
            rightDis: rightDis
        })
    },

    showAllComments: function(e) {
        let shareIdx = e.currentTarget.dataset.shareIdx;
        swan.navigateTo({
            url: '/pages/comment-list/comment-list?type=0&shareIdx=' + shareIdx
        });
    },

    hideBriefCommentPublish: function() {
        var that = this;
        if (that.data.showBriefCommentPublish === true) {
            that.setData({
                showBriefCommentPublish: false,
            });
        }
    },

    focusBriefCommentInput: function(e) {
        var that = this;
        if (that.data.hasLogin === false) {
            swan.switchTab({
                url: '/pages/mine/mine',
                success: () => {
                    util.showErrorToast("请登录后添加");
                }
            });
            return;
        }
        if (that.data.showBriefCommentPublish === false) {
            that.setData({
                showBriefCommentPublish: true,
                currentBriefCommentShareId: e.currentTarget.dataset.shareId,
                currentBriefCommentShareIdx: e.currentTarget.dataset.shareIdx
            });
        }
    },

    finishInputComment: function(e) {
        var that = this;
        that.setData({
            commentInput: e.detail.value
        })
    },

    submitComment: function() {
        var that = this;
        let content = that.data.commentInput;
        if (util.strIsEmpty(content)) {
            that.setData({
                showBriefCommentPublish: false,
            });
            util.showErrorToast("评论内容为空");
            return;
        }
        let shareId = that.data.currentBriefCommentShareId;
        let shareIdx = that.data.currentBriefCommentShareIdx;
        util.request(api.BriefReplyComments, {shareId: shareId, content: content}, "POST").then(() => {
            swan.showToast({
                title: '评论成功',
                icon: 'none'
            })
            that.setData({
                showBriefCommentPublish: false,
            });
            let shareList = that.data.shareList;
            shareList[shareIdx].totalComments += 1;
            if (that.data.shareList[shareIdx].comments.length < 2) {
                shareList[shareIdx].comments.push({commentDo : {commentContent: content, shareId: shareId}, userDo: {nickname: that.data.currentUser.nickName}});
            }
            that.setData({
                shareList: shareList
            });
        }).catch((err) => {
            console.error(err);
        })
    }
});