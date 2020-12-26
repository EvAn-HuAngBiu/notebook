// 业务API的请求地址
// var ApiRoot = 'http://localhost:9801/';
// var ApiRoot = 'http://10.206.245.40:9801/';
// var ApiRoot = 'http://192.168.1.103:9801/';
var ApiRoot = 'https://www.rblacklist.cn/';

module.exports = {
    ApiRoot: ApiRoot,
    AuthLoginBaidu: ApiRoot + 'auth/login',
    DetailUser: ApiRoot + 'auth/detail',

    UploadStorage: ApiRoot + 'storage/upload',
    FetchStorage: ApiRoot + 'storage/fetch',
    DownloadStorage: ApiRoot + 'storage/download',
    TestUploadStorage: ApiRoot + 'storage/test-upload',
    SignatureUpload: ApiRoot + 'storage/signature',

    ListAllRecords: ApiRoot + 'record/list-all',
    ListRecords: ApiRoot + 'record/list',
    AddRecord: ApiRoot + 'record/add',
    UpdateRecord: ApiRoot + 'record/update',
    DeleteRecord: ApiRoot + 'record/delete',
    CountRecord: ApiRoot + 'record/count',

    ShareListNew: ApiRoot + 'share/new',
    ShareListHot: ApiRoot + 'share/hot',
    ShareDetail: ApiRoot + 'share/detail',
    ShareAdd: ApiRoot + 'share/add',
    ShareCount: ApiRoot + 'share/count',
    MyShare: ApiRoot + 'share/my',
    ShareSpecify: ApiRoot + 'share/specify',
    ShareDelete: ApiRoot + 'share/delete',

    ListAllTags: ApiRoot + 'tag/list',
    GetTag: ApiRoot + 'tag/get',

    CheckLike: ApiRoot + 'like/check',
    LikeRecord: ApiRoot + 'like/like',
    DislikeRecord: ApiRoot + 'like/dislike',
    TotalRecord: ApiRoot + 'like/total-like',

    CountCollect: ApiRoot + 'collect/count',
    ListCollect: ApiRoot + 'collect/list',
    CollectShare: ApiRoot + 'collect/collect',
    CancelCollect: ApiRoot + 'collect/cancel',
    CheckCollect: ApiRoot + 'collect/check',

    ListComments: ApiRoot + 'comment/list',
    BriefReplyComments: ApiRoot + 'comment/brief-reply',
    ReplyComments: ApiRoot + 'comment/reply'
};