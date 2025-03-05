export namespace GameConsts {
    //碰撞类型
    export enum ItemColliderType {
        ui = 0,
        food = 1,
        ai = 2,
        player = 3,
        playerBody = 4,
        
        wallUp = 7,
        wallDown = 8,
        wallLeft = 9,
        wallRight = 10,
        /**加速道具 */
        speedPropTag = 11,
        /** 翻倍道具 */
        doublePropTag = 12,

    }

    export class ItemBlockType {
        idx :number
        score:number
        spName:string
        colorStr:string
        foodSize:number
    }
    export const overCountTime = 600
    /** 重生复活CD */
    export const relifeCDTime = 5

    export const snakeConfig = {
        [0]:{idx:0,score:2   ,spName:"icon_0"      ,colorStr:"#ff5400" ,foodSize:50},
        [1]:{idx:1,score:4   ,spName:"icon_0"      ,colorStr:"#0047ff" ,foodSize:55},

        [2]:{idx:2,score:8   ,spName:"icon_1"      ,colorStr:"#00c100" ,foodSize:60},
        [3]:{idx:3,score:16  ,spName:"icon_2"      ,colorStr:"#f84400" ,foodSize:65},
        [4]:{idx:4,score:32  ,spName:"icon_3"      ,colorStr:"#fda100" ,foodSize:70},
        [5]:{idx:5,score:64  ,spName:"icon_4"      ,colorStr:"#009eff" ,foodSize:75},

        [6]:{idx:6,score:128 ,spName:"icon_5"      ,colorStr:"#a307cd" ,foodSize:80},
        [7]:{idx:7,score:256 ,spName:"icon_5"      ,colorStr:"#a307cd" ,foodSize:85},

        [8]:{idx:8,score:512 ,spName:"icon_6"      ,colorStr:"#fa47c0" ,foodSize:90},
        [9]:{idx:9,score:1024,spName:"icon_6"      ,colorStr:"#fa47c0" ,foodSize:100},


    }

    export enum PlayStateType {
        state = 0,
        play = 1,
        died = 2,
    }

    export enum FoodStateType {
        state = 0,
        died = 1,
        //玩家或者AI 身上的激活中
        player=2
    }
    /** 排行榜数据 */
    export class ItemRank {
        //** 玩家名字 */
        playerName:string
        /** 玩家积分 */
        score:number
        isSelf:boolean
    }

    /** 游戏中排行榜UI */
    export class GameItemRank {
        node:cc.Node
        playerName:cc.Label
        score:cc.Label
    }

}