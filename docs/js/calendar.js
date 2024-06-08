const peakBorder = 35;
const calendarDateFrom = "2021-01-01";
const calendarDateTo = "2025-12-31";

async function getDataAndDrawCalendar() {
    const year = new Date().getFullYear();
    const area = $("#area option:selected").val();
    const strageKey = area + year;
    if (sessionStorage.getItem(strageKey) != null) {
        drawCalendar(JSON.parse(sessionStorage.getItem(strageKey)));
    } else {
        await getJsonData(year, area)
        .then((response) => {
            let event = createEvents(response);
            sessionStorage.setItem(strageKey, JSON.stringify(event));
            drawCalendar(event);
        }, (response) => {
            for (let key in response) {
                if (response.warn) toastr.warning(response.warn);
                else toastr.error(response.error);
            }
        });
    }        
}

function getJsonData(year, area) {
    return new Promise((resolve, reject) => {
        const areaPref = area.substr(0, 2);
        const areaPoi = area.substr(2);
        const json_url = `https://churageographic.github.io/data/${areaPref}/${areaPoi}/${year}.json`;
        //console.log(json_url);
        $.get(json_url, function (response) {
            if (response.warn || response.error) reject(response);    
            else resolve(response);
        }, "json")
        .fail(function(jqXHR) {
            toastr.error(`「 ${$("#area option:selected").text()}の情報を取得できませんでした`)
        });
    });
}

function createEvents(data) {
    let events = [];
    for (let i = 0; i < data.length; i++) {
        const tmpLevel = data[i].l;
        if (tmpLevel >= peakBorder) continue;
        const tmpTime = String(data[i].t).padStart(2, "0");
        const tmpDateTime = data[i].d + " " + tmpTime + ":00";
        const event = { 
            id: i + 1,
            title: tmpLevel + "cm",
            start: tmpDateTime,
            backgroundColor: getTidesColor(tmpLevel)
        };
        events.push(event);
    }
    return events;
}

function getTidesColor(level) {
    const lineColor = "#15A0C8";
    const lineColorPeak = "#228b22";
    const lineColorPeakMid = "#ff8c00";
    const lineColorPeakHigh = "#ff1493";
    const peakBorderMid = 15;
    const peakBorderHigh = 0;

    return level <= peakBorderHigh
        ? lineColorPeakHigh : level <= peakBorderMid
        ? lineColorPeakMid : level <= peakBorder
        ? lineColorPeak : lineColor;
}

function getCalendarHeight() {
    return window.innerHeight - 100;
}

var calendar;
var tmpY = new Date().getFullYear();

function drawCalendar(events) {
    if (calendar) calendar.destroy();
    calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
        height: getCalendarHeight(),
        windowResize: function () {
            calendar.setOption("height", getCalendarHeight());
        },
        locale: "ja",
        timeZone: "Asia/Tokyo",
        headerToolbar: {
            center: "title",
            right: "prevYear,prev,next,nextYear",
            left: "areaList dayGridMonth,listMonth,today"
        },
        buttonText: {
            today: "今日",
            month: "月",
            week: "週",
            day: "日",
            list: "一覧"
        },
        events: events,
        eventSources: [{
            url:"../data/holidays.json",
            display: "background",
            backgroundColor: "#ffccff"
        }],
        dayCellContent: function(e) {
            return {html:e.dayNumberText.replace("日", "") }
        },            
        validRange: function() {
            return {
                start: calendarDateFrom,
                end: calendarDateTo
        }},
        customButtons: {
            areaList: {
                text: $("#area option:selected").text(),
                click: function() {
                    $("#areaDialog").dialog({
                        modal: true,
                        title: "エリア選択",
                        closeOnEscape: true,
                        position: {my: "left top", at: "left top", of: ".fc-view-harness"},
                        open: function(event, ui) {
                            $("#area").select2("open");
                        }
                    });
                }
            }
        },
        datesSet: async info => {
            let midDate = new Date((info.start.getTime() + info.end.getTime()) / 2);
            let year = midDate.getFullYear();
            if (tmpY != year) {
                tmpY = year;
                const area = $("#area option:selected").val();
                const strageKey = area + year;
                if (sessionStorage.getItem(strageKey) == null) {
                    await getJsonData(year, area)
                    .then((response) => {
                        let events = createEvents(response);
                        sessionStorage.setItem(strageKey, /*JSON.stringify(events)*/null);
                        info.view.calendar.batchRendering(function() {
                            events.forEach( async event => {
                                await info.view.calendar.addEvent(event);
                            });
                        });
                    }, (response) => {
                        for (let key in response) {
                            if (response.warn) toastr.warning(response.warn);
                            else toastr.error(response.error);
                        }
                    });
                }
            }
        }
    }).render();
}

function initToast() {
    toastr.options = {
        positionClass: "toast-top-center",
        showDuration: "300",
        hideDuration: "300",
        timeOut: "3000",
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
            .prop("selected", this[areaKey].value == "4704"));
        }, this[prefKey]);
        opts.push($optgroup);
    }, prefList);
    area.append(opts);

    area.change(function() {
        $(".fc-areaList-button").text($("#area option:selected").text());
        $("#areaDialog").dialog("close");
        getDataAndDrawCalendar();
    });

    $(document).ready(function() {
        area.select2();
    });

    $(document).on( "click", ".ui-widget-overlay", function(){
        $(this).prev().find(".ui-dialog-content").dialog("close");
    });
}

$(document).ajaxStart(function() {
    $.LoadingOverlay("show", {
        image: "",
        maxSize: 50,
        fontawesome: "fa fa-spinner fa-pulse",
        fontawesomeAnimation: "rotate_right",
        fontawesomeColor: "#15A0C8",
    });
});

$(document).ajaxStop(function() {
    $.LoadingOverlay("hide");
});

const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );

$(function() {
    initToast();
    initAreaList();
    getDataAndDrawCalendar();
});
