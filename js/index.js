const COLOR = {
    WHITE: "#ffffff",
    GRAY: "#9e9e9e",
    DARKGRAY: "#1B2631",
    LIGHTGRAY: "#AEB6BF",
    BLUE: "#1e90ff",
    MIDNIGHTBLUE: "#0000cd",
    AQUAMARINE: "#7fffd4",
    DEEPPINK: "#ff1493",
    YELLOW: "#FFFF00",
    PURPLE: "#800080",
    OCEAN: "rgba(0, 0, 255, 0.2)",
    REEF: "rgba(21, 67, 96, 0.3)",
};

function getTodayStr() {
    return formatDate(new Date());
}

function formatDate(dt) {
    const y = dt.getFullYear();
    const m = ("00" + (dt.getMonth()+1)).slice(-2);
    const d = ("00" + dt.getDate()).slice(-2);
    const dow = [ "日", "月", "火", "水", "木", "金", "土" ][dt.getDay()];
    return `${y}/${m}/${d} (${dow})`;
}

function getDateFromChart(swipeIndex) {
    return lineChart[swipeIndex] ? lineChart[swipeIndex].config.data.datasets[0].label : null;
}

function getStrageKey(dateStr) {
    return dateStr.substr(0, 4) + $("#area option:selected").val();
}

function getCurrDateString() {
    return $("#date").val().replace(/\//g, "-").split(" ")[0];
}

// FIXME: getとdrawが混在
function getData() {
    // TODO: 表示の日付と、JSONの日付、Chatの日付、パラメーターで持ち回る日付のフォーマット整理
    const dateStr = getCurrDateString();

    if (lineChart[swipe.getPos()] &&
        dateStr == getDateFromChart(swipe.getPos())) return;

    const strageKey = getStrageKey(dateStr);

    if (sessionStorage.getItem(strageKey) != null) {
        const response = JSON.parse(sessionStorage.getItem(strageKey));
        drawChart(getDataToday(response, dateStr), dateStr);
        initDataTable();
    } else {
        const year = dateStr.substr(0, 4);
        const area = $("#area option:selected").val();
        const areaPref = area.substr(0, 2);
        const areaPoi = area.substr(2);
        var host = !location.host ? "churageographic.github.io" : location.host;
        if (host == "churageographic.com") host += "/tides";
        const json_url = `https://${host}/data/${areaPref}/${areaPoi}/${year}.json`;
        //console.log(json_url);
        $.get(json_url, function (response) {
            if (response.warn || response.error) {
                for (let key in response) {
                    response.warn ? toastr.warning(response.warn) : toastr.error(response.error);
                }
                return;
            }
            sessionStorage.setItem(strageKey, JSON.stringify(response));
            drawChart(getDataToday(response, dateStr), dateStr);
            initDataTable();
        }, "json")
        .fail(function(jqXHR) {
            toastr.error(`「 ${$("#area option:selected").text()}の情報を取得できませんでした`);
            drawChartEmpty(dateStr);
            initDataTable();
        });
    }
}

function drawChartEmpty(dateStr) {
    drawChartEmptyWithSwipeIndex(dateStr, swipe.getPos());
}

function getDayDiffABS(data1, data2) {
    return Math.abs((data1 - data2) / 86400000);
}

const EMPTY_CHART_DATA = {
    time: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
    level: []
};

function drawChartEmptyWithSwipeIndex(dateStr, swipeIndex) {
    var currDate = new Date(getDateFromChart(swipe.getPos()));
    var otherDate = new Date(getDateFromChart(swipeIndex));
    // 他の描画済日付が1日以上空いている場合に再描画
    if (getDayDiffABS(currDate, otherDate) <= 1) return;
    drawChartWithSwipeIndex(EMPTY_CHART_DATA, dateStr, swipeIndex);
}

function getDataToday(data, dateStr) {
    var timeList = [];
    var levelList = [];
    for (var i = 0; i < data.length; i++) {
        if (dateStr != data[i].d) continue;
        timeList.push(data[i].t);
        levelList.push(data[i].l);
        // 24時(翌日の0時も表示する為 VerticalLinePlugin()と関連)
        if (data[i].t == 23) {
            timeList.push(24);
            // 12/31の翌日=翌年度分は未定義
            levelList.push(data.length != i + 1 ? data[i + 1].l : 0);
        }
    }
    return {
        time: timeList,
        level: levelList
    };
}

function getDataTodayJson(data, dateStr) {
    var tmpList = [];
    for (var i = 0; i < data.length; i++) {
        if (dateStr != data[i].d) continue;
        tmpList.push(data[i]);
        // 24時(翌日の0時も表示する為 VerticalLinePlugin()と関連)
        if (data[i].t == 23) {
            // 12/31の翌日=翌年度分は未定義(nullだとdatatableがエラーになるので空の値入れる)
            tmpList.push(data.length != i + 1 ? data[i + 1] : {d: "", t: 0, l: "?"});
        }
    }
    return tmpList;
}

var lineChart = [];

function resetChart() {
    for (var i = 0; lineChart.length > i ; i++) {
        drawChartWithSwipeIndex(EMPTY_CHART_DATA, null, i);
    }
}

function resetPrevAndNextChart() {
    const swipeIndex = swipe.getPos();
    for (var i = 0; lineChart.length > i ; i++) {
        if (swipeIndex != i) {
            drawChartEmptyWithSwipeIndex(null, i);
        }
    }
}

function drawChart(data, dateStr) {
    drawChartWithSwipeIndex(data, dateStr, swipe.getPos());
}

function drawChartWithSwipeIndex(data, dateStr, swipeIndex) {
    if (lineChart[swipeIndex]) lineChart[swipeIndex].destroy();
    const ctx = $("[id=chart]")[swipeIndex].getContext("2d");
    const pointSize = getPointSize();
    const tooltipFontSize = getFontSizeScale();
    lineChart[swipeIndex] = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.time,
            datasets: [{
                label: dateStr ? dateStr.replace(/-/g, "\/") : null,
                data: data.level,
                backgroundColor: COLOR.OCEAN,
                fill: true,
                borderColor: function(context) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return null;
                    return getGradient(ctx, chartArea);
                },
            }],
        },
        options: {
            animation: false,
            responsive: true,
            elements: {
                line: {
                    tension: 0.35, 
                    borderWidth: pointSize * 0.75,
                },
                point: {
                    pointStyle: "circle",
                    radius: pointSize * 0.75,
                    borderWidth: pointSize,
                    hoverRadius: pointSize * 0.75,
                    hoverBorderWidth: pointSize,
                    hitRadius: pointSize * 3,
                }
            },
            plugins: {
                title: {
                    display: false,
                    text: "",
                    font: {
                        size: getFontSize(),
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    titleFont: { size: tooltipFontSize },
                    bodyFont: { size: tooltipFontSize * 1.25 },
                    callbacks: {
                        title: function(context) {
                            return `${context[0].dataset.label} ${context[0].parsed.x}:00`;
                        },
                        label: function(context) {
                            return ` ${context.parsed.y}cm`;
                        }
                    }                
                }
            },
            scales: {
                x: {
                    ticks: {
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                        maxTicksLimit: getMaxTickLimit(),
                        color: COLOR.WHITE,
                        font: { size: getFontSizeScale() },
                        callback: function(val, index) {
                            return index % getTickDivision() == 0 ? val : "";
                        }
                    },
                    grid: {
                        color: function(context) {
                            return COLOR.LIGHTGRAY;
                        }
                    }

                },
                y: {
                    ticks: {
                        stepSize: 30,
                        font: { size: getFontSizeScale() },
                        color: COLOR.LIGHTGRAY,
                    },
                    min: -30,
                    max: 240,
                    grid: {
                        color: function(context) {
                            return context.tick.value == 0 ? COLOR.WHITE : COLOR.LIGHTGRAY;
                        }
                    }
                },
            }
        },
        plugins:[ DataLabelPluginPoint, VerticalLinePlugin, {
        beforeDraw: drawBackground(ctx)} ],
        }
    );   
}

let width, height, gradient;

function getGradient(ctx, chartArea) {
    if (gradient == null) {
        width = chartArea.right - chartArea.left;
        height = chartArea.bottom - chartArea.top;
        gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(1, COLOR.DEEPPINK);
        gradient.addColorStop(0.75, COLOR.MIDNIGHTBLUE);
        gradient.addColorStop(0.5, COLOR.BLUE);
        gradient.addColorStop(0.25, COLOR.AQUAMARINE);
        gradient.addColorStop(0, COLOR.YELLOW);
    }
    return gradient;
}

var DataLabelPluginPoint = { 
    afterDatasetsDraw: function(chart, easing) {
        chart.data.datasets.forEach(function(dataset, i) {
            var ctx = chart.ctx;
            ctx.save();
            var dataset = chart.data.datasets[0];
            var meta = chart.getDatasetMeta(0);
            meta.data.forEach( function (element, index) {
                if (index % getTickDivision() != 0) return;
                ctx.fillStyle = COLOR.WHITE;
                var fontSize = getFontSizeScale();
                var fontStyle = "normal";
                var fontFamily = "Helvetica Neue";
                ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
                var dataString = dataset.data[index].toString();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                var padding = getPaddingDataLabel();
                var position = element.tooltipPosition();
                ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
            });
            ctx.restore();
        });
    }
}

var VerticalLinePlugin = {
    afterDatasetDraw: function (chart, easing) {
        if (easing.meta.data.length == 0) return;

        const date = new Date();
        const h = date.getHours();
        const m = date.getMinutes();
        const orgX = easing.meta.data[0].x;
        const nextX = easing.meta.data[1].x;
        const minX = (nextX - orgX) / 60 * m;

        var dataset = chart.data.datasets[0];
        var ctx = chart.ctx;
        ctx.save();
        easing.meta.data.forEach( function (element, index) {
            if (index != h || dataset.label != getTodayStr().split(" ")[0]) return;
            ctx.strokeStyle = COLOR.DEEPPINK;
            ctx.lineWidth = element.options.borderWidth / 1.5;
            ctx.beginPath();
            const currX = element.x + minX;

            ctx.moveTo(currX, chart.chartArea.top);
            ctx.lineTo(currX, chart.chartArea.bottom);
            ctx.stroke();
        });
        ctx.restore();
    }
};

function drawBackground(ctx) {
    return function(chart, options) {
        var xscale = chart.scales["x"];
        var yscale = chart.scales["y"];
        var left = xscale.left;
        var top = yscale.getPixelForValue(0);
        var height = yscale.getPixelForValue(-30) - top;

        ctx.fillStyle = COLOR.REEF;
        ctx.fillRect(left, top, xscale.width, height);
    }
}

const MIN_WIDTH = {
    W1200: "(min-width: 1200px)",
    W960: "(min-width: 960px)",
    W720: "(min-width: 720px)",
    W480: "(min-width: 480px)",
};

function getTickDivision() {
    if( window.matchMedia(MIN_WIDTH.W1200).matches) {
        return 1;
    } else if( window.matchMedia(MIN_WIDTH.W960).matches) {
        return 2;
    } else if( window.matchMedia(MIN_WIDTH.W720).matches) {
        return 2;
    } else if( window.matchMedia(MIN_WIDTH.W480).matches) {   
        return 3;
    } else {
        return 3;
    }
}

function getMaxTickLimit() {
    if( window.matchMedia(MIN_WIDTH.W1200).matches) {
        return 25;
    } else if( window.matchMedia(MIN_WIDTH.W960).matches) {
        return 13;
    } else if( window.matchMedia(MIN_WIDTH.W720).matches) {
        return 13;
    } else if( window.matchMedia(MIN_WIDTH.W480).matches) {
        return 9;
    } else {
        return 9;
    }
}

function getPointSize() {
    if( window.matchMedia(MIN_WIDTH.W1200).matches) {
        return 5;
    } else if( window.matchMedia(MIN_WIDTH.W960).matches) {
        return 5;
    } else if( window.matchMedia(MIN_WIDTH.W720).matches) {
        return 4;
    } else if( window.matchMedia(MIN_WIDTH.W480).matches) {
        return 3;
    } else {
        return 2;
    }
}

function getPaddingDataLabel() {
    if( window.matchMedia(MIN_WIDTH.W1200).matches) {
        return 25;
    } else if( window.matchMedia(MIN_WIDTH.W960).matches) {
        return 20;
    } else if( window.matchMedia(MIN_WIDTH.W720).matches) {
        return 15;
    } else if( window.matchMedia(MIN_WIDTH.W480).matches) {
        return 10;
    } else {
        return 9;
    }
}

function getFontSize() {
    if( window.matchMedia(MIN_WIDTH.W1200).matches) {
        return 22.5;
    } else if( window.matchMedia(MIN_WIDTH.W960).matches) {
        return 18.75;
    } else if( window.matchMedia(MIN_WIDTH.W720).matches) {
        return 15;
    } else if( window.matchMedia(MIN_WIDTH.W480).matches) {
        return 11.25;
    } else {
        return 7.5;
    }
}

function getFontSizeScale() {
    if( window.matchMedia(MIN_WIDTH.W1200).matches) {
        return 20;
    } else if( window.matchMedia(MIN_WIDTH.W960).matches) {
        return 19;
    } else if( window.matchMedia(MIN_WIDTH.W720).matches) {
        return 16.5;
    } else if( window.matchMedia(MIN_WIDTH.W480).matches) {
        return 15;
    } else {
        return 13;
    }
}

function initToast() {
    toastr.options = {
        positionClass: "toast-top-center",
        showDuration: "50",
        hideDuration: "100",
        timeOut: "1500",
    };
}

function initAreaList() {
    const prefList = {
        "沖縄" : [
            { text: "我喜屋", value: "4701" },
            { text: "渡久地", value: "4704" },
            { text: "東", value: "4733" },
            { text: "石川", value: "4707" },
            { text: "那覇", value: "4705" },
            { text: "仲里", value: "4726" },
            { text: "平良", value: "4713" },
            { text: "長山", value: "4714" },
            { text: "石垣", value: "4715" },
            { text: "船越", value: "4737" },
            { text: "白浜", value: "4720" },
            { text: "比川", value: "4717" }
        ]
    };

    var area = $("#area");
    var opts = new Array();
    Object.keys(prefList).forEach(function(prefKey, prefIndex) {
        var $optgroup = $("<optgroup>").prop("label", prefKey);
        Object.keys(this[prefKey]).forEach(function(areaKey, araIndex) {
            $optgroup.append($("<option>")
            .text(this[areaKey].text)
            .val(this[areaKey].value)
            .prop("selected", this[areaKey].value == getDefaultArea()));
        }, this[prefKey]);
        opts.push($optgroup);
    }, prefList);
    area.append(opts);

    area.change(function() {
        resetChart();
        getData();
    });

    $(document).ready(function() {
        area.select2({
            width: "resolve"
        });
    });

    $(document).on( "click", ".ui-widget-overlay", function(){
        $(this).prev().find(".ui-dialog-content").dialog("close");
    });
}

function initClearStorageButton() {
    $("#clearStorage").click(function() {
        localStorage.clear();
        toastr.info("Cleared!");
    });
}

function getDefaultArea() {
    const paramArea = qs("area");
    return String(paramArea).match(/^\d{4}$/g) ? paramArea : "4705";
}

function getDefaultDate() {
    const paramDate = qs("date");
    if (String(paramDate).match(/^\d{8}$/g)) {
        return `${paramDate.substr(0,4)}-${paramDate.substr(4,2)}-${paramDate.substr(6,2)}`
    } else {
        return getTodayStr();
    }
}

function initDatePicker() {
    $("#date").datepicker({
        dateFormat: "yy/mm/dd (D)",
        showButtonPanel: true,
        changeMonth: true,
        changeYear: true,
        minDate: new Date(2020, 1-1, 1),
        maxDate: new Date(2023, 12-1, 31),        
    }).on("change", function() {
        const lastDate = new Date(getDateFromChart(swipe.getPos()));
        const newDate = new Date(this.value + " 09:00"); // APIのデータに合わせる
        if (formatDate(lastDate) == formatDate(newDate)) return;

        dateChangingByDateButton = true;

        // 他の描画済日付が1日以上空いている場合に再描画
        if (getDayDiffABS(lastDate, newDate) > 1) {
            for (var i = 0; lineChart.length > i ; i++) {
                drawChartWithSwipeIndex(EMPTY_CHART_DATA, null, i);
            }
        }

        lastDate < newDate ? swipe.next() : swipe.prev();
    }).val(getDefaultDate());    
}

var dateChangingByDateButton = false;

function initDateButton(id, dateDiff) {
    $("#" + id).click(function() {
        updateDateText(dateDiff);

        dateChangingByDateButton = true;
        dateDiff > 0 ? swipe.next() :swipe.prev();
    });
}

function updateDateText(dateDiff) {
    const date = new Date($("#date").val());
    date.setDate(date.getDate() + dateDiff);
    const formatedDate = formatDate(date)
    $("#date").val(formatedDate);
}

function updateDateButtons() {
    const formatedDate = formatDate(new Date($("#date").val()))
    const formatedMinDate = formatDate($("#date").datepicker("option", "minDate"));
    const formatedMaxDate = formatDate($("#date").datepicker("option", "maxDate"));
    const disablePrev = formatedMinDate == formatedDate;
    const disableNext = formatedMaxDate == formatedDate;
    $("#prevDate").prop("disabled", disablePrev);
    $("#nextDate").prop("disabled", disableNext);

    $("#prevDate").css({ "color" : disablePrev ? "#d3d3d3" : "#444"});
    $("#nextDate").css({ "color" : disableNext ? "#d3d3d3" : "#444"});
}
/* TODO: カレンダーのmin, maxと表示日付を比較してスワイプできないように
function resetSwipeContinuous() {
    if ($("#prevDate").prop("disabled") || $("#nextDate").prop("disabled")) {
        window.swipe.setup({ continuous : false });
    } else {
        window.swipe.setup({ continuous: true });
    }
}
*/
var swipe = null;
function initSwipe() {
    var element = document.getElementById("swipe");
    swipe = new Swipe(element, {
        startSlide: 1, // FIXME: 実行日が カレンダーのminなら0、maxなら2
        continuous: true,
        disableScroll: true,
        callback: function(index, element, direction) {
            if (dateChangingByDateButton) {
                dateChangingByDateButton = false;
                return;
            }
            updateDateText(direction == 1 ? -1 : 1);
        },
        transitionEnd: function(index, element) {
            getData();
            updateDateButtons();
            resetPrevAndNextChart();
            //resetSwipeContinuous();
        }
    });
}

function getEmptyTableData() {
    return {
        destroy: true,
        data: [{d: "", t: 0, l: "?"}],
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        columns: [{
            data: "d",
            render : function(data, type, row) { return ""; }            
        },
        { 
            data: "t",
            render : function(data, type, row) { return ""; }            
        },
        {
            data: "l",
            render : function(data, type, row) { return ""; }            
        }]
    };
}

function getDataTableData(json) {
    var format = getDataTableFormatter(new Date().getHours())
    return {
        destroy: true,
        data: json,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        scrollY: '34.3vh',
        scrollCollapse: true,
        scroller: true,
        columns: [{
            data: "d",
            render : function(data, type, row) {
                return format(data.replace(/-/g, "/"), "", row);
            }
        },
        { 
            data: "t",
            render : function(data, type, row) {
                return format(data, ":00", row);
            }
        },
        {
            data: "l",
            render : function(data, type, row) {
                return format(data, "cm", row);
            }
        },],
        initComplete : function() {
            var $row = $("#dataTable").DataTable().row(new Date().getHours()).node();
            var elmRect = $row.getBoundingClientRect();
            var scrollTo = elmRect.height * new Date().getHours()
            $(".dataTables_scrollBody").scrollTop(scrollTo);
        }
    };
}

function getDataTableFormatter(h) {
    return function(data, suffix, row) {
        const formatedData = data + suffix;
        const todayDateStr = getTodayStr().replace(/\//g, "-").split(" ")[0];
        if (todayDateStr == row.d && row.t == h) {
            return `<span style='color:${COLOR.DEEPPINK};font-weight:bold; animation: flash 2s linear infinite;'>${formatedData}</span>`;
        } else if (todayDateStr == row.d && Math.abs(row.t - h) == 1) {
            return `<span style='color:${COLOR.MIDNIGHTBLUE};'>${formatedData}</span>`;
        } else {
            return formatedData;
        }
    }    
}

function initDataTable() {
    const dateStr = getCurrDateString();
    if (dateStr == getDateFromChart(swipe.getPos())) return;

    const strageKey = getStrageKey(dateStr);
    if (sessionStorage.getItem(strageKey) == null) {
        $("#dataTable").DataTable(getEmptyTableData());
        return;
    }

    const response = JSON.parse(sessionStorage.getItem(strageKey));
    const json = getDataTodayJson(response, dateStr);
    $("#dataTable").DataTable(getDataTableData(json));
}

function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

$(function() {
    initToast();
    initAreaList();
    initDatePicker();
    initDateButton("prevDate", - 1);
    initDateButton("nextDate", + 1);
    initClearStorageButton();
    initSwipe();

    getData();
});

$(document).ajaxSend(function(){
    $.LoadingOverlay("show", {
        image: "",
        maxSize: 50,
        fontawesome: "fa fa-spinner fa-pulse",
        fontawesomeAnimation: "rotate_right",
        fontawesomeColor: COLOR.GRAY,
    });
});

$(document).ajaxComplete(function(){
    $.LoadingOverlay("hide");
});