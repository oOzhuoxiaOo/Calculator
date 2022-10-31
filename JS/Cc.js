class Calculate {
    constructor() {
        this.iptStrs = '';//输入的实时表达式
        this.eText = '';//保存点击盒子的text(+-*/123456789)
        this.result = 0;//输入等号时记录计算的结果值
        this.oldStr = '';//旧的oldStr(因为iptStrs需要清空，用oldStr保存旧表达式,用于(历史记录时用到))
        this.LiArr = [];// history的数据存储数组
        this.LiMryArr = [];
        this.flag = 1;//确定此时是history还是M
        this.init();//初始化界面
    }
    updateNode() {
        this.exIptBtm = document.querySelector('.execution-input-bottom');//获取下方需要点击的区域
        this.exViNbr = document.querySelector('.execution-view-number')//获取区域：展示输入的
        this.exViSave = document.querySelector('.execution-view-save');//获取保存区，TODO:未用到
        this.exIptMry = document.querySelector('.execution-input-memory ul');
        this.viCtUl = document.querySelector('.view-content ul');//获取history和M的内容区域
        this.removeBtn = document.querySelector('.clear-con')//获取清空按钮
        this.viewHead = document.querySelector('.view-head');//获取选择(选择history?M)节点
        this.viewHeadArr = [...this.viewHead.children];//选择节点 子节点组成的数组(用于遍历添加事件等)
    }
    init() {
        this.updateNode();//获取节点
        this.addEvent();//添加输入事件(+-*/123456789)
        this.addMryEvent();//添加输入事件(M+,M-,MS,MC,MR)
        this.removeHistory();//移除所有历史记录
        this.changeSlider();//添加选择事件(history?M)
    }
    addEvent() {
        // 给点击区域exIptBtm添加一个事件，利用事件委托实现确定点击对象
        this.exIptBtm.addEventListener('click', (e) => {
            // 如果点到了空隙 (tr),退出循环(避免点击到间隙tr影响)
            if (e.target.tagName == 'TR') {
                console.log('return');//debug
                return;
            }
            this.eText = e.target.innerText;//保存点击盒子的text(+-*/123456789)
            console.log(e.target)//debug:点击的是哪个盒(+-*/123456789)
            if (this.eText != '=') {//如果输入的不是等号
                this.iptStrs += this.eText;//表达式字符叠加
            } else {//输入的是等号
                this.oldStr = this.exViNbr.innerText;//保存旧数据
                this.result = eval(this.exViNbr.innerText);//存储输入总的执行结果(只起到记录值的作用)
                this.iptStrs = this.result;//表达式实时更新(按等号时获取了值，表达式更新为值)
                this.createViCtLi();//按等号创建元素(只存储到liArr中,不更新DOM界面)
                if (this.flag) {//如果此时位于history,直接更新到界面，否则只在LiArr中存储不更新(避免位于M时更新到ul区域)
                    this.addViCtLi();//更新界面
                }
            }
            if (this.eText == 'C') {//如果输入的是C
                this.iptStrs = '';//清空表达式
            }
            if (this.eText == 'CE') {//如果输入的是CTODO:还未了解CE功能，按C执行
                this.iptStrs = '';//清空表达式
            }
            if (this.eText == 'x²') {//如果输入的是x*
                this.result = Math.pow(eval(this.exViNbr.innerText), 2);//计算x²
                this.iptStrs = this.result;//更新表达式(覆盖掉输入时的表达式(列:1*5))
            }
            if (this.eText == '√x') {//如果输入的是根
                this.result = Math.sqrt(eval(this.exViNbr.innerText));//求根
                this.iptStrs = this.result;//更新表达式
            }
            if (this.eText == '1/x') {//如果输入的是倒数
                this.result = 1 / eval(this.exViNbr.innerText);//求倒数
                this.iptStrs = this.result;//更新表达式
            }
            if (this.eText == '+/-') {//如果输入的是取反
                this.result = -eval(this.exViNbr.innerText);//求反
                this.iptStrs = this.result;//更新表达式
            }
            if (this.eText == '←') {//如果输入的是删减
                this.iptStrs = this.iptStrs.slice(0, this.iptStrs.length - 2);//求删减(截取0-倒数第二位)
            }
            this.exViNbr.innerText = this.iptStrs;//更新展示内容为表达式(表达式(输入为1-9)||值(输入为 等号||计算符))
            // 只有等号会存历史记录
        })
    }
    addMryEvent() {
        this.exIptMry.addEventListener('click', (e) => {
            this.eText = e.target.innerText;//保存点击盒子的text(+-*/123456789)
            console.log(e.target)//debug:点击的是哪个盒(+-*/123456789)
            if (this.eText == 'MS') {//如果输入的是MS
                this.createMryLi();
                if (!this.flag) {
                    this.addMryLi();
                }
            }
            if (this.eText == 'MC') {
                this.removeBtn.click();
            }
            if (this.eText == 'M+') {
                this.upMryOne();
            }
            if(this.eText == 'M-') {
                this.upMryOne();
            }
            if(this.eText == 'MR') {
                this.upMryOne();
            }

        })
    }
    // 🔖创建历史记录元素
    // 场景:按=时
    // 把创建的元素存储到了数组LiArr中
    createViCtLi() {
        let newLi = document.createElement('li');//单个Li
        let div1 = document.createElement('div');//Li内上方
        let div2 = document.createElement('div');//Li内下方
        div1.className = 'v-c-li-top';//添加类
        div2.className = 'v-c-li-bottom';//添加类
        div1.innerText = this.oldStr + '=';//上方展示表达式
        div2.innerText = this.iptStrs;//下方展示值
        newLi.appendChild(div1);//div放Li中
        newLi.appendChild(div2);
        setTimeout(() => {//晚0.3秒给Li添加一个类, (淡入淡出效果，如果直接添加不显示TODO:why?)
            newLi.className = 'showLi';
        }, 300)
        this.LiArr.unshift(newLi);//存储到属性LiArr中(新的在上边)
    }
    createMryLi() {
        let newLi = document.createElement('li');//单个Li
        let div1 = document.createElement('div');//Li内上方
        let div2 = document.createElement('div');//Li内下方
        div1.className = 'v-c-li-top';//添加类
        div2.className = 'v-c-li-bottom';//添加类
        // div1.innerText = this.oldStr + '=';//上方展示表达式
        div2.innerText = this.iptStrs;//下方展示值
        newLi.appendChild(div1);//div放Li中
        newLi.appendChild(div2);
        setTimeout(() => {//晚0.3秒给Li添加一个类, (淡入淡出效果，如果直接添加不显示TODO:why?)
            newLi.className = 'showLi';
        }, 300)
        this.LiMryArr.unshift(newLi);//存储到属性LiArr中(新的在上边)
    }
    //🔖根据历史记录数组liArr从新更新历史记录区域DOM
    // 场景:按=时，选择history||M时
    addViCtLi() {
        this.LiArr.forEach((val, index) => {
            this.viCtUl.appendChild(val);
        })
    }
    addMryLi() {
        this.LiMryArr.forEach((val, index) => {
            this.viCtUl.appendChild(val);
        })
    }
    // 🔖移除历史记录(mr||history)，并且重置Li数组（DOM+LiRrr）
    // 场景:点击clearBtn时
    removeHistory() {
        this.removeBtn.addEventListener('click', () => {
            if (this.eText == 'MC') {
                this.LiMryArr.forEach((val, index) => {
                    val.remove();//移除自身DOM
                    this.LiMryArr = [];//重置LiMrArr数组
                    this.eText = '';//避免点击MC后再点击clearBtn再次进入这个执行，令清除历史记录失效
                })
                return;
            }
            if (this.flag) {//选中history时，移除history记录
                this.LiArr.forEach((val, index) => {
                    val.remove();//移除自身DOM
                })
                this.LiArr = [];//重置LiArr数组
            } else {//选中Mr时，移除history记录
                this.LiMryArr.forEach((val, index) => {
                    val.remove();//移除自身DOM
                    this.LiMryArr = [];//重置LiMrArr数组
                })
            }
        })
    }

    //🔖清除历史记录,只清除DOM,不清除LiArr
    // 场景：选择M时
    noneHistory() {
        this.LiArr.forEach((val, index) => {
            val.remove();//移除自身DOM
        })
    }
    // 🔖清除两个滑片的类
    // 场景：选择history||M时
    clearAllSlider() {
        this.viewHeadArr.forEach((val, index) => {
            val.classList.remove('slider');
        })
    }
    noneMry() {
        this.LiMryArr.forEach((val, index) => {
            val.remove();//移除自身DOM
        })
    }
    upMryOne(){
        if(this.eText == 'M+') {
            console.log('M+')
            this.LiMryArr[0].children[1].innerText =  this.LiMryArr[0].children[1].innerText * 1  + Number(this.iptStrs); 
        }
        if(this.eText == 'M-') {
            console.log('M-')
            this.LiMryArr[0].children[1].innerText =  this.LiMryArr[0].children[1].innerText * 1  - Number(this.iptStrs); 
        }
        if(this.eText == 'MR') {
            console.log('MR')
            this.iptStrs =  this.LiMryArr[0].children[1].innerText;
            this.exViNbr.innerText = this.iptStrs;
        }
        
    }
    // 🔖选择history||M
    // 场景：点击history||M时
    changeSlider() {
        this.viewHeadArr.forEach((val, index) => {
            // 给history||M添加点击事件
            val.addEventListener('click', () => {
                this.clearAllSlider();//清除所有人
                val.classList.add('slider')//留下自己
                if (index == 0) {
                    console.log('移除DOM, 进入历史记录模块,根据LiArr从新解析模板')//debug
                    this.flag = 1;
                    this.noneMry();
                    this.addViCtLi();//如果点击了history,更新历史记录
                }
                if (index == 1) {
                    console.log('移除DOM,进入记忆模块,"TODO:"');//debug
                    this.flag = 0;
                    this.noneHistory();//如果点击了M,隐藏历史记录(DOM删除，数据留着)
                    this.addMryLi();
                }
            })
        })
    }
}