const e = require('express');
const express = require('express');

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));


let values;

app.get('/', (req, res) => 
{
    //全体を保存するやつ
    values = new Array(9);
    for(let y = 0; y < 9; y++) {
        values[y] = new Array(9).fill(Number(0));
    }

    values[0][0] = 5;
    values[0][1] = 3;

    /*
    ランダム生成用（作りかけ）
    //1 -> 9の配列生成
    const baseArray = new Array(9)
        .fill(1)
        .map((n, i) => n + i);
    
    for(let r = 0; r < 9 ; r++)
    {

        //9回抽選
        let randNum = shuffle(baseArray)[ Math.floor( Math.random() * baseArray.length ) ] ;

    }
    */
    
    res.render('index.ejs',{result:'',values:values});
});

app.get('/index', (req, res) => 
{
    
    res.render('index.ejs',{result:'',values:values});
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
    if(!checkRow())
    {
        result = '不正解';
    }
    else
    {
        result = '正解!';
    }
    //縦列
    if(!checkColumn())
    {
        result = '不正解';
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

    res.render('index.ejs',{result:result,values:values});
});

const checkRow = (() =>
{
    let result = false;
    //重複チェック
    for(let r = 0; r < 9; r++)
    {   
        console.log(values[r]);
        result = existsSameValue(values[r]);
        if(result == false)
        {
            break;
        }
    }
    
    return result;
});
const checkColumn = (() =>
{
    //重複チェック
    for(let c = 0; c < 9; c++)
    {   
        let checkArray = new Array(9).fill(false); 
        for(let r = 0;r < 9; r++)
        {
            if(checkArray[values[r][c]])
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
    //Set:"一意な"値を格納する。
    var s = new Set(array);
    //全て格納されたかをチェック
    return s.size === array.length;
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


app.listen(3000);