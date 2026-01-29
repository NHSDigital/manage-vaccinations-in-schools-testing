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

    var data = {"OkPercent": 99.91929358146601, "KoPercent": 0.08070641853399164};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7745603571016277, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.2510769230769231, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.979064039408867, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6153846153846154, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9831701346389229, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.32389162561576357, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.3041958041958042, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.38461538461538464, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9591044776119403, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.475973487986744, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9624776652769506, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9587813620071685, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.3324607329842932, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8298780487804878, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4230769230769231, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.4333122629582807, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9621875, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.36538461538461536, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.43608124253285546, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.2979002624671916, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5740740740740741, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8697504564820451, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.964017521902378, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9712713936430318, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.7692307692307693, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21064, 17, 0.08070641853399164, 347.08027914926083, 0, 60003, 176.0, 807.0, 1082.0, 1990.9900000000016, 5.491129443261935, 2160.673511519064, 41.51022627626267], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 26, 0, 0.0, 169.53846153846158, 98, 474, 121.5, 385.3, 445.64999999999986, 474.0, 0.007723072024181533, 3.3077751554193986, 0.05698753434910543], "isController": false}, {"data": ["2.0 Register attendance", 1625, 16, 0.9846153846153847, 1597.1440000000016, 525, 6178, 1492.0, 2412.4, 2799.8999999999987, 3673.32, 0.4562771379602362, 922.7519605460844, 16.132409243142927], "isController": true}, {"data": ["2.5 Select patient", 1624, 0, 0.0, 168.44211822660105, 71, 2394, 116.0, 298.5, 440.0, 843.5, 0.45537608765204557, 191.97642085436013, 3.259529676539271], "isController": false}, {"data": ["7.1 Full name search", 26, 0, 0.0, 811.0384615384617, 291, 4805, 559.5, 1287.2000000000003, 3711.9499999999953, 4805.0, 0.007593171869400948, 3.26088457915137, 0.05562346338660138], "isController": false}, {"data": ["2.3 Search by first/last name", 1634, 0, 0.0, 155.1603427172582, 74, 1835, 109.0, 270.5, 395.25, 663.5500000000006, 0.45715219363109216, 194.45937588172808, 3.393997723628977], "isController": false}, {"data": ["4.0 Vaccination for flu", 406, 0, 0.0, 1510.5221674876848, 225, 5107, 1358.5, 2214.6000000000004, 2715.7999999999993, 4307.390000000001, 0.11569080805185228, 142.62790908018613, 3.2564592683938414], "isController": true}, {"data": ["4.0 Vaccination for hpv", 429, 0, 0.0, 1501.2587412587422, 231, 4231, 1350.0, 2170.0, 2684.0, 3908.1999999999985, 0.12315154270990233, 152.10411392267662, 3.4823163673962174], "isController": true}, {"data": ["7.6 First name search", 26, 0, 0.0, 1983.2307692307695, 692, 9223, 1288.0, 6392.300000000003, 9119.4, 9223.0, 0.007714078281873013, 3.9846172586813795, 0.056451499698409215], "isController": false}, {"data": ["1.2 Sign-in page", 1675, 0, 0.0, 225.23104477611966, 16, 4834, 141.0, 429.0, 608.0, 1291.9600000000003, 0.46566660939662397, 195.11403485669214, 3.9203182791311297], "isController": false}, {"data": ["2.4 Patient attending session", 1207, 16, 1.3256006628003314, 829.5393537696768, 109, 5301, 706.0, 1258.4, 1620.7999999999993, 2507.2000000000044, 0.37521119229806754, 160.09211636831625, 3.2620242393191488], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 32.0, 32, 32, 32.0, 32.0, 32.0, 32.0, 31.25, 9.796142578125, 18.4326171875], "isController": false}, {"data": ["1.1 Homepage", 1679, 0, 0.0, 229.59976176295405, 29, 5205, 149.0, 394.0, 598.0, 1411.000000000002, 0.4664145416886818, 195.22447134114944, 3.9183152794757876], "isController": false}, {"data": ["1.3 Sign-in", 1674, 0, 0.0, 237.47132616487474, 83, 5403, 149.0, 432.0, 626.5, 1252.5, 0.4660609359361101, 195.48577176682406, 4.0828382356677215], "isController": false}, {"data": ["Run some searches", 26, 1, 3.8461538461538463, 13618.423076923078, 7652, 82053, 9638.0, 21927.2, 61338.24999999991, 82053.0, 0.007570514244650485, 29.792691647113145, 0.4436505036976139], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 382, 0, 0.0, 1497.6649214659672, 236, 7925, 1317.0, 2093.7, 2602.999999999998, 4543.0, 0.11039907241658946, 137.07602576940494, 3.1213474447925162], "isController": true}, {"data": ["2.1 Open session", 1640, 0, 0.0, 476.8853658536583, 126, 4377, 400.5, 817.8000000000002, 994.7999999999993, 1690.3399999999979, 0.4578026033335846, 192.11052577643252, 3.279880484995101], "isController": false}, {"data": ["7.7 Partial name search", 26, 0, 0.0, 1620.2307692307693, 390, 5159, 753.0, 4860.900000000001, 5133.8, 5159.0, 0.0077344236887548915, 3.995913130987671, 0.056592833907713455], "isController": false}, {"data": ["4.3 Vaccination confirm", 1582, 0, 0.0, 1071.5341340075827, 567, 7619, 904.5, 1632.0, 2035.3999999999996, 3615.760000000002, 0.4552317552637251, 190.6989033895594, 4.657937059264009], "isController": false}, {"data": ["4.1 Vaccination questions", 1600, 0, 0.0, 227.12937500000004, 92, 3451, 153.0, 422.8000000000002, 597.9499999999998, 1108.98, 0.4547945579283198, 186.36019251320397, 4.2349334468566875], "isController": false}, {"data": ["7.7 Last name search", 26, 0, 0.0, 1404.5769230769229, 690, 5497, 1207.5, 1945.3000000000002, 4317.849999999995, 5497.0, 0.007733439063325862, 3.997781339538724, 0.05661641908011932], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1674, 0, 0.0, 1131.6254480286748, 402, 15227, 975.5, 1598.0, 1971.5, 2992.0, 0.4661016831171232, 804.6450779534356, 15.196595382495738], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 381, 0, 0.0, 1539.6797900262477, 543, 6387, 1385.0, 2243.0, 2819.4999999999973, 4293.18, 0.10963457730690862, 135.78591723666696, 3.0999113225145685], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 1312.5185185185185, 343, 5080, 658.0, 4739.799999999999, 5071.6, 5080.0, 0.007546142565638164, 3.861103335216841, 0.054009724951488085], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 26, 0, 0.0, 1912.6923076923078, 1710, 2398, 1875.0, 2290.7000000000003, 2379.7999999999997, 2398.0, 0.0077250087054905785, 3.993603182124211, 0.05719042371152797], "isController": false}, {"data": ["7.2 No Consent search", 26, 1, 3.8461538461538463, 5147.615384615384, 2667, 60003, 2859.5, 3514.2000000000003, 40274.54999999992, 60003.0, 0.007588424850223464, 3.7741166663042707, 0.05443663050514685], "isController": false}, {"data": ["Debug Sampler", 1633, 0, 0.0, 0.26148193508879364, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.45712526155934863, 2.6148583971048267, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1643, 0, 0.0, 447.58064516128997, 270, 2981, 376.0, 660.6000000000001, 800.3999999999999, 1251.5999999999995, 0.45832224489192464, 219.16038783671902, 3.2802006407271063], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1598, 0, 0.0, 223.89236545682098, 89, 3087, 151.0, 419.10000000000014, 571.1499999999999, 969.1099999999999, 0.45558761964876987, 187.89654074100486, 4.009828784370779], "isController": false}, {"data": ["2.2 Session register", 1636, 0, 0.0, 182.39975550122253, 70, 2999, 109.0, 370.0, 519.1499999999999, 1009.9299999999987, 0.457223857471362, 198.48404946206327, 3.279746513685554], "isController": false}, {"data": ["7.3 Due vaccination", 26, 0, 0.0, 569.4999999999999, 399, 1624, 479.5, 796.4000000000002, 1402.4499999999991, 1624.0, 0.007721766918465566, 3.9625271909214295, 0.056872333113312475], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 1, 5.882352941176471, 0.00474743638435245], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, 94.11764705882354, 0.0759589821496392], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21064, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1207, 16, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.2 No Consent search", 26, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
