import { AudioClipName } from "../core/sound/AudioClipName";
import AudioManger from "../core/sound/AudioManger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {



    protected onLoad(): void {
        // 设置游戏帧率
        cc.game.setFrameRate(60);
        // 关闭多点触摸
        cc.macro.ENABLE_MULTI_TOUCH = false;

        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
    }

    protected start(): void {
        // this.playBGM();
    }

    protected update(dt: number): void { }

    // public onClickSound() {
    //     this.isClick = !this.isClick;
    //     this.on.active = !this.isClick;
    //     this.off.active = this.isClick;
    //     AudioManger.instance.toggleEffect();
    //     AudioManger.instance.toggleMusic();
    //     AudioManger.instance.playEffect(AudioClipName.effect.click)
    // }

    // public onClickSetting() {
    //     AudioManger.instance.playEffect(AudioClipName.effect.click)
    //     this.alert.active = true;
    // }

    // public onClickExit() {
    //     this.alert.active = false;
    //     this.loadLoadingView();
    // }
    // public onCickReturn() {
    //     this.alert.active = false;
    // }

    // public onClickMusic() {
    //     this.isClick = !this.isClick;
    //     this.musicArr[0].active = this.isClick;
    //     this.musicArr[1].active = !this.isClick;
    //     AudioManger.instance.toggleMusic();
    // }

    // // 用于游戏中返回loading界面时候下拉菜单还没有收回的监听方法
    // private dispatchCloseMenu() {
    //     if (this.frame.active) {
    //         this.frame.active = false;
    //     }
    // }

    // public onClickSetting() {
    //     this.isActive = !this.isActive;
    //     this.frame.active = this.isActive;
    // }

    private playBGM() {
        AudioManger.instance.playMusic(AudioClipName.music.bgm);
    }
}
