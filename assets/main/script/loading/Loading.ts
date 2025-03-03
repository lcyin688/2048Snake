import { AudioClipName } from "../../core/sound/AudioClipName";
import AudioManger from "../../core/sound/AudioManger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    @property(cc.ProgressBar)
    private loadingProessbar: cc.ProgressBar = null;
    @property(cc.Node)
    private btnPlay: cc.Node = null;

    private loadingTime: number = 1;
    private countTime: number = 0;
    private isload: boolean = true; //防止多次加载

    onLoad() {
        this.loadingProessbar.progress = 0;
    }

    start() { }

    protected update(dt: number): void {
        this.countTime += dt;
        let progress = Math.ceil((this.countTime / this.loadingTime) * 100);
        if (progress >= 100 && this.isload) {
            this.isload = false;
            progress = 100;
            this.loadingProessbar.node.active = false;
            this.btnPlay.active = true;
        } else {
            this.loadingProessbar.progress = progress / 100;
        }
    }

    onClickPlay() {
        AudioManger.instance.playEffect(AudioClipName.effect.click)
        this.node.active = false;
    }
}
