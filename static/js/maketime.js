    /* この書き方 */
var margin = {
    left: 200,
    right: 30,
    bottom: 50,
    top: 30,
};


/* SVG要素のサイズ */
var width = 930;
var height = 100;

/* x, y 軸のスケールを作成する */
var xScale = d3.scaleLinear()    // v4 から scale.linear() ではなくなった
  .domain([0, 24])    // 入力値の範囲
  .range([margin.left, width - margin.right]);    // 出力位置の範囲

/* SVG要素を取得 & サイズ設定 */
var svg = d3.select("#svg")
  .attr("width", width)
  .attr("height", height);

/* x 軸を描画する */
svg.append("g")
  .attr("class", "x_axis")
  .attr(
    "transform",
    "translate(" + [
      0,
      // 0    // このようにすると画面上部に軸が表示されるので..
      height - margin.bottom    // このように平行移動させる
    ].join(",") + ")"
  )
  .call(
    d3.axisBottom(xScale)
      .ticks(24)
      .tickFormat(function(d){
        return d +":00"
        })
  );
