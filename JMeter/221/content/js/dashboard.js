/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.91939817302526, "KoPercent": 0.08060182697474476};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7834198224471416, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.26260641781270466, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9849377865094957, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9882121807465619, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.41580310880829013, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4246031746031746, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9673846153846154, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.6180392156862745, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9714022140221402, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9676923076923077, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.41492146596858637, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7734119187950229, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4767518009168304, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9836280288146693, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4606153846153846, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4225721784776903, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.39655172413793105, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.375, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.9172932330827067, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9810085134250164, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9803536345776032, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 18610, 15, 0.08060182697474476, 330.84943578721067, 3, 14805, 168.0, 716.9000000000015, 963.0, 1730.8899999999994, 5.0037521419205, 2049.12156330864, 24.191097373208255], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 28, 0, 0.0, 100.10714285714286, 65, 211, 86.5, 177.60000000000002, 202.44999999999993, 211.0, 0.008311503268943919, 3.3593106461451696, 0.03639906208025053], "isController": false}, {"data": ["2.0 Register attendance", 1527, 15, 0.9823182711198428, 1558.1532416502941, 527, 5359, 1467.0, 2227.0, 2610.1999999999975, 3559.4400000000032, 0.44183529178924197, 871.9679836941763, 9.304297672856121], "isController": true}, {"data": ["2.5 Select patient", 1527, 0, 0.0, 153.6037982973149, 67, 2083, 108.0, 261.20000000000005, 389.7999999999997, 960.9200000000003, 0.44284898936466394, 180.12128015322733, 1.840084439930159], "isController": false}, {"data": ["2.3 Search by first/last name", 1527, 0, 0.0, 133.77341191879518, 62, 2668, 95.0, 227.0, 339.7999999999997, 756.0800000000011, 0.44220404690548387, 179.98453825414322, 1.9098974594117788], "isController": false}, {"data": ["4.0 Vaccination for flu", 386, 0, 0.0, 1201.2227979274617, 720, 4129, 1082.5, 1669.8000000000002, 1942.4999999999984, 3189.2299999999996, 0.11561102222307416, 138.16980281609804, 1.9553335968588246], "isController": true}, {"data": ["4.0 Vaccination for hpv", 378, 0, 0.0, 1186.8624338624354, 697, 4805, 1047.0, 1653.1, 2174.5, 3432.869999999997, 0.11617700211700316, 138.6090229273047, 1.9676441238333124], "isController": true}, {"data": ["1.2 Sign-in page", 1625, 0, 0.0, 199.5359999999998, 16, 2812, 125.0, 348.0, 524.0999999999995, 1518.14, 0.45338643395247785, 183.03113067653766, 2.2519864930426805], "isController": false}, {"data": ["7.1 Name search", 29, 0, 0.0, 6612.862068965516, 5592, 9141, 6214.0, 7926.0, 9087.5, 9141.0, 0.008305605023229919, 3.357201569498009, 0.03598321707514969], "isController": false}, {"data": ["2.4 Patient attending session", 1275, 15, 1.1764705882352942, 681.1654901960792, 103, 3939, 577.0, 980.8000000000002, 1261.8000000000004, 2498.840000000001, 0.3690559202213988, 150.606690620205, 1.8787999191550444], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 28.0, 28, 28, 28.0, 28.0, 28.0, 28.0, 35.714285714285715, 11.195591517857142, 21.065848214285715], "isController": false}, {"data": ["1.1 Homepage", 1626, 0, 0.0, 197.45079950799484, 31, 2239, 134.5, 328.29999999999995, 490.64999999999986, 1509.0300000000002, 0.45194184903696916, 182.47112471416625, 2.236402682115749], "isController": false}, {"data": ["1.3 Sign-in", 1625, 0, 0.0, 210.52000000000012, 76, 2958, 133.0, 389.4000000000001, 540.6999999999998, 1453.88, 0.4535029685606625, 183.4069615570592, 2.3640586478411305], "isController": false}, {"data": ["Run some searches", 28, 0, 0.0, 10716.214285714279, 9065, 23075, 9830.0, 13411.700000000003, 19276.099999999977, 23075.0, 0.008268443279512658, 18.52768067406786, 0.18082865129656572], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 382, 0, 0.0, 1200.623036649214, 712, 3202, 1092.0, 1732.7999999999997, 2109.699999999997, 2527.540000000006, 0.11188093525432703, 134.2380623778865, 1.8955084691964255], "isController": true}, {"data": ["2.1 Open session", 1527, 0, 0.0, 546.7622789783887, 212, 3107, 466.0, 886.0, 1113.1999999999998, 1756.16, 0.44199413163783574, 178.18405036714168, 1.839727418318645], "isController": false}, {"data": ["4.3 Vaccination confirm", 1527, 0, 0.0, 846.251473477408, 466, 4480, 724.0, 1257.2000000000003, 1603.3999999999996, 2552.32, 0.4420138347146145, 178.56709066745464, 2.664466421982677], "isController": false}, {"data": ["4.1 Vaccination questions", 1527, 0, 0.0, 181.25802226588067, 83, 1774, 133.0, 300.0, 419.0, 866.0400000000002, 0.4417621768836586, 174.3985963260872, 2.521635635760721], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 32.0, 32, 32, 32.0, 32.0, 32.0, 32.0, 31.25, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1625, 0, 0.0, 980.7796923076925, 470, 5809, 815.0, 1404.8000000000002, 1890.3999999999942, 4454.06, 0.45329992582618445, 754.1135162151835, 8.707093669181853], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 381, 0, 0.0, 1211.9028871391076, 712, 4650, 1061.0, 1753.6000000000001, 2238.6, 3402.680000000001, 0.11148474268385034, 133.41176763979047, 1.8890560776485381], "isController": true}, {"data": ["7.0 Open Children Search", 29, 0, 0.0, 1445.655172413793, 774, 1954, 1423.0, 1625.0, 1821.0, 1954.0, 0.008262922783841371, 4.007052593806256, 0.03433219930654133], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.525213068181818, 14.026988636363637], "isController": false}, {"data": ["7.5 year group", 28, 0, 0.0, 1495.1785714285713, 1347, 2220, 1427.5, 1722.1000000000001, 2048.999999999999, 2220.0, 0.008309285864361592, 4.127780337128501, 0.03656671186201006], "isController": false}, {"data": ["7.2 No Consent search", 28, 0, 0.0, 2304.7142857142853, 1545, 14805, 1697.5, 2476.9000000000033, 10192.49999999997, 14805.0, 0.008300558479361403, 4.411353979595301, 0.03647272112243116], "isController": false}, {"data": ["1.4 Open Sessions list", 1596, 0, 0.0, 380.016917293234, 193, 3289, 299.5, 615.3, 786.1999999999989, 1731.2599999999989, 0.44544946576765515, 204.88390291226892, 1.850427657914766], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1527, 0, 0.0, 172.67321545514042, 78, 1803, 123.0, 277.60000000000014, 409.0, 849.0400000000009, 0.4415230608333191, 175.4705688858923, 2.294982569850712], "isController": false}, {"data": ["2.2 Session register", 1527, 0, 0.0, 155.26064178127075, 60, 2084, 99.0, 321.0, 448.39999999999964, 781.3600000000004, 0.44215244559237427, 183.8854448720125, 1.8442719138910284], "isController": false}, {"data": ["7.3 Due vaccination", 28, 0, 0.0, 293.64285714285717, 223, 467, 268.5, 439.1, 467.0, 467.0, 0.008309845653520392, 3.3585496728072473, 0.03627819161509863], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 15, 100.0, 0.08060182697474476], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 18610, 15, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 15, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1275, 15, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
