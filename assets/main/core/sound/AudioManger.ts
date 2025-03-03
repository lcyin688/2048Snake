const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioManager extends cc.Component {
    @property({
        type: [cc.AudioClip]
    })
    public Musics: cc.AudioClip[] = [];

    @property({
        type: [cc.AudioClip]
    })
    public Effects: cc.AudioClip[] = [];

    @property(cc.AudioSource)
    public MusicSource: cc.AudioSource = null;

    @property(cc.AudioSource)
    public EffectSource: cc.AudioSource = null;

    private effectPool: cc.NodePool = null;

    public static instance: AudioManager = null;

    onLoad() {
        if (AudioManager.instance === null) {
            AudioManager.instance = this;
            // cc.game.addPersistRootNode(this.node); // 保持实例在场景切换时不被销毁
        } else {
            this.node.destroy();
        }

        this.effectPool = new cc.NodePool();
        for (let i = 0; i < this.Effects.length; i++) {
            const effectNode = new cc.Node();
            const audioSource = effectNode.addComponent(cc.AudioSource);
            audioSource.clip = this.Effects[i];
            this.effectPool.put(effectNode);
        }
    }

    start() { }

    public playMusic(name: string) {
        const index = this.Musics.findIndex((audio: cc.AudioClip) => audio.name === name);
        if (index === -1) {
            console.log("无法找到声音");
        } else {
            this.MusicSource.clip = this.Musics[index];
            this.MusicSource.play();
        }
    }

    public playEffect(name: string) {
        const index = this.Effects.findIndex((audio: cc.AudioClip) => audio.name === name);
        if (index === -1) {
            console.log("无法找到声音");
            return;
        }

        let effectNode = this.effectPool.get();
        if (!effectNode) {
            // 如果对象池中没有可用的节点，则创建一个新的节点
            effectNode = new cc.Node();
            const audioSource = effectNode.addComponent(cc.AudioSource);
            audioSource.clip = this.Effects[index];
            this.effectPool.put(effectNode); // 添加音效池中 统一管理
        } else {
            // 如果对象池中有可用的节点，则重置节点的状态
            const audioSource = effectNode.getComponent(cc.AudioSource);
            audioSource.clip = this.Effects[index];
        }

        const audioSource = effectNode.getComponent(cc.AudioSource);
        audioSource.mute = this.EffectSource.mute;  //让音效池中的所有音效源组件的mute属性由this.EffectSource.mute控制
        audioSource.play();
    }

    public toggleMusic() {
        this.MusicSource.mute = !this.MusicSource.mute;
    }

    public toggleEffect() {
        this.EffectSource.mute = !this.EffectSource.mute;
    }

    public musicVolume(volume: number) {
        this.MusicSource.volume = volume;
    }

    public effectVolume(volume: number) {
        this.EffectSource.volume = volume;
    }
}
