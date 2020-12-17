const Stack = require("./stack");
const gap = 10;
//键对值
const colour1 = {
    0: [100, 100, 100],
    1: [255, 255, 255],
    2: [255, 0, 0],
    3: [255, 255, 0],
}
cc.Class({
    extends: cc.Component,

    properties: {
        //砖块预制物
        brick_prefab: {
            type: cc.Prefab,
            default: null
        },
        //光点预制物
        game_character_prefab: {
            type: cc.Prefab,
            default: null
        },
        game_node: {
            type: cc.Node,
            default: null
        }
    },
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    //接收起点和终点, 有一个路径点被点中了
    you_lujing_beidianjile(brick_js) {
        //初始状态 点了一个块, 这个块设置为起点块
        if (this.m_blockState == 0) {
            this.m_startBlockJs = brick_js;//保存这个块为起始块
            this.m_blockState = 1;//设置状态为有起点

            brick_js.setState('qidian');//把这个块设置成起点的颜色
            return;
        }

        //处理有点的状态, 分2种情况
        //1. 点击的是原来的起始块, 那么就取消起始块
        //2. 点击的是别的块, 那么就设置终点块
        if (this.m_blockState == 1) {
            if (brick_js == this.m_startBlockJs) {//点击的是原来的起始块, 那么就取消起始块
                this.m_startBlockJs = null;
                this.m_blockState = 0;
                brick_js.setState('moren');//把这个块设置成默认的颜色
            } else {// 点击的是别的块, 那么就设置终点块
                this.m_endBlockJs = brick_js;
                this.m_blockState = 2;
                brick_js.setState('zhongdian');//把这个块设置成终点的颜色

                //需要划线或者做起点到终点的动作
                let qiian_hang = this.m_startBlockJs.hang;
                let qidian_lie = this.m_startBlockJs.lie;
                let zhong_dian_hang = this.m_endBlockJs.hang;
                let zhong_dian_lie = this.m_endBlockJs.lie;
                this.qidong_xiaoqiu(qiian_hang, qidian_lie, zhong_dian_hang, zhong_dian_lie);
            }
            return;
        }

        //如果有终点块了, 但还点了块, 看这个块是不是终点块
        if (this.m_blockState == 2) {
            if (this.m_endBlockJs != brick_js) {
                // 1. 停掉之前的 划线或者做起点到终点的动作
                this.m_endBlockJs.setState('moren');//把这个块设置成终点的颜色
                //2. 设置这个块为终点块
                this.m_endBlockJs = brick_js;
                this.m_blockState = 2;
                brick_js.setState('zhongdian');//把这个块设置成终点的颜色

                //需要划线或者做起点到终点的动作 m_startBlockJs这个就是那个js脚本
                let qiian_hang = this.m_startBlockJs.hang;
                let qidian_lie = this.m_startBlockJs.lie;
                let zhong_dian_hang = this.m_endBlockJs.hang;
                let zhong_dian_lie = this.m_endBlockJs.lie;
                this.qidong_xiaoqiu(qiian_hang, qidian_lie, zhong_dian_hang, zhong_dian_lie);
            }
            return;
        }
        //另外,不是写在这里, 如果那个 划线或者做起点到终点的动作 完成了, 把状态再重新设置初始状态, 这样就是一个闭合的逻辑了
        //又可以重新设置起点和终点了
    },
    //启动小球
    qidong_xiaoqiu(qiian_hang, qidian_lie, zhong_dian_hang, zhong_dian_lie) {
        // 1. 停掉之前的 划线或者做起点到终点的动作
        for (let i in this.act_arr) {
            //同样还是this.node 去停止这个十个动作
            this.node.stopAction(this.act_arr[i]);
            this.act_arr[i] = null;
        }
        this.act_arr = [];

        this.path = this.look_for_exit(this.di_tu_arr[qiian_hang][qidian_lie], this.di_tu_arr[zhong_dian_hang][zhong_dian_lie], this.di_tu_arr);
        this.game_character = cc.instantiate(this.game_character_prefab);
        if (this.xing_jie_dian) {
            this.xing_jie_dian.destroy();
            this.xing_jie_dian = null;
        }
        this.xing_jie_dian = new cc.Node();
        this.xing_jie_dian.parent = this.game_node;
        this.game_character.position = this.path[this.path.length - 1].position;
        this.xing_jie_dian.addChild(this.game_character);
        for (let i = this.path.length - 1; i >= 0; i--) {
            let ta = this.node.runAction(cc.sequence(cc.delayTime(0.5 + (this.path.length - i) / 5), cc.callFunc(function () {

                this.game_character.position = this.path[i].position;
            }.bind(this))));
            this.act_arr.push(ta);
        }
    },
    start() {
        this.location = [];
        this.map = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
            [1, 0, 0, 1, 1, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
            [1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 1, 0, 1],
            [1, 1, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
        this.Stack = new Stack.Stack();
        this.Stack1 = new Stack.Stack();
        this.add_brick(this.map);
        this.location[0] = {
            hang: 8,
            lie: 8,
            obj: this.di_tu_arr[8][8],
            clock: Date.now()
        }
        this.location[1] = {
            hang: 1,
            lie: 7,
            obj: this.di_tu_arr[1][7],
            clock: Date.now() * 2
        }

        //动作数组
        this.act_arr = [];

        //一个区分当前是点击进行到哪一阶段的状态变量
        //0: 初始状态也就是没有起点, 没有终点
        //1: 有起点
        //2: 有终点
        this.m_blockState = 0;//
        // let dir = "right";
        // let post1 = this.findNextPoint({ hang: 9, lie: 9 }, dir, di_tu_arr);
        // let post2 = this.findNextPoint({ hang: 0, lie: 0 }, dir, di_tu_arr);
        // let post3 = this.findNextPoint({ hang: 9, lie: 0 }, dir, di_tu_arr);
        // let post4 = this.findNextPoint({ hang: 0, lie: 9 }, dir, di_tu_arr);

        // let x = ;
        let a = 100;
    },
    //找出口 传入起点,终点, 地图, 知道要做
    look_for_exit(start, end, ditu) {
        /**
         * 初始化，将起点加入堆栈；
            while(堆栈不为空){
                取出栈顶位置为当前位置；
                如果 当前位置是终点，
                则 使用堆栈记录的路径标记从起点至终点的路径；
                否则{
                    按照从下、右、上、左的顺序将当前位置下一个可以探索的位置入栈；
                    如果 当前位置的四周均不通
                    则 当前位置出栈；
                }
            }
        */

        //先清理部分
        //1. 清理之前所有块的已访问标记
        for (let i in this.di_tu_arr) {
            for (let j in this.di_tu_arr[i]) {
                this.di_tu_arr[i][j].getComponent('brick').setVisited(false);
            }
        }

        this.directions = ['down', 'right', 'up', 'left'];
        // 初始化，将起点加入堆栈；
        this.Stack.push(start);//这个Stack 做好准备了进行下一次操作了吗, 上一次搜索后里面存的东西清理了吗不全都pop出去了吗
        let items = this.Stack.getItem();

        let res = [];
        while (!this.Stack.isEmpty()) {
            let dangqian = this.Stack.peek();
            if (this.tell_isame_position(dangqian, end)) {
                // 差不多找到路么了, 而且这个路径就是栈里面存的东西

                let x = end.getComponent('brick').hang;
                let y = end.getComponent('brick').lie;
                while (!this.Stack.isEmpty()) {
                    let cell = this.Stack.pop();
                    let cell_x = cell.getComponent('brick').hang;
                    let cell_y = cell.getComponent('brick').lie;
                    // 要注意的是，只有和上一次的cell相邻的cell才是路径上的通道
                    if (Math.abs(cell_x - x) + Math.abs(cell_y - y) <= 1) {
                        cc.log(`路径点(${cell_x}, ${cell_y})`);
                        res.push(cell);
                    }
                    x = cell_x;
                    y = cell_y;
                }

                return res;
            }
            else {
                // 向四个方向探索
                let isDead = true;
                for (let i in this.directions) {
                    let t_dir = this.directions[i];
                    let next_position = this.findNextPoint(dangqian, t_dir, ditu);
                    if (next_position && next_position.getComponent('brick').ID != 1 && next_position.getComponent('brick').isValid()) {
                        next_position.getComponent('brick').setVisited(true);
                        this.Stack.push(next_position);
                        cc.log(`位置行:${next_position.getComponent('brick').hang} 列: ${next_position.getComponent('brick').lie} 入栈`);
                        isDead = false;
                    }
                }
                // 四个方向都不能走，则该点为死胡同，出栈
                if (isDead) {
                    let k = this.Stack.pop();
                    cc.log(`位置行:${k.getComponent('brick').hang} 列: ${k.getComponent('brick').lie} 出栈`);
                }
            }
        }
    },
    //传一个位置进去, 要判断这个位置是不是已经在栈里了
    isInStack(next_position) {
        let x = next_position.getComponent('brick').hang;
        let y = next_position.getComponent('brick').lie;
        let arr = this.Stack.getItem();
        for (let i = 0; i < arr.length; i++) {
            let hang = arr[i].getComponent('brick').hang;
            let lie = arr[i].getComponent('brick').lie;
            if (x === hang && y === lie) {
                return true;
            }
        }
        return false;
    },
    //判断一个位置的四周通不通, 只有一个通那就是通, 否则就是不通
    //如果某个位置已经在栈里面了, 也就访问过了的意思, 就不算做通路
    whether_Way(dangqian, ditu) {
        for (let key in this.directions) {
            let next_position = this.findNextPoint(dangqian, this.directions[key], ditu)
            if (next_position && next_position.getComponent('brick').ID != 1) {
                return true;
            }
        }
        return false;
    },
    //判断两个点是不是同一个位置
    tell_isame_position(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    },
    //根据传进来的点 找到下一个方向的点
    findNextPoint(chuanjinliadedain, xiayigefangxiang, ditu) {
        // let hang = chuanjinliadedain.hang;
        // let lie = chuanjinliadedain.lie;

        let hang = chuanjinliadedain.getComponent('brick').hang;
        let lie = chuanjinliadedain.getComponent('brick').lie;
        let next_hang = hang;
        let next_lie = lie;
        if (xiayigefangxiang == "up") {
            next_hang = hang - 1;
        }
        else if (xiayigefangxiang == "down") {
            next_hang = hang + 1;
        }
        else if (xiayigefangxiang == 'left') {
            next_lie = lie - 1;
        }
        else if (xiayigefangxiang == 'right') {
            next_lie = lie + 1;
        }

        //找出四个边界
        let up_edge = 0;
        let down_edge = ditu.length - 1;
        let left_dege = 0;
        let right_edge = ditu[0].length - 1;

        //行,列跟边界去比较
        if (/*超出边界 直接返回空*/next_hang < up_edge || next_hang > down_edge || next_lie < left_dege || next_lie > right_edge) {
            return null;
        }

        //
        return ditu[next_hang][next_lie];

    },
    //根据地图添加砖块和通道
    add_brick(map) {
        this.di_tu_arr = [];
        for (let i = 0; i < map.length; i++) {
            this.di_tu_arr[i] = [];
            for (let j = 0; j < map[i].length; j++) {
                let brick = cc.instantiate(this.brick_prefab);
                let colour = colour1[map[i][j]];
                let B = colour[2];
                let G = colour[1];
                let R = colour[0];
                brick.getComponent('brick').brick_colour(R, G, B);
                brick.getComponent('brick').Name(map[i][j], i, j);
                this.di_tu_arr[i][j] = brick;
                this.di_tu_arr[i][j].getComponent('brick').receive_game_script(this);
                if (map[i][j] != 0) {
                    this.di_tu_arr[i][j].getComponent('brick').forbid_click(false);
                }
                this.game_node.addChild(brick);
            }
        }
        this.describe_map();
    },
    //画地图
    describe_map() {
        let beginning = 100;//上面的起点
        let destination = 340;//下面的终点
        let m_width = this.di_tu_arr[0][0].getChildByName('brick_sprite').width;//110
        let m_heigth = this.di_tu_arr[0][0].getChildByName('brick_sprite').height;//110
        let right_interval = 10;//往右的间隔
        let down_interval = 10;//往下的间隔
        for (let i = 0; i < this.di_tu_arr.length; i++) {
            for (let j = 0; j < this.di_tu_arr[i].length; j++) {
                let x = beginning + j * (m_width + right_interval);
                let y = destination - i * (m_heigth + down_interval);
                this.di_tu_arr[i][j].position = cc.v2(x, y);
            }
        }
    },

    // update (dt) {},
});
