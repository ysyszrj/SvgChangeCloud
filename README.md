# SvgChangeCloud


## usage
SvgCloud初始化一个词云的生成对象，drawWordCloud输入本次要显示的词云
```
var list1 = {
    {text: "word1", weight: 13},
    {text: "word2", weight: 3.5}
};
var list2 = {
    {text:"word2",weight:8},
    {text:"word3",weight:3}
}

var sc = SvgCloud("#my_favorite_latin_words",{font_color: color});
sc.drawWordCloud(list1);
sc.drawWordCloud(list2);
```
## features
- 能够保持原来词云的位置


