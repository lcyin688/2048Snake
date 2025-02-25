/**@description 麻将内事件 */
export enum MJEvent {

    //#region  需要换名字 消息单独去游戏内部处理
    // 游戏开始 
    ONSTARTGAME = "ONSTARTGAME",
    //游戏发牌
    ONS2CMAHFAPAI = "ONS2CMAHFAPAI",
    //开始换三张
    ONS2CMAHHSZNOTIFY = "ONS2CMAHHSZNOTIFY",
    //换三张结果
    ONS2CMAHHSZRESULT = "ONS2CMAHHSZRESULT",
    //开始定缺
    ONS2CMAHDINGQUENOTIFY = "ONS2CMAHDINGQUENOTIFY",
    //定缺结果
    ONS2CMAHDINGQUERESULT = "ONS2CMAHDINGQUERESULT",
    //更新玩家状态  换三张 定缺  别人(状态改变) 操作
    ONS2CMAHUPDATETABLEANDPLAYERSTATE = "ONS2CMAHUPDATETABLEANDPLAYERSTATE",
    //玩家出牌
    ONS2CMAHCHUPAI = "ONS2CMAHCHUPAI",
    //玩家摸牌
    ONS2CMAHMOPAI = "ONS2CMAHMOPAI",
    //自己可以胡碰杠的时候
    ONS2CMAHHASHPG = "ONS2CMAHHASHPG",
    //碰杠 结果
    ONS2CMAHHPGRESULT = "ONS2CMAHHPGRESULT",
    //胡的结果
    ONS2CMAHHURESULT = "ONS2CMAHHURESULT",
    //麻将流水
    ONS2CMAHLIUSHUI = "ONS2CMAHLIUSHUI",
    //小結算
    ONS2CMAHINNINGOVERDATA = "ONS2CMAHINNINGOVERDATA",
    /** 有操作的玩家 完成了一个操作  优先级高的 操作了 我这边关掉操作框 跳出 */
    ONS2CMAHHPGDONE="ONS2CMAHHPGDONE",
    //胡牌提示
    ONS2CMHUPAITISHI = "ONS2CMHUPAITISHI",
    //破产充值
    S2CMAHGAMEPOCHAN = "S2CMAHGAMEPOCHAN",
    //托管
    ONS2CMAHAUTO = "ONS2CMAHAUTO",
    //设置下一局的展示
    SETACTIVENEXTGAMEMJ="SETACTIVENEXTGAMEMJ",
    //设置邀请好友的展示
    SETACTIVEINVITEBTN="SETACTIVEINVITEBTN",
    
    //自己的 托管按键
    SETACTIVETUOGUAN = "SETACTIVETUOGUAN",

    //在牌墙中删除一张牌
    HIDEPAIQIANGCARDITEM = "HIDEPAIQIANGCARDITEM",


    //金钟罩次数
    S2CUPDATEJINZHONGZHAO="S2CUPDATEJINZHONGZHAO",
    //玩家明牌
    S2CMAHMINGPAI="S2CMAHMINGPAI",
    //麻将提示
    S2CMAHTISHI = "S2CMAHTISHI",
    //重连 
    ONRECONNECTGAMEDATA="ONRECONNECTGAMEDATA",
    //初始化牌墙数据
    INITPAIQIANG="INITPAIQIANG",

    // 设置麻将规则
    // SET_ROOM_RULE = "SET_ROOM_RULE",
    // 扣除服务费
    SHOW_PAY_TAX = "SHOW_PAY_TAX",
    // // 定庄
    // DING_ZHUANG = "DING_ZHUANG",
    //定缺完成
    // ON_MJDINGQUERESULTQUEUE = "ON_MJDINGQUERESULTQUEUE",
    // 玩家操作结果  包括吃碰杠   飞  提
    // MJOPERATE_CARDRESULT = "MJOPERATE_CARDRESULT",
    // 初始化玩家卡牌
    INIT_PLAYER_CARDS = "INIT_PLAYER_CARDS",
    // 玩家换三张
    CHANGE_PLAYER_THREE_CARD = "CHANGE_PLAYER_THREE_CARD",
    // 玩家定章
    SELECT_LACKING = "SELECT_LACKING",
    // 玩家出牌
    // PICK_OUT_CARD = "PICK_OUT_CARD",
    // 玩家碰牌
    //PENG_CARD = "PENG_CARD",
    // 玩家杠牌
    //GANG_CARD = "GANG_CARD",
    // 玩家胡牌
    HU_CARD = "HU_CARD",
    // 开始换三张
    START_CHANGE_THREE = "START_CHANGE_THREE",
    // 结束换三张
    END_CHANGE_THREE = "END_CHANGE_THREE",
    // 开始定章
    START_SELECT_LACKING = "START_SELECT_LACKING",
    // 播放游戏特效
    PLAY_GAME_EFFECT = "PLAY_GAME_EFFECT",
    // 锁牌状态
    // LOCK_CARD_STATE = "LOCK_CARD_STATE",
    // 设置碰杠胡状态
    // SET_PGH_STATE = "SET_PGH_STATE",
    // 设置出牌转盘标示
    SET_OUTCARD_DIRECTION = "SET_OUTCARD_DIRECTION",
    // 设置剩余牌数
    // SET_RESIDUE_CARDS = "SET_RESIDUE_CARDS",
    // 设置牌的点击状态
    SET_DINGQUE_CARD_STATE = "SET_DINGQUE_CARD_STATE",
    // 设置打牌胡牌提示 大多标记
    SET_OUT_HAND_HU_CARDS_STATE = "SET_OUT_HAND_HU_CARDS_STATE",
    // 隐藏所有操作
    HIDE_ALL_HANDLE_BTN = "HIDE_ALL_HANDLE_BTN",
    // 别人胡 隐藏自己所有操作 (如果这张牌自己也能胡的时候只关掉 碰杠飞提图标 )
    HIDE_HANDLE_OTHERHU = "HIDE_HANDLE_OTHERHU",
    // 隐藏定章
    HIDE_SELECT_LACKING = "HIDE_SELECT_LACKING",
    //定缺中
    // SET_DINGQUEING = "SET_DINGQUEING",
    //显影飘中
    SET_XUANPIAOING = "SET_XUANPIAOING",
    //显影 退出游戏按键
    SETQUITGAME = "SETQUITGAME",

    //获取同时拖拽牌的数量
    GET_DRAGMJCARDCOUNT = "GET_DRAGMJCARDCOUNT",
    // 重置牌局
    RESET_CARDS = "RESET_CARDS",
    // 牌局结束停止倒计时
    STOP_COUNTDOWU = "STOP_COUNTDOWU",
    // 初始化牌 和牌墙
    INITMJ = "INITMJ",
    // 设置玩家托管状态
    // SET_PLAYER_DELEGATE_STATE = "SET_PLAYER_DELEGATE_STATE",
    // 设置玩家破产状态
    // SET_PLAYER_BREAK_STATE = "SET_PLAYER_BREAK_STATE",
    //设置玩家头像破产
    // SET_SERECHARGEACTIVE = "SET_SERECHARGEACTIVE",


    // 设置手牌位置
    SET_PLAYER_HANDS_POSITION = "SET_PLAYER_HANDS_POSITION",
    // 同意拒绝解散
    SET_DISBAND_INFO = "SET_DISBAND_INFO",
    // 更新玩家头像信息
    UPDATE_PLAYER_HEAD_INFO = "UPDATE_PLAYER_HEAD_INFO",
    // 批量添加手牌
    ALL_ADD_HAND_CARDS = "ALL_ADD_HAND_CARDS",
    // 断线重连胡牌
    HU_CARD_BY_RECONNECT = "HU_CARD_BY_RECONNECT",
    // 断线重连设置出牌标记
    SET_OUTCARD_POINT_SHOW = "SET_OUTCARD_POINT_SHOW",
    CAN_CHANGE_CLICK = "CAN_CHANGE_CLICK",
    SHOW_OUT_HAND_FANSHU_TIP = "SHOW_OUT_HAND_FANSHU_TIP",
    SET_ALLCARD_DOWN = "SET_ALLCARD_DOWN",
    // SETMJPLAYEROPERATESTATE = "SETMJPLAYEROPERATESTATE",
    //获取自己手牌里是否有这一张
    SELFISHAVETHISCARDTAB = "SELFISHAVETHISCARDTAB",
    //麻将内部提示框
    SET_MJTIPS = "SET_MJTIPS",
    // 隐藏麻将提示框提示
    HIDE_MJTIPS = "HIDE_MJTIPS",
    // 麻将重连
    RECONNECT_MJGAME = "RECONNECT_MJGAME",

    // 麻将小结算 游戏结束
    // MJSINGLERESULT = "MJSINGLERESULT",
    // 麻将小结算重连 游戏结束
    // ONRECOENTMJJIESUNRESULTREAL = "ONRECOENTMJJIESUNRESULTREAL",
    // 过手才能胡
    SHOWGUOSHOUBUHU = "SHOWGUOSHOUBUHU",
    // 改变牌型不能杠
    //MJXL_CANNOTGANG = "MJXL_CANNOTGANG"
    //停止所有携程动画
    // STOP_COROUTINETWEENANI = "STOP_COROUTINETWEENANI",
    //玩家摸牌
    // ON_MJMOPAI = "ON_MJMOPAI",
    // // 麻将大结算
    // ON_MJBIGRESULT = "ON_MJBIGRESULT",
    //宜宾麻将自己摸牌
    ON_YIBINMJSELFMOPAI = "ON_YIBINMJSELFMOPAI",
    //设置麻将胡牌提示
    // SET_MJHUTIP = "SET_MJHUTIP",
    // //设置胡牌提示 自己14张的时候
    // SET_INITCARDSHOWHUTIP = "SET_INITCARDSHOWHUTIP",
    // // 设置胡牌提示显示
    // SET_HU_CARDS_STATE = "SET_HU_CARDS_STATE",
    //设置房间规则数据
    SET_ROOMRULEDATA = "SET_ROOMRULEDATA",
    //设置房卡游戏玩法
    // SET_GAMERULESTR = "SET_GAMERULESTR",
    //点击过
    CLICK_PASS = "CLICK_PASS",
    //点击明牌
    CLICK_MINGPAI = "CLICK_MINGPAI",
    //点击碰
    CLICK_PENG = "CLICK_PENG",
    //点击杠
    CLICK_GANG = "CLICK_GANG",
    //点击胡
    CLICK_HU = "CLICK_HU",
    //点击飞
    CLICK_FEI = "CLICK_FEI",
    //点击提
    CLICK_TI = "CLICK_TI",
    //点击躺
    CLICK_TANG = "CLICK_TANG",
    //破封
    CLICK_POFENG = "CLICK_POFENG",


    //绵阳 麻将 点击躺 确认
    //CLICK_MIANYANGTANG ="CLICK_MIANYANGTANG",
    // 初始化绵阳躺牌界面
    SHOW_TANG_TIP = "SHOW_TANG_TIP",

    // 设置躺牌界面
    SHOW_TANG_TIP_VIEW = "SHOW_TANG_TIP_VIEW",

    //刷新危牌标记
    SET_WEIFLAG = "SET_WEIFLAG",


    // //播放打牌声音
    MJPLAYSOUNDCARD = "MJPLAYSOUNDCARD",

    //小结算全隐藏主要是小结算阶段重连
    RESETMJBANLANCE = "RESETMJBANLANCE",

    //宜宾麻将 定义红中是癞子
    SETLAIZI = "SETLAIZI",

    // XIAJIAOTISHI = "XIAJIAOTISHI",
    //打牌后的提示
    // OUTCARDHPTS = "OUTCARDHPTS",

    // //道具使用后换牌
    // MJPROPCHANGECARDS = "ONMJPROPCHANGECARDS",

    //道具使用后换牌
    S2CMAHPROPRESULT = "S2CMAHPROPRESULT",

    //飘金币动画
    PIAOGOLDANI = "PIAOGOLDANI",

    //获取自己放在手牌位置的牌
    GETSELFMOCARDID = "GETSELFMOCARDID",
    //刷新麻将道具
    REFRESHPROPMJ = "REFRESHPROPMJ",


    //主动请求重连
    ONAPPLICATIONFOCUS = "ONAPPLICATIONFOCUS",

    //打牌返回的错误码
    MJDPERR = "ERR_CODE_msg.C2S_MjDaPai",

    //托管
    TRUSTEESHIP_EFFECT = "TRUSTEESHIP_EFFECT",

    //托管错误
    MjTuoguanErr = "MjTuoguanErr",
}
