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
        currentTab: 0,
        tags: [],
        currentTag: 1,
        isShared: 0,
        title: '',
        text: '',
        rate: 0,
        urlLocalList: [],
        id: null,
        arrowColor: ["#F55E68", "#707070", "#49CAC1"],
        tagExpand: false,
        scrollIntoView: "view-0"
    },

    onLoad: function (options) {
        // 监听页面加载的生命周期函数
        let record = JSON.parse(options.record);
        let tab = options.tab;
        var that = this;
        that.setData({
            tags: app.globalData.tags,
            currentTab: tab,
            currentTag: record.tagId,
            title: record.recordTitle,
            text: record.recordText,
            rate: record.recordRate,
            urlLocalList: record.picUrl,
            id: record.recordId,
            scrollIntoView: "view-" + record.tagId
        });
    },

    onReady: function() {
        // 监听页面初次渲染完成的生命周期函数
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

    chooseImage: function (e) {
        var that = this;
        const {
            images
        } = e;
        that.setData({
            urlLocalList: images
        });
        // let promise = Promise.all(images.map((image) => {
        //     return new Promise((resolve, reject) => {
        //         swan.ai.imageAudit({
        //             image,
        //             success: (res) => {
        //                 if (res.conclusionType === 1) {
        //                     resolve(true);
        //                 } else {
        //                     reject(res.data[0].msg);
        //                 }
        //             },
        //             fail: (err) => {
        //                 console.error(err);
        //             }
        //         });
        //     })
        // }));
        // promise.then((res) => {
        //     that.setData({
        //         urlLocalList: images,
        //     });
        // }).catch((err) => {
        //     swan.showModal({
        //         title: '失败',
        //         content: '图片违规: ' + err,
        //         showCancel: false,
        //     });
        // })
    },

    changeTab: function(e) {
        this.setData({
            currentTab: e.target.dataset.tabIdx
        })
    },

    changeTag: function(e) {
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

    shareRecord: function() {
        var that = this;
        that.setData({
            isShared: that.data.isShared == 0 ? 1 : 0
        });
    },

    inputTitle: function(e) {
        this.setData({
            title: e.detail.value
        });
    },

    inputText: function(e) {
        this.setData({
            text: e.value
        });
    },

    changeRate: function(e) {
        if (e.new == e.old) {
            return;
        }
        this.setData({
            rate: parseInt(e.new)
        });
    },

    updateRecord: function() {
        var that = this;
        if (util.strIsEmpty(that.data.title)) {
            util.showErrorToast("请输入标题");
            return;
        }
        // if (util.strIsEmpty(that.data.text)) {
        //     util.showErrorToast("请输入内容");
        //     return;
        // }
        if (that.data.rate === 0) {
            util.showErrorToast("请选择评分");
            return;
        }
        swan.showLoading({
            title: '请稍候'
        });
        // 请求上传签名
        util.request(api.SignatureUpload, {}, "POST").then((sig) => {
            let filePicUrl = that.data.urlLocalList;
            let promise = Promise.all(filePicUrl.map((filePath) => {
                    if (filePath.substr(0,6) == "bdfile") {
                        // 临时文件则上传
                        let filename = util.randomString(20) + filePath.substring(filePath.lastIndexOf("."));
                        return util.uploadImg2OSS(sig.data.url, filePath, filename, sig.data);
                    } else {
                        // 非临时文件直接保存
                        let url = filePath.split("?")[0].split("/");
                        return Promise.resolve(url[url.length - 1]);
                    }
            }));
            promise.then((keyStrArr) => {
                swan.hideLoading();
                let data = {
                    recordId: that.data.id,
                    tagId : that.data.currentTag,
                    picUrl : keyStrArr,
                    recordTitle : that.data.title,
                    recordText : that.data.text,
                    recordType : that.data.currentTab,
                    recordRate: that.data.rate
                };
                util.request(api.UpdateRecord, data, "POST").then((res) => {
                    if (res.success === true) {
                        if (that.data.isShared === 1) {
                            let shareData = {tagId: that.data.currentTag, recordIds: [that.data.id]};
                            util.request(api.ShareAdd, shareData, "POST").catch((err) => {
                                console.error(err);
                            });
                        }
                        swan.navigateBack({
                            detail: 1,
                            success: () => {
                                swan.showToast({
                                    title: '修改成功'
                                });
                            }
                        });
                    } else {
                        util.showErrorToast('修改失败');
                    }
                }).catch((err) => {
                    console.error(err);
                    util.showErrorToast('修改失败');
                });
            }).catch((err) => {
                console.error(err);
                util.showErrorToast('修改失败');
            });
        }).catch((err) => {
            console.error(err);
            util.showErrorToast('修改失败');
        });
    },

    deleteImage: function(e) {
        var that = this;
        let index = e.index;
        let url = that.data.urlLocalList;
        url.splice(index, 1);
        that.setData({
            urlLocalList: url
        });
    },

    showExpand: function () {
        var that = this;
        that.setData({
            tagExpand: !that.data.tagExpand
        });
    },

    preventCloseExpand: function() {

    }
});