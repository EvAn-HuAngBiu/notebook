const app = getApp()
const api = require("../../config/api.js");
const util = require("../../util/util.js");
const user = require("../../util/user.js");
var startPoint;
let currentPage = 1;
let currentSize = 10;
let windowHeight = '';
let windowWidth = '';

Page({
    data: {
        tabs: [{
            name: 0,
            label: '红榜'
        }, {
            name: 1,
            label: '黑榜'
        }, {
            name: 2,
            label: '种草'
        }],
        currentTab: 0,
        tags: [],
        currentTag: 0,
        records: [],
        // total: 0,
        // currentPage: 1,
        // currentSize: 10,
        sortLabel: [{
            name: '最高评价',
            id: 0
        }, {
            name: '最低评价',
            id: 1
        }, {
            name: '最新',
            id: 2
        }, {
            name: '最早',
            id: 3
        }],
        currentSort: 2,
        tagExpand: false,
        arrowColor: ["#F55E68", "#707070", "#49CAC1"],
        backgroudColor: ["#FAF5F5", "#F5F5F5", "#F6FDFB"],
        gradientTabBackground: [
            "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, #FAF5F5 100%)",
            "linear-gradient(90deg, rgba(245, 245, 245, 0) 0%, #F5F5F5 100%)",
            "linear-gradient(90deg, rgba(246, 253, 251, 0) 0%, #F6FDFB 100%)"
        ],
        scrollIntoView: "view-0",
        tagBarBackground: "",
        showDetail: false,
        currentDetailRecord: -1,
        login: false,
        showRecordView: [],
        bottomDis: 28,
        rightDis: 28,
        // windowHeight: '',
        // windowWidth: '',
        showGuide: false,
        skipGuideCheck: true
    },

    onInit: function () {
        var that = this;
        var current = that.data.currentTab;
        // 请求具体内容
        let data = {
            tagId: that.data.currentTag,
            recordType: current,
            page: 1,
            size: currentSize,
            sortType: that.data.currentSort
        };
        util.request(api.ListRecords, data, "GET", false).then((res) => {
            res.data.recordList.forEach(r => {
                r.modifyTime = util.getDateDiff(r.modifyTime);
            });
            that.setData({
                records: res.data.recordList,
                // total: res.data.total
            });
        });
        user.checkLogin().then(() => {
            that.setData({
                login: true
            });
        }).catch(() => {
            that.setData({
                login: false
            });
        });
    },
    onLoad: function () {
        // 监听页面加载的生命周期函数
        var that = this;
        if (app.globalData.tags.length === 0) {
            app.tagListCallback = (res) => {
                let tags = [].concat(res);
                tags.unshift({
                    tagId: 0,
                    tagName: "所有"
                });
                that.setData({
                    tags: tags
                });
            }
        } else {
            let tags = [].concat(app.globalData.tags);
            tags.unshift({
                tagId: 0,
                tagName: "所有"
            });
            that.setData({
                tags: tags
            });
        }
        // 获取登录状态
        // if (app.globalData.hasLogin === false) {
        //     app.loginInfoCallback = (res) => {
        //         that.setData({
        //             login: res
        //         })
        //     }
        // } else {
        //     that.setData({
        //         login: app.globalData.hasLogin
        //     });
        // }

        swan.getSystemInfo({
            success: res => {
                // that.setData({
                //     windowHeight: res.windowHeight,
                //     windowWidth: res.windowWidth,
                // });
                windowHeight = res.windowHeight;
                windowWidth = res.windowWidth;
            },
            fail: err => {
                console.log(err);
            }
        });
        swan.getStorage({
            key: 'skipGuide',
            success: (data) => {
                if (data.data != true) {
                    that.setData({
                        showGuide: true
                    });
                }
            },
            fail: (err) => {
                console.error(err);
            }
        })
    },
    onReady: function () {
        // 监听页面初次渲染完成的生命周期函数
    },
    onShow: function () {
        // 监听页面显示的生命周期函数
        var that = this;
        // 读取当前Tab类型并设置背景颜色
        var current = that.data.currentTab;
        if (current === 0) {
            swan.setBackgroundColor({
                backgroundColor: '#FAF5F5'
            });
        } else if (current == 1) {
            swan.setBackgroundColor({
                backgroundColor: '#F5F5F5'
            });
        } else {
            swan.setBackgroundColor({
                backgroundColor: '#F6FDFB'
            });
        }
        if (that.data.login == false && app.globalData.hasLogin === true) {
            this.onInit();
        }
        // 动态设置添加按钮位置和页码
        that.setData({
            rightDis: 28,
            bottomDis: 28,
        });
        currentPage = 1;
        if (that.data.login == false && app.globalData.login == true) {
            this.onInit();
        }
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
        var that = this;
        // that.setData({
        //     currentPage: that.data.currentPage + 1
        // });
        currentPage = currentPage + 1;

        let data = {
            tagId: that.data.currentTag,
            recordType: that.data.currentTab,
            page: currentPage,
            size: that.data.currentSize,
            sortType: that.data.currentSort
        };
        util.request(api.ListRecords, data, "GET", false).then((res) => {
            if (res.data.recordList.length === 0) {
                swan.showToast({
                    'title': '没有更多内容了',
                    'icon': 'none'
                });
                // that.setData({
                //     currentPage: that.data.currentPage - 1
                // });
                currentPage = currentPage - 1;
                return;
            }
            res.data.recordList.forEach(r => {
                r.modifyTime = util.getDateDiff(r.modifyTime);
            });
            that.setData({
                records: that.data.records.concat(res.data.recordList),
                // total: res.data.total
            });
        })
    },

    onShareAppMessage: function () {
        // 用户点击右上角转发
    },
    onPageScroll: function (e) {
        var that = this;
        if (e.scrollTop > 8) {
            that.setData({
                tagBarBackground: "#ffffff"
            })
        } else {
            that.setData({
                tagBarBackground: that.data.backgroudColor[that.data.currentTab]
            })
        }
    },

    swiperNav: function (e) {
        var that = this;
        let curTab = e.target.dataset.current;
        that.setData({
            currentTab: curTab,
            tagBarBackground: that.data.backgroudColor[curTab]
        });
        currentPage = 1;
        that.onShow();
        that.onInit();
    },

    switchTag: function (e) {
        var that = this;
        var tagId = e.target.dataset.current;
        if (that.data.currentTag === tagId) {
            return false;
        }

        // let hasRed = false,
        //     hasBlack = false,
        //     hasBlue = false;
        // util.request(api.ListRecords, {
        //     tagId: tagId,
        //     page: that.data.currentPage,
        //     size: that.data.currentSize,
        //     sortType: that.data.currentSort
        // }, "GET", false).then((res) => {
        //     res.data.recordList.forEach(r => {
        //         r.modifyTime = util.getDateDiff(util.strIsEmpty(r.modifyTime) ? r.addTime : r.modifyTime);
        //         if (r.recordType === 0) {
        //             hasRed = true;
        //         } else if (r.recordType === 1) {
        //             hasBlack = true;
        //         } else {
        //             hasBlue = true;
        //         }
        //     });
        //     that.setData({
        //         records: res.data.recordList,
        //         total: res.data.total,
        //         currentTag: tagId,
        //         scrollIntoView: "view-" + tagId,
        //         currentPage: 1,
        //         showRecordView: [hasRed, hasBlack, hasBlue],
        //     });
        // }).catch((err) => {
        //     console.log(err);
        // });
        if (that.data.login === true) {
            util.request(api.ListRecords, {
                tagId: tagId,
                recordType: that.data.currentTab,
                page: 1,
                size: that.data.currentSize,
                sortType: that.data.currentSort
            }, "GET", false).then((res) => {
                res.data.recordList.forEach(r => {
                    r.modifyTime = util.getDateDiff(r.modifyTime);
                });
                that.setData({
                    records: res.data.recordList,
                    // total: res.data.total,
                    currentTag: tagId,
                    scrollIntoView: "view-" + tagId,
                });
                currentPage = 1;
            })
        }

        if (that.data.tagExpand === true) {
            that.setData({
                tagExpand: false
            });
        }
    },

    previewImg: function () {
        var that = this;
        var idx = that.data.currentDetailRecord;
        var urls = that.data.records[idx].picUrl;
        swan.previewImage({
            urls: urls
        });
    },

    deleteRecord: function (e) {
        var that = this;
        var idx = e.currentTarget.dataset.idx;
        swan.showModal({
            title: '删除记录',
            content: '您确定要删除这条记录吗?',
            success: (res) => {
                if (res.confirm) {
                    util.request(api.DeleteRecord, parseInt(that.data.records[idx].recordId), "POST").then((res) => {
                        if (res.success === true) {
                            swan.showToast({
                                title: '删除成功',
                                duration: 1500
                            });
                            var records = that.data.records;
                            records.splice(idx, 1);
                            that.setData({
                                records: records
                            });
                            if (that.data.showDetail === true) {
                                that.setData({
                                    showDetail: false,
                                });
                                swan.showTabBar();
                            }
                        } else {
                            util.showErrorToast('删除失败');
                            console.error(res);
                        }
                    }).catch((err) => {
                        util.showErrorToast('删除失败');
                        console.error(err);
                    })
                }
            },
            fail: (err) => {
                console.log(err);
            }
        });
    },

    addRecord: function () {
        var that = this;
        if (that.data.login == false) {
            swan.switchTab({
                url: '/pages/mine/mine',
                success: () => {
                    util.showErrorToast("请登录后添加");
                }
            });
            return;
        }
        swan.navigateTo({
            url: '../publish/publish?tag=' + that.data.currentTag + '&tab=' +
                that.data.currentTab
        });
    },

    sortRecord: function () {
        var that = this;
        let items = [];
        that.data.sortLabel.forEach(s => {
            items.push(s.name);
        });
        swan.showActionSheet({
            itemList: items,
            itemColor: '#000000',
            success: function (res) {
                if (that.data.currentSort != that.data.sortLabel[res.tapIndex].id) {
                    that.setData({
                        currentSort: that.data.sortLabel[res.tapIndex].id
                    });
                    that.onInit();
                }
            }
        });
    },

    editRecord: function (e) {
        var that = this;
        var idx = e.currentTarget.dataset.idx;
        let record = JSON.stringify(that.data.records[idx]);
        let tab = that.data.currentTab;
        let tag = that.data.currentTag;
        swan.navigateTo({
            url: '../edit/edit?record=' + encodeURIComponent(record) + "&tab=" + tab + "&tag=" + tag
        });
    },

    showExpand: function () {
        var that = this;
        that.setData({
            tagExpand: !that.data.tagExpand
        });
    },

    preventCloseExpand: function () {

    },

    showDetail: function (e) {
        var that = this;
        if (that.data.showDetail === false) {
            that.setData({
                showDetail: true,
                currentDetailRecord: e.currentTarget.dataset.idx
            });
            swan.hideTabBar({});
        }
    },

    hideDetail: function () {
        var that = this;
        if (that.data.showDetail === true) {
            that.setData({
                showDetail: false
            });
            swan.showTabBar({});
        }
    },

    preventTapEvent: function () {

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

    skipGuide: function () {
        var that = this;
        that.setData({
            showGuide: false
        })
        swan.setStorage({
            key: 'skipGuide',
            data: true
        });
    },

    guideBeginUse: function () {
        var that = this;
        that.setData({
            showGuide: false
        });
        swan.setStorage({
            key: 'skipGuide',
            data: that.data.skipGuideCheck
        });
    },

    changeSkipCheckbox: function (e) {
        var that = this;
        var val = e.detail.value;
        if (val.length === 0) {
            that.setData({
                skipGuideCheck: false
            })
        } else {
            that.setData({
                skipGuideCheck: true
            })
        }
    }
});