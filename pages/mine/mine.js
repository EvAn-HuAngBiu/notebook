const app = getApp()
const api = require("../../config/api.js");
const user = require("../../util/user.js");
const util = require("../../util/util.js");

Page({
    data: {
        user: {nickName: "", gender: 0, avatarUrl: ""},
        login: false,
        totalPublish: 0,
        gotLiked: 0,
        currentTab: 0,
        totalShare: 0,
        totalCollect: 0,
        shares: [],
        redCnts: [],
        blackCnts: [],
        blueCnts: [],
        curPage: 1,
        curSize: 10,
        showSticky: false,
        showDetail: false,
        likeList: [],
        collectList: [],
        detailBackgrounColor: ["#F55E68", "#707070", "#49CAC1"],
        currentDetailShare: [],
        newLikeCount: 0,
        statusHeight: 0,
        navHeight: 0,
        userInfoCardTop: 0,
        hasNewNotify: false
    },
    onLoad: function () {
        // 监听页面加载的生命周期函数
        swan.removeTabBarBadge({
            index: 2
        });
        let capsule = swan.getMenuButtonBoundingClientRect();
        swan.getSystemInfo({
            success: res => {
                let navHeight = capsule.height + (capsule.top - res.statusBarHeight) * 2;
                let userInfoCardTop = 122 / 750 * res.windowWidth + navHeight + res.statusBarHeight;
                this.setData({
                    statusHeight: res.statusBarHeight,
                    navHeight,
                    userInfoCardTop
                })
            }
        });
    },
    onReady: function() {
        // 监听页面初次渲染完成的生命周期函数
    },
    onShow: function() {
        // 监听页面显示的生命周期函数
        var that = this;
        that.setData({
            currentTab: 0
        });
        user.checkLogin().then(() => {
            let savedUserInfo = swan.getStorageSync('userInfo');
            this.setData({
                login: true,
                user: savedUserInfo,
                curPage: 1,
                curSize: 10
            });
            util.request(api.MineIndex).then((res) => {
                if (res.success === true) {
                    that.setData({
                        totalPublish: res.data.recordCount,
                        gotLiked: res.data.totalRecord,
                        newLikeCount: app.globalData.newLikeCount + res.data.newRecord > 99 ? 99 : app.globalData.newLikeCount + res.data.newRecord,
                        totalCollect: res.data.collectCount,
                        totalShare: res.data.shareCount,
                        hasNewNotify: res.data.notifyCheck
                    })
                    this.listShares();
                } else {
                    console.log(res);
                }
            }).catch(err => {
                console.log(err);
            })
            // util.request(api.CountRecord, {}, "POST").then((res) => {
            //     if (res.success === true) {
            //         that.setData({
            //             totalPublish: res.data.count
            //         })
            //     }
            // });
            // util.request(api.TotalRecord).then((res) => {
            //     if (res.success === true) {
            //         that.setData({
            //             gotLiked: res.data.total,
            //             newLikeCount: app.globalData.newLikeCount + res.data.new > 99 ? 99 : app.globalData.newLikeCount + res.data.new
            //         })
            //     }
            // });
            // util.request(api.CountCollect).then((res) => {
            //     if (res.success === true) {
            //         that.setData({
            //             totalCollect: res.data.collectCount
            //         })
            //     }
            // });
            // util.request(api.ShareCount).then((res) => {
            //     if (res.success === true) {
            //         that.setData({
            //             totalShare: res.data.total
            //         })
            //     }
            // });
            // util.request(api.CheckNewNotify).then((res) => {
            //     if (res.success === true) {
            //         that.setData({
            //             hasNewNotify: res.data.check
            //         })
            //     }
            // })
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
        var that = this;
        that.setData({
            curPage: that.data.curPage + 1
        });
        var tab = that.data.currentTab;
        if (tab == 0) {
            this.listShares();
        } else {
            this.listCollects();
        }
    },
    onShareAppMessage: function () {
        // 用户点击右上角转发
    },
    onPageScroll: function () {
        let query = swan.createSelectorQuery();
        var that = this;
        query.select('#center-block').boundingClientRect((rect) => {
            if (rect.top === 0 && that.data.showSticky !== true) {
                this.setData({
                    showSticky: true
                })
            } else if (rect.top !== 0 && that.data.showSticky !== false) {
                this.setData({
                    showSticky: false
                })
            }
        }).exec();
    },

    listShares: function() {
        var that = this;
        util.request(api.MyShare, {page: that.data.curPage, size: that.data.curSize}, "GET", false).then((res) => {
            if (res.data.shareList.length == 0) {
                swan.showToast({
                    'title': '没有更多内容了',
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
                s.shareDo.modifyTime = util.getDateDiff(s.shareDo.modifyTime);
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
            // util.request(api.CheckLike, shareIds, "POST").then((innerRes) => {
            //     if (that.data.curPage === 1) {
            //         this.setData({
            //             likeList: innerRes.data.checked,
            //         });
            //     } else {
            //         this.setData({
            //             likeList: that.data.likeList.concat(innerRes.data.checked),
            //         });
            //     }
            // }).catch((err) => {
            //     console.log(err);
            // });
            // util.request(api.CheckCollect, shareIds, "POST").then((innerRes) => {
            //     if (that.data.curPage === 1) {
            //         this.setData({
            //             collectList: innerRes.data.checked,
            //         });
            //     } else {
            //         this.setData({
            //             collectList: that.data.collectList.concat(innerRes.data.checked),
            //         });
            //     }
            // }).catch((err) => {
            //     console.log(err);
            // });
            if (that.data.curPage === 1) {
                this.setData({
                    shares: res.data.shareList,
                    redCnts: redCnts,
                    blackCnts: blackCnts,
                    blueCnts: blueCnts,
                });
            } else {
                this.setData({
                    shares: that.data.shares.concat(res.data.shareList),
                    redCnts: that.data.redCnts.concat(redCnts),
                    blackCnts: that.data.blackCnts.concat(blackCnts),
                    blueCnts: that.data.blueCnts.concat(blueCnts),
                });
            }
        })
    },

    listCollects: function() {
        var that = this;
        util.request(api.ListCollect, {page: that.data.curPage, size: that.data.curSize}, "GET", false).then((res) => {
            if (res.data.shareList.length == 0) {
                swan.showToast({
                    'title': '没有更多内容了',
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
                s.shareDo.modifyTime = util.getDateDiff(s.shareDo.modifyTime);
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
            // util.request(api.CheckLike, shareIds, "POST").then((innerRes) => {
            //     if (that.data.curPage === 1) {
            //         this.setData({
            //             likeList: innerRes.data.checked,
            //         });
            //     } else {
            //         this.setData({
            //             likeList: that.data.likeList.concat(innerRes.data.checked),
            //         });
            //     }
            // }).catch((err) => {
            //     console.log(err);
            // });
            // util.request(api.CheckCollect, shareIds, "POST").then((innerRes) => {
            //     if (that.data.curPage === 1) {
            //         this.setData({
            //             collectList: innerRes.data.checked,
            //         });
            //     } else {
            //         this.setData({
            //             collectList: that.data.collectList.concat(innerRes.data.checked),
            //         });
            //     }
            // }).catch((err) => {
            //     console.log(err);
            // });
            if (that.data.curPage === 1) {
                this.setData({
                    shares: res.data.shareList,
                    redCnts: redCnts,
                    blackCnts: blackCnts,
                    blueCnts: blueCnts,
                });
            } else {
                this.setData({
                    shares: that.data.shares.concat(res.data.shareList),
                    redCnts: that.data.redCnts.concat(redCnts),
                    blackCnts: that.data.blackCnts.concat(blackCnts),
                    blueCnts: that.data.blueCnts.concat(blueCnts),
                });
            }
        })
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
                    login: true,
                    user: e.detail.userInfo
                })
                this.onShow();
            }, (err) => {
                app.globalData.hasLogin = false;
                util.showErrorToast('登录失败');
                console.error(err);
            })
        });
    },

    swiperNav: function (e) {
        var that = this;
        let tab = e.currentTarget.dataset.current;
        if (that.data.currentTab === tab) {
            return;
        }
        that.setData({
            currentTab: tab,
            curPage: 1
        });
        if (tab == 0) {
            this.listShares();
        } else {
            this.listCollects();
        }
    },

    shareRecord: function(e) {
        var idx = e.currentTarget.dataset.idx;
        swan.openShare({
            title: '红黑记录本|体验、记录、分享生活',
            content: user.nickname + '正在分享ta的记录榜单，快来围观吧',
            path: '/pages/social/social?idx=' + idx,
            success: () => {
                swan.showToast({
                    title: '分享成功',
                    icon: 'none'
                });
            },
        })
    },

    showShareDetail: function (e) {
        var that = this;
        var idx = e.currentTarget.dataset.shareIdx;
        var type = e.currentTarget.dataset.openType;
        var red = [], black = [], blue = [];
        that.data.shares[idx].recordDo.forEach(record => {
            record['tagId'] = that.data.shares[idx].shareDo.tagId;
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
            currentDetailShare: that.data.shares[idx],
            detailShareList: [red, black, blue],
            currentDetailIdx: idx,
            detailCurrentType: type
        });
        swan.hideTabBar();
    },

    hideDetail: function () {
        var that = this;
        if (that.data.showDetail === true) {
            that.setData({
                showDetail: false
            });
            swan.showTabBar({
            });
        }
    },

    failLike: function (e) {
        // 这里不使用百度的like功能，故跳转到bind:fail方法执行逻辑
        var that = this;
        var idx = e.currentTarget.dataset.idx;
        var shareList = that.data.shares;
        shareList[idx].like = !shareList[idx].like;
        shareList[idx].shareDo.likeCnt += (shareList[idx].like ? 1 : -1);
        util.request(shareList[idx].like ? api.LikeRecord : api.DislikeRecord, parseInt(shareList[idx].shareDo.shareId), "POST").then((res) => {
            if (res.success === true) {
                that.setData({
                    shares: shareList,
                    gotLiked: that.data.gotLiked + (shareList[idx].like ? 1 : -1)
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
        var that = this;
        var idx = e.currentTarget.dataset.idx;
        var shareList = that.data.shares;
        shareList[idx].collect = !shareList[idx].collect;
        shareList[idx].shareDo.collectCnt += (shareList[idx].collect ? 1 : -1);
        util.request(shareList[idx].collect ? api.CollectShare : api.CancelCollect, parseInt(shareList[idx].shareDo.shareId), "POST").then((res) => {
            if (res.success === true) {
                that.setData({
                    shares: shareList,
                    totalCollect: that.data.totalCollect + (shareList[idx].collect ? 1 : -1)
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

    previewImg: function (e) {
        var that = this;
        var shareIdx = e.target.dataset.typeIdx;
        var recordIdx = e.target.dataset.recordIdx;
        var urls = that.data.detailShareList[shareIdx][recordIdx].picUrl;
        swan.previewImage({
            urls: urls
        })
    },

    delShare: function (e) {
        var that = this;
        swan.showModal({
            title: '删除分享',
            content: '您确定要删除这条分享吗？',
            success: (res) => {
                if (res.confirm) {
                    let idx = e.currentTarget.dataset.idx;
                    util.request(api.ShareDelete, that.data.shares[idx].shareDo.shareId, "POST").then((res) => {
                        if (res.success === true) {
                            swan.showToast({
                                title: '删除成功',
                                duration: 1500
                            });
                            let shares = that.data.shares;
                            shares.splice(idx, 1);
                            let redCnts = that.data.redCnts;
                            redCnts.splice(idx, 1);
                            let blackCnts = that.data.blackCnts;
                            blackCnts.splice(idx, 1);
                            let blueCnts = that.data.blueCnts;
                            blueCnts.splice(idx, 1);
                            let likeList = that.data.likeList;
                            likeList.splice(idx, 1);
                            let collectList = that.data.collectList;
                            collectList.splice(idx, 1);
                            that.setData({
                                shares: shares,
                                redCnts: redCnts,
                                blackCnts: blackCnts,
                                blueCnts: blueCnts,
                                likeList: likeList,
                                collectList: collectList
                            });
                            if (that.data.showDetail === true) {
                                that.setData({
                                    showDetail: false
                                });
                                swan.showTabBar();
                            }
                        }
                    })
                }
            },
            fail: (err) => {
                console.log(err);
            }
        });
    },

    showNotify: function() {
        swan.navigateTo({
            url: '../notify/notify'
        });
    }
});