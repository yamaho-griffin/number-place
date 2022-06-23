const e = require('express');
const express = require('express');

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));


let values;
//問題用
let questionValues;

app.get('/', (req, res) => 
{
    //全体を保存するやつ
    values = new Array(9);
    for(let y = 0; y < 9; y++) {
        values[y] = new Array(9).fill(Number(0));
    }

    createQuestion();

    questionValues = values;
    
    res.render('index.ejs',{result:'',values:values,questionValues:questionValues});
});

app.get('/index', (req, res) => 
{
    
    res.render('index.ejs',{result:'',values:values,questionValues:questionValues});
});

app.post('/index', (req,res) =>
{
    
    //number型に変換
    let strArray = req.body.value;
    let numberArray = [];
    strArray.forEach(numStr => {
        numberArray.push(Number(numStr));
    });
    
    let counter = 0;
    for(let i = 0;i < 9; i++)
    {
        for(let j = 0;j < 9; j++)
        {
            values[i][j] = numberArray[counter];
            counter++;
        }
    }

    let result = '';
    //横列
    if(!checkAllRow())
    {
        result = '不正解。横列に重複があるぞ！';
    }
    else
    {
        result = '正解!';
    }
    //縦列
    if(!checkAllColumn())
    {
        result = '不正解。縦列に重複があるぞ！';
    }
    else
    {
        if(result === '正解!')
        {
            result = '正解!';
        }
    }
    //ボックス
    if(!checkBlock())
    {
        result = '不正解。ボックスを見直して見よう!';
    }
    else
    {
        if(result === '正解!')
        {
            result = '正解!';
        }
    }

    res.render('index.ejs',{result:result,values:values,questionValues:questionValues});
});

//全ての横列チェック
const checkAllRow = (() =>
{
    //重複チェック
    for(let r = 0; r < 9; r++)
    {   
        if(!checkRow(r))
        {
            //重複があった場合
            return false;
        }
    }
    
    return true;
});
//横列重複チェック
const checkRow = ((row) =>
{
    if(!existsSameValue(values[row]))
    {
        //重複
        return false;
    }
    
    return true;
});

//全ての縦列をチェック
const checkAllColumn = (() =>
{
    //縦列の個数分ループ
    for(let c = 0; c < 9; c++)
    {   
        if(!checkColumn(c))
        {
            //重複があった場合
            return false;
        }
    }

    return true;
});
//縦列重複チェック
//1個でも重複があった時点で処理を終了⇒高速化!
const checkColumn = ((colum) =>
{
    console.log("colum:" + colum);
    let tempArray = [];
    for(let row = 0;row < 9; row++)
    {
        tempArray[row] = values[colum][row];
        if(row === 8)
        {
            //console.log("[" + colum + "," + row + "]"+ "value:" + values[row][colum]);
            
        }
        //console.log("count" + row + "tempArray" + tempArray[row]);
    }
    console.log("tempArray:[" + tempArray + "]:" + existsSameValue(tempArray));
    if(!existsSameValue(tempArray))
    {
        //重複
        return false;
    }
    return true;
});

//全ての3*3BOXで重複があるかをチェック
const checkBlock = (() =>
{
    //重複チェック
    for(let r = 0; r < 9; r += 3)
    {   
        for(let c = 0;c < 9; c += 3)
        {
            if(!checkThreeBOX(r,c))
            {
                //重複
                return false;
            }
        }
    }
    return true;
});
//3*3BOXで重複があるかをチェック
const checkThreeBOX = ((rowB,columB) =>
{
    let checkArray = new Array(9).fill(false); 
    for(let r = rowB ; r < rowB + 3; r++)
    {
        for(let c = columB ; c < columB + 3; c++)
        {
            if(checkArray[values[r][c]] == true)
            {
                //重複
                return false;
            }
            else
            {
                checkArray[values[r][c]] = true;
            }
        }
    }
    return true;
});

//配列重複チェック
const existsSameValue = ((array) =>
{
    const minusArray = new Array(9).fill(-1).map((n, i) => n - i);
    for(let i = 0 ; i < array.length ; i++)
    {
        if(array[i] === 0)
        {
            array[i] = minusArray[i];
        }
    }
    //Set:"一意な"値を格納する。
    var s = new Set(array);
    //全て格納されたかをチェック
    //console.log("array:" + array);
    return s.size === array.length;
});

/*
@param number quantity 挿入する個数
@param number row,column 3*3BOXの左上の座標
*/
//ボックスの中で指定個の数だけ数字を挿入
const insertNumber = ((quantity,rowB,columnB) =>
{
    let localBaseArray = new Array(9).fill(1).map((n, i) => n + i);
    let localIndexArray = new Array(9).fill(0).map((n, i) => n + i);
    for(let i = 0; i < quantity; i++)
    {
        //console.log("i:" + i);
        while(localBaseArray.length > 0)
        {
            localBaseArray = shuffle(localBaseArray);
            localIndexArray = shuffle(localIndexArray)
            let localValue  = localBaseArray[0];
            let localIndex = localIndexArray[0];
            
            let x = return2DArrayIndex(rowB,columnB,localIndex)[0];
            let y = return2DArrayIndex(rowB,columnB,localIndex)[1];
            values[x][y] = localValue;
            console.log("values["+x+"]["+y+"]:" + localValue);
            /*
            console.log("localValue:" + localValue);
            
            console.log("localIndex:" + localIndex);
            */
            //console.log("x:" + x + ",check:" + checkColumn(x) + "");
            
            //console.log("y:" + y + ",check:" + checkRow(y) + "");
            
            //console.log("localBaseArray:" + localBaseArray);
            
            
            if(checkColumn(x) && checkRow(y))
            {
                //console.log("[" + x + "," + y + "]"+ "value:" + localValue);
                localBaseArray.shift();
                localIndexArray.shift();
                break;
            }
            else
            {
                //console.log("[" + x + "," + y + "]"+ "value:" + localValue);
                values[x][y] = 0;
            }

            
            

        } 
    }
});
/*
[0,1,2,3,4,5,6,7,8]
↓
[x,y],[x+1,y],[x+2,y]
[x,y+1],[x+1,y+1], [5]
[6] , [7], [8]

@param number rowB,columnB 左上の座標
@param number index 1次元配列の要素番号
@return number[] 2次元配列の[x,y]
*/
const return2DArrayIndex = ((rowB,columnB,index) =>
{
    let result = [-1,-1];
    //x座標
    if(index % 3 == 0)
    {
        result[0] = columnB;
    }
    else if(index % 3 == 1)
    {
        result[0] = columnB + 1;
    }
    else
    {
        result[0] = columnB + 2;
    }
    //y座標
    if(index <= 2)
    {
        result[1] = rowB;
    }
    else if(index <= 5)
    {
        result[1] = rowB + 1;
    }
    else
    {
        result[1] = rowB + 2;
    }

    return result;
});

//指定の数群の中から1つランダムで選ぶ
const choiceRandomNumber = (([numberArray]) =>
{
    numberArray = shuffle(numberArray);
    return numberArray[0];
});

//配列シャッフル
const shuffle = (([...array]) => 
{
    for (let i = array.length - 1; i >= 0; i--) 
    {
      const j = Math.floor(Math.random() * (i + 1));
      //入れ替え
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
});


const createQuestion = (() =>
{
    /**/
    for(let r = 0; r < 9; r += 3)
    {   
        for(let c = 0;c < 9; c += 3)
        {
            insertNumber(8,r,c);
        }
    }
    
   
    //insertNumber(9,0,0);
});

app.listen(3000);