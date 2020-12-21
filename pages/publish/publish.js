const app = getApp()
const api = require("../../config/api.js");
const user = require("../../util/user.js");
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
        currentTab: 0,
        tags: [],
        currentTag: 1,
        isShared: 0,
        title: '',
        text: '',
        rate: 0,
        urlLocalList: [],
        arrowColor: ["#F55E68", "#707070", "#49CAC1"],
        tagExpand: false,
        scrollIntoView: "view-0",
    },

    onLoad: function (option) {
        // 监听页面加载的生命周期函数
        var that = this;
        that.setData({
            tags: app.globalData.tags,
            currentTab: typeof option.tab === "undefined" ? 0 : option.tab,
            currentTag: typeof option.tag === "undefined" ? 1 : (option.tag === "0" ? "1" : option.tag),
            scrollIntoView: typeof option.tag === "undefined" ? "view-1" : "view-" + (option.tag == "0" ? "1" : option.tag)
        });
    },

    onReady: function () {
        // 监听页面初次渲染完成的生命周期函数
    },

    onShow: function () {
        // 监听页面显示的生命周期函数
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

    chooseImage: function (e) {
        var that = this;
        const {
            images
        } = e;
        that.setData({
            urlLocalList: images
        });
    },

    changeTab: function (e) {
        this.setData({
            currentTab: e.target.dataset.tabIdx
        })
    },

    changeTag: function (e) {
        var that = this;
        let idx = e.target.dataset.tagIdx;
        if (idx == that.data.currentTag) {
            return;
        }
        that.setData({
            currentTag: idx,
            scrollIntoView: "view-" + idx
        })
    },

    shareRecord: function () {
        var that = this;
        that.setData({
            isShared: that.data.isShared == 0 ? 1 : 0
        });
    },

    inputTitle: function (e) {
        this.setData({
            title: e.detail.value
        });
    },

    inputText: function (e) {
        this.setData({
            text: e.value
        });
    },

    changeRate: function (e) {
        this.setData({
            rate: parseInt(e.new)
        });
    },

    addRecord: function () {
        var that = this;
        if (util.strIsEmpty(that.data.title)) {
            util.showErrorToast("请输入标题");
            return;
        }
        if (that.data.rate === 0) {
            util.showErrorToast("请选择评分");
            return;
        }
        swan.showLoading({
            title: '请稍候'
        });
        // // 内容审查
        // let titleReviewPromise = new Promise((resolve, reject) => {
        //     swan.ai.textReview({
        //         content: that.data.title,
        //         success: (res) => {
        //             if (res.result.spam !== 0) {
        //                 reject("标题存在违禁内容");
        //             } else {
        //                 resolve(true);
        //             }
        //         },
        //         fail: (err) => {
        //             console.error(err);
        //             reject("审核失败");
        //         }
        //     });
        // })
        // let textReivewPromise = new Promise((resolve, reject) => {
        //     if (!util.strIsEmpty(that.data.text)) {
        //         swan.ai.textReview({
        //             content: that.data.text,
        //             success: (res) => {
        //                 if (res.result.spam !== 0) {
        //                     reject("发布内容存在违禁内容");
        //                 } else {
        //                     resolve(true);
        //                 }
        //             },
        //             fail: (err) => {
        //                 console.error(err);
        //                 reject("审核失败");
        //             }
        //         });
        //     } else {
        //         resolve(true);
        //     }
        // });
        // // 图像审查
        // let imageReviewPromises = [];
        // for (let filePath in that.data.urlLocalList) {
        //     imageReviewPromises.push(new Promise((resolve, reject) => {
        //         swan.ai.imageAudit({
        //             image: filePath,
        //             success: (res) => {
        //                 if (res.conclusionType === 1) {
        //                     resolve(true);
        //                 } else {
        //                     reject("图片审核失败" + res.data[0].msg);
        //                 }
        //             },
        //             fail: (err) => {
        //                 console.error(err);
        //                 reject("审核失败");
        //             }
        //         });
        //     }));
        // }

        // Promise.all([textReivewPromise, titleReviewPromise].concat(imageReviewPromises)).then(() => {
            util.request(api.SignatureUpload, {}, 'POST').then((sig) => {
                let filePicUrl = that.data.urlLocalList;
                let promise = Promise.all(filePicUrl.map((filePath) => {
                    let filename = util.randomString(20) + filePath.substring(filePath.lastIndexOf("."));
                    return util.uploadImg2OSS(sig.data.url, filePath, filename, sig.data);
                }));
                promise.then((res) => {
                    swan.hideLoading();
                    let data = {
                        tagId: that.data.currentTag,
                        picUrl: res,
                        recordTitle: that.data.title,
                        recordText: that.data.text,
                        recordType: that.data.currentTab,
                        recordRate: that.data.rate
                    };
                    util.request(api.AddRecord, data, "POST").then((res) => {
                        if (res.success === true) {
                            if (that.data.isShared === 1) {
                                let shareData = {
                                    tagId: that.data.currentTag,
                                    recordIds: [res.data.recordId]
                                };
                                util.request(api.ShareAdd, shareData, "POST").catch((err) => {
                                    console.error(err);
                                });
                            }
                            swan.navigateBack({
                                detail: 1,
                                success: () => {
                                    let page = getCurrentPages();
                                    page[0].setData({
                                        currentTag: that.data.currentTag,
                                        scrollIntoView: "view-" + that.data.currentTag,
                                    });
                                    swan.showToast({
                                        title: '添加成功'
                                    });
                                }
                            });
                        } else {
                            util.showErrorToast('添加失败');
                        }
                    }).catch((err) => {
                        console.error(err);
                        util.showErrorToast('添加失败');
                    });
                }).catch((err) => {
                    console.error(err);
                    util.showErrorToast('添加失败');
                });
            }).catch((err) => {
                console.error(err);
                util.showErrorToast("校验失败");
            })
        // }).catch((err) => {
        //     swan.hideLoading();
        //     swan.showModal({
        //         title: '发布审核失败',
        //         content: err
        //     });
        // })
    },

    showExpand: function () {
        var that = this;
        that.setData({
            tagExpand: !that.data.tagExpand
        });
    },

    preventCloseExpand: function () {

    }
});