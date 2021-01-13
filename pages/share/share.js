const app = getApp()
const api = require("../../config/api.js");
const util = require("../../util/util.js");

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
        records: [],
        currentTab: 0,
        tags: [],
        currentTag: 1,
        arrowColor: ["#F55E68", "#707070", "#49CAC1"],
        backgroudColor: ["#FAF5F5", "#F5F5F5", "#F6FDFB"],
        scrollIntoView: "view-0",
        tagBarBackground: "",
        tagExpand: false,
        totalChooseCnt: 0,
        recordChooseStatus: {},
    },
    onLoad: function (option) {
        // 监听页面加载的生命周期函数
        var that = this;
        let tags;
        if (app.globalData.tags.length === 0) {
            app.tagListCallback = (res) => {
                tags = [].concat(res);
            }
        } else {
            tags = [].concat(app.globalData.tags);
        }
        that.setData({
            tags: tags,
            currentTag: typeof option.tag === "undefined" ? 1 : (option.tag === "0" ? "1" : option.tag),
            scrollIntoView: typeof option.tag === "undefined" ? "view-1" : "view-" + (option.tag == 0 ? 1 : option.tag)
        });
    },
    onReady: function() {
        // 监听页面初次渲染完成的生命周期函数
    },
    onShow: function() {
        var that = this;
        // 监听页面显示的生命周期函数
        util.request(api.ListAllRecords,
            {tagId: that.data.currentTag,
                recordType: that.data.currentTab}, "GET", false).then((res) => {
            res.data.result.forEach(r => {
                r.modifyTime = util.getDateDiff(r.modifyTime);
            });
            that.setData({
                records: res.data.result,
            });
        }).catch((err) => {
            console.log(err);
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

    onPageScroll: function(e) {
        if (e.scrollTop > 8) {
            this.setData({
                tagBarBackground: "#ffffff"
            })
        } else {
            this.setData({
                tagBarBackground: "#F9F9F9"
            })
        }
    },

    swiperNav: function (e) {
        this.setData({
            currentTab: e.target.dataset.tabIdx
        });
        this.onShow();
    },

    switchTag: function (e) {
        var that = this;
        var tagId = e.target.dataset.tagIdx;
        if (that.data.currentTag === tagId) {
            if (that.data.tagExpand === true) {
                that.setData({
                    tagExpand: false
                });
            }
            return false;
        }
        if (that.data.totalChooseCnt !== 0) {
            util.showErrorToast('不能跨类别分享');
            return;
        }
        that.setData({
            currentTag: tagId,
            scrollIntoView: "view-" + tagId,
            recordChooseStatus: {}
        });
        if (that.data.tagExpand === true) {
            that.setData({
                tagExpand: false
            });
        }
        this.onShow();
    },

    showExpand: function() {
        var that = this;
        that.setData({
            tagExpand: !that.data.tagExpand,
        });
    },

    checkChange: function(e) {
        var that = this;
        let currentRecordId = e.currentTarget.dataset.idx;
        let checkedArr = e.detail.value;
        let currentArr = that.data.recordChooseStatus;
        let totalCnt = that.data.totalChooseCnt;
        if (checkedArr.length === 0) {
            // 移除元素
            currentArr[currentRecordId] = false;
            totalCnt -= 1;
        } else {
            currentArr[currentRecordId] = true;
            totalCnt += 1;
        }
        that.setData({
            recordChooseStatus: currentArr,
            totalChooseCnt: totalCnt
        });
    },

    submitShare: function() {
        var that = this;
        let tagId = that.data.currentTag;
        let status = that.data.recordChooseStatus;
        let shareArr = [];
        for (let s in status) {
            if (status[s] === true) {
                shareArr.push(s);
                status[s] = false;
            }
        }

        util.request(api.ShareAdd, {"tagId" : tagId, "recordIds" : shareArr}, "POST").then((res) => {
            if (res.success === true) {
                that.setData({
                    recordChooseStatus: status
                });
                swan.navigateBack({
                    delta: 1,
                    success: () => {
                        let page = getCurrentPages();
                        page[0].onInit();
                        swan.showToast({
                            title: '分享成功',
                            icon: 'none'
                        });
                    }
                });
            } else {
                console.error(res);
            }
        }).catch((err) => {
            console.error(err);
        })
    },

    navigateToAdd: function() {

    }
});