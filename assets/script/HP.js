
cc.Class({
    extends: cc.Component,

    properties: {
        hp_prefab: {
            type: cc.Prefab,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        console.log("100");
    },
    Set_Hp(hp) {
        // let hp_txt = cc.find('hp_txt', this.node);
        // hp_txt.getComponent("cc.Label").string = `HP:${hp}`;
        for (let i = 0; i < 5; i++) {
            let a = cc.find("hp_" + (i + 1), this.node)
            a.active = i < hp;
        }

    }
    // update (dt) {},
});
